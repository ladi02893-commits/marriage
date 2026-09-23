import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireAdmin, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

async function ownProfileId(userId: string) {
  return insforgeAdmin.database.from('matrimonial_profiles').select('id').eq('user_id', userId).maybeSingle();
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    let urlOrigin = '';
    try { urlOrigin = new URL(url).origin; } catch { /* Invalid URL is rejected below. */ }
    if (!key.startsWith(`${auth.user.id}/avatars/`) || urlOrigin !== new URL(process.env.INSFORGE_URL!).origin) {
      return NextResponse.json({ success: false, error: 'Upload a photo through your account first.' }, { status: 400 });
    }
    const { data: profile, error: profileError } = await ownProfileId(auth.user.id);
    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    const { data: photos, error: photoError } = await insforgeAdmin.database.from('profile_photos')
      .select('id').eq('profile_id', profile.id);
    if (photoError) throw photoError;
    if ((photos ?? []).length >= 5) return NextResponse.json({ success: false, error: 'A profile can have at most five photos.' }, { status: 409 });
    const { data: photo, error } = await insforgeAdmin.database.from('profile_photos').insert([{
      profile_id: profile.id,
      url,
      storage_key: key,
      is_primary: (photos ?? []).length === 0,
      is_approved: false,
      order_num: (photos ?? []).length + 1,
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: photo, message: 'Photo uploaded for moderation.' }, { status: 201 });
  } catch (error) {
    console.error('Profile photo save failed:', error);
    return NextResponse.json({ success: false, error: 'Photo could not be saved.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const photoId = request.nextUrl.searchParams.get('id');
  if (!photoId) return NextResponse.json({ success: false, error: 'Photo ID is required.' }, { status: 400 });
  try {
    const { data: profile, error: profileError } = await ownProfileId(auth.user.id);
    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    const { data: photo, error: photoError } = await insforgeAdmin.database.from('profile_photos')
      .select('id,storage_key,is_primary').eq('id', photoId).eq('profile_id', profile.id).maybeSingle();
    if (photoError) throw photoError;
    if (!photo) return NextResponse.json({ success: false, error: 'Photo not found.' }, { status: 404 });
    const { data: countRows, error: countError } = await insforgeAdmin.database.from('profile_photos')
      .select('id').eq('profile_id', profile.id);
    if (countError) throw countError;
    if ((countRows ?? []).length <= 1) {
      return NextResponse.json({ success: false, error: 'Keep at least one profile photo.' }, { status: 409 });
    }
    const { error } = await insforgeAdmin.database.from('profile_photos').delete().eq('id', photo.id).eq('profile_id', profile.id);
    if (error) throw error;
    if (photo.is_primary) {
      const { data: replacement } = await insforgeAdmin.database.from('profile_photos')
        .select('id').eq('profile_id', profile.id).order('order_num', { ascending: true }).limit(1).maybeSingle();
      if (replacement) await insforgeAdmin.database.from('profile_photos').update({ is_primary: true }).eq('id', replacement.id);
    }
    if (photo.storage_key) {
      const { error: storageError } = await insforgeAdmin.storage.from('profile-photos').remove(photo.storage_key);
      if (storageError) console.error('Removed photo record but storage cleanup failed:', storageError);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile photo deletion failed:', error);
    return NextResponse.json({ success: false, error: 'Photo could not be deleted.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (typeof body.id !== 'string' || typeof body.isApproved !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Photo ID and review decision are required.' }, { status: 400 });
    }
    const { data, error } = await insforgeAdmin.database.from('profile_photos')
      .update({ is_approved: body.isApproved }).eq('id', body.id).select('id,is_approved').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Photo not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Profile photo review failed:', error);
    return NextResponse.json({ success: false, error: 'Photo review could not be saved.' }, { status: 500 });
  }
}
