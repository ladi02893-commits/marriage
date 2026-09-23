import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

const FAVORITE_SELECT = 'id,user_id,target_profile_id,created_at,targetProfile:matrimonial_profiles!target_profile_id(*,photos:profile_photos(*),educationCareer:education_careers(*))';

function mapFavorite(row: Record<string, any>) {
  const profile = Array.isArray(row.targetProfile) ? row.targetProfile[0] : row.targetProfile;
  return {
    id: row.id,
    userId: row.user_id,
    targetProfileId: row.target_profile_id,
    createdAt: row.created_at,
    targetProfile: profile ? {
      ...profile,
      userId: profile.user_id,
      fullName: profile.display_name,
      displayName: profile.display_name,
      dateOfBirth: undefined,
      full_name: undefined,
      date_of_birth: undefined,
    } : null,
  };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await insforgeAdmin.database.from('favorites')
    .select(FAVORITE_SELECT).eq('user_id', auth.user.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: 'Favorites could not be loaded.' }, { status: 503 });
  return NextResponse.json({ success: true, data: (data ?? []).map(mapFavorite) });
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (typeof body.targetProfileId !== 'string') return NextResponse.json({ success: false, error: 'Profile ID is required.' }, { status: 400 });
    const { data: target, error: targetError } = await insforgeAdmin.database.from('matrimonial_profiles')
      .select('id,user_id,approval_status').eq('id', body.targetProfileId).maybeSingle();
    if (targetError) throw targetError;
    if (!target || target.user_id === auth.user.id || target.approval_status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Profile is unavailable.' }, { status: 404 });
    }
    const { data, error } = await insforgeAdmin.database.from('favorites').insert([{
      user_id: auth.user.id, target_profile_id: target.id,
    }]).select(FAVORITE_SELECT).single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapFavorite(data) }, { status: 201 });
  } catch (error) {
    console.error('Favorite creation failed:', error);
    return NextResponse.json({ success: false, error: 'Favorite could not be saved.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const targetProfileId = request.nextUrl.searchParams.get('targetProfileId');
  if (!targetProfileId) return NextResponse.json({ success: false, error: 'Profile ID is required.' }, { status: 400 });
  const { error } = await insforgeAdmin.database.from('favorites').delete()
    .eq('user_id', auth.user.id).eq('target_profile_id', targetProfileId);
  if (error) return NextResponse.json({ success: false, error: 'Favorite could not be removed.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
