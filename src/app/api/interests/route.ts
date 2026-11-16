import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

const INTEREST_SELECT =
  '*,sender:users!sender_id(name,avatar_url,profile_id_code,profile:matrimonial_profiles(display_name,photos:profile_photos(url,is_primary,is_approved))),receiver:users!receiver_id(name,avatar_url,profile_id_code,profile:matrimonial_profiles(display_name,photos:profile_photos(url,is_primary,is_approved)))';

function extractPhoto(user: Record<string, any> | undefined): string | null {
  if (!user) return null;
  if (typeof user.avatar_url === 'string' && user.avatar_url) return user.avatar_url;
  const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
  const photos = Array.isArray(profile?.photos) ? profile.photos : [];
  const primary =
    photos.find((p: Record<string, any>) => p.is_primary && p.is_approved) ??
    photos.find((p: Record<string, any>) => p.is_approved) ??
    photos.find((p: Record<string, any>) => p.is_primary) ??
    photos[0];
  return typeof primary?.url === 'string' ? primary.url : null;
}

function mapInterest(interest: Record<string, any>) {
  const sender = Array.isArray(interest.sender) ? interest.sender[0] : interest.sender;
  const receiver = Array.isArray(interest.receiver) ? interest.receiver[0] : interest.receiver;
  return {
    ...interest,
    senderId: interest.sender_id,
    senderProfileId: interest.sender_profile_id,
    senderProfileIdCode: sender?.profile_id_code ?? undefined,
    receiverId: interest.receiver_id,
    receiverProfileId: interest.receiver_profile_id,
    receiverProfileIdCode: receiver?.profile_id_code ?? undefined,
    senderName: sender?.name ?? 'Unknown',
    senderPhoto: extractPhoto(sender),
    receiverName: receiver?.name ?? 'Unknown',
    receiverPhoto: extractPhoto(receiver),
    createdAt: interest.created_at,
    updatedAt: interest.updated_at,
  };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    let query = insforgeAdmin.database
      .from('interest_requests')
      .select(INTEREST_SELECT);
    if (!ADMIN_ROLES.has(auth.user.role)) {
      query = query.or(`sender_id.eq.${auth.user.id},receiver_id.eq.${auth.user.id}`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data ?? []).map(mapInterest), total: data?.length ?? 0 });
  } catch (error) {
    console.error('Interest fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Interest requests could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const receiverId = typeof body.receiverId === 'string' ? body.receiverId : '';
    if (!receiverId || receiverId === auth.user.id) {
      return NextResponse.json({ success: false, error: 'A valid recipient is required.' }, { status: 400 });
    }
    if ((auth.user.remaining_connections ?? 0) <= 0) {
      return NextResponse.json({ success: false, error: 'No connection credits remain.' }, { status: 402 });
    }

    const [{ data: senderProfile, error: senderError }, { data: receiverProfile, error: receiverError }] = await Promise.all([
      insforgeAdmin.database.from('matrimonial_profiles').select('id,gender').eq('user_id', auth.user.id).maybeSingle(),
      insforgeAdmin.database.from('matrimonial_profiles').select('id,gender,approval_status,user:users(account_status)').eq('user_id', receiverId).maybeSingle(),
    ]);
    if (senderError || receiverError) throw senderError ?? receiverError;
    const receiverUser = Array.isArray(receiverProfile?.user) ? receiverProfile.user[0] : receiverProfile?.user;
    if (!senderProfile || !receiverProfile || receiverProfile.approval_status !== 'APPROVED' || receiverUser?.account_status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Recipient profile is unavailable.' }, { status: 404 });
    }
    if (senderProfile?.gender && receiverProfile?.gender && senderProfile.gender === receiverProfile.gender) {
      return NextResponse.json({ success: false, error: 'Connections are strictly permitted between opposite genders only.' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await insforgeAdmin.database
      .from('interest_requests')
      .select('id,status')
      .or(`and(sender_id.eq.${auth.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${auth.user.id})`)
      .in('status', ['PENDING', 'ACCEPTED'])
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json({ success: false, error: 'An active interest request already exists.' }, { status: 409 });
    }

    const { data: interest, error } = await insforgeAdmin.database.from('interest_requests').insert([{
      sender_id: auth.user.id,
      sender_profile_id: senderProfile.id,
      receiver_id: receiverId,
      receiver_profile_id: receiverProfile.id,
      message: typeof body.message === 'string' ? body.message.trim().slice(0, 500) : '',
      status: 'PENDING',
    }]).select(INTEREST_SELECT).single();
    if (error || !interest) throw error ?? new Error('Interest insert failed.');

    const used = Number(auth.user.used_connections ?? 0) + 1;
    const total = Number(auth.user.total_connections ?? 3);
    const { data: charged, error: creditError } = await insforgeAdmin.database.from('users').update({
      used_connections: used,
      remaining_connections: Math.max(0, total - used),
    }).eq('id', auth.user.id)
      .eq('used_connections', auth.user.used_connections ?? 0)
      .eq('remaining_connections', auth.user.remaining_connections ?? 0)
      .select('id').maybeSingle();
    if (creditError || !charged) {
      const { error: rollbackError } = await insforgeAdmin.database.from('interest_requests').delete().eq('id', interest.id);
      if (rollbackError) console.error('Interest rollback failed:', rollbackError);
      if (creditError) throw creditError;
      return NextResponse.json({ success: false, error: 'Connection balance changed. Please try again.' }, { status: 409 });
    }
    const { error: notificationError } = await insforgeAdmin.database.from('notifications').insert([{
      user_id: receiverId,
      title: 'New interest request',
      description: `${auth.user.name} sent you an interest request.`,
      type: 'INTEREST',
      link_url: '/dashboard/connections',
    }]);
    if (notificationError) console.error('Interest notification failed:', notificationError.message);
    return NextResponse.json({ success: true, data: mapInterest(interest) }, { status: 201 });
  } catch (error) {
    console.error('Interest creation failed:', error);
    return NextResponse.json({ success: false, error: 'Interest request could not be sent.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';
    if (!id || !['ACCEPTED', 'DECLINED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid ID and status are required.' }, { status: 400 });
    }
    const { data: interest, error } = await insforgeAdmin.database.from('interest_requests').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!interest) return NextResponse.json({ success: false, error: 'Interest request not found.' }, { status: 404 });
    if (interest.status !== 'PENDING') return NextResponse.json({ success: false, error: 'This request has already been resolved.' }, { status: 409 });
    const canResolve = interest.receiver_id === auth.user.id && ['ACCEPTED', 'DECLINED'].includes(status);
    const canCancel = interest.sender_id === auth.user.id && status === 'CANCELLED';
    if (!canResolve && !canCancel) return NextResponse.json({ success: false, error: 'You cannot perform this action.' }, { status: 403 });

    const { data: updated, error: updateError } = await insforgeAdmin.database
      .from('interest_requests').update({ status }).eq('id', id).eq('status', 'PENDING').select(INTEREST_SELECT).single();
    if (updateError) throw updateError;
    if (status === 'ACCEPTED' || status === 'DECLINED') {
      const isAccepted = status === 'ACCEPTED';
      const { error: notificationError } = await insforgeAdmin.database.from('notifications').insert([{
        user_id: interest.sender_id,
        title: isAccepted ? 'Interest accepted' : 'Interest declined',
        description: isAccepted
          ? `${auth.user.name} accepted your interest request.`
          : `${auth.user.name} politely declined your interest request.`,
        type: isAccepted ? 'INTEREST_ACCEPTED' : 'INTEREST_DECLINED',
        link_url: '/dashboard/connections',
      }]);
      if (notificationError) console.error('Interest status notification failed:', notificationError.message);
    }
    return NextResponse.json({ success: true, data: mapInterest(updated) });
  } catch (error) {
    console.error('Interest update failed:', error);
    return NextResponse.json({ success: false, error: 'Interest request could not be updated.' }, { status: 500 });
  }
}
