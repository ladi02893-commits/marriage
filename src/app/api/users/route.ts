import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireAdmin } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { toSafeUser } from '@/lib/user-dto';

const USER_SELECT = 'id,email,name,role,is_verified,subscription_tier,account_status,avatar_url,phone,last_login_at,profile_id_code,whatsapp_number,is_whatsapp_verified,is_email_verified,total_connections,used_connections,remaining_connections,assigned_consultant_id,session_version,created_at,updated_at,profile:matrimonial_profiles(id,display_name,approval_status,photos:profile_photos(url,is_primary,is_approved))';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const { data, error } = await insforgeAdmin.database.from('users').select(USER_SELECT).order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data ?? []).map(toSafeUser), total: data?.length ?? 0 });
  } catch (error) {
    console.error('Users fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Users could not be loaded.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    const { data: current, error: currentError } = await insforgeAdmin.database.from('users')
      .select('id,role,session_version,total_connections,used_connections').eq('id', body.id).maybeSingle();
    if (currentError) throw currentError;
    if (!current) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

    const update: Record<string, unknown> = {};
    if (typeof body.isVerified === 'boolean') update.is_verified = body.isVerified;
    if (typeof body.accountStatus === 'string' && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(body.accountStatus)) {
      update.account_status = body.accountStatus;
      update.session_version = current.session_version + 1;
    }
    if (typeof body.subscriptionTier === 'string' && ['FREE', 'BASIC', 'PREMIUM', 'PREMIUM_PLUS', 'VIP'].includes(body.subscriptionTier.toUpperCase())) {
      update.subscription_tier = body.subscriptionTier.toUpperCase() === 'VIP' ? 'PREMIUM_PLUS' : body.subscriptionTier.toUpperCase();
    }
    if (typeof body.role === 'string') {
      if (auth.user.role !== 'SUPER_ADMIN') return NextResponse.json({ success: false, error: 'Only a super administrator can change roles.' }, { status: 403 });
      if (!['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN', 'BUREAU'].includes(body.role)) return NextResponse.json({ success: false, error: 'Invalid role.' }, { status: 400 });
      update.role = body.role;
      update.session_version = current.session_version + 1;
    }
    if (typeof body.phone === 'string') update.phone = body.phone.trim().slice(0, 30);
    if (typeof body.whatsappNumber === 'string') update.whatsapp_number = body.whatsappNumber.trim().slice(0, 30);
    if (typeof body.assignedConsultantId === 'string' || body.assignedConsultantId === null) {
      update.assigned_consultant_id = body.assignedConsultantId;
    }
    let nextTotal = Number(current.total_connections ?? 0);
    let nextUsed = Number(current.used_connections ?? 0);
    let connectionsChanged = false;
    if (typeof body.totalConnections === 'number' && Number.isInteger(body.totalConnections) && body.totalConnections >= nextUsed) {
      nextTotal = body.totalConnections;
      connectionsChanged = true;
    }
    if (typeof body.addConnections === 'number' && Number.isInteger(body.addConnections) && body.addConnections > 0) {
      nextTotal += body.addConnections;
      connectionsChanged = true;
    }
    if (typeof body.refundConnection === 'number' && Number.isInteger(body.refundConnection) && body.refundConnection > 0) {
      if (nextUsed >= body.refundConnection) {
        nextUsed -= body.refundConnection;
      } else {
        nextTotal += body.refundConnection;
      }
      connectionsChanged = true;
    }
    if (connectionsChanged) {
      update.total_connections = nextTotal;
      update.used_connections = nextUsed;
      update.remaining_connections = Math.max(0, nextTotal - nextUsed);
    }
    if (!Object.keys(update).length) return NextResponse.json({ success: false, error: 'No valid changes supplied.' }, { status: 400 });

    const { data, error } = await insforgeAdmin.database.from('users').update(update).eq('id', body.id).select(USER_SELECT).single();
    if (error) throw error;
    if (typeof body.isVerified === 'boolean') {
      await insforgeAdmin.database
        .from('matrimonial_profiles')
        .update({
          verification_badge: body.isVerified ? 'APPROVED' : 'UNVERIFIED',
          is_identity_verified: body.isVerified,
        })
        .eq('user_id', body.id);
    }
    return NextResponse.json({ success: true, data: toSafeUser(data) });
  } catch (error) {
    console.error('User update failed:', error);
    return NextResponse.json({ success: false, error: 'User could not be updated.' }, { status: 500 });
  }
}
