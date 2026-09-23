import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, signAuthToken } from '@/lib/auth';
import { rejectCrossSiteMutation, requireAdmin } from '@/lib/api-auth';
import { toSafeUser } from '@/lib/user-dto';

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  if (auth.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Only a super administrator can switch accounts.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (typeof body.userId !== 'string' || !body.userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }
    const { data: targetUser, error } = await insforgeAdmin.database
      .from('users')
      .select('id,email,name,role,is_verified,subscription_tier,account_status,avatar_url,phone,profile_id_code,whatsapp_number,is_whatsapp_verified,is_email_verified,total_connections,used_connections,remaining_connections,assigned_consultant_id,session_version,created_at,profile:matrimonial_profiles(id,photos:profile_photos(url,is_primary))')
      .eq('id', body.userId)
      .maybeSingle();
    if (error) throw error;
    if (!targetUser || targetUser.account_status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Active user not found.' }, { status: 404 });
    }
    if (targetUser.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Only member accounts can be switched into.' }, { status: 403 });
    }

    const token = await signAuthToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      sessionVersion: targetUser.session_version ?? 0,
    });
    const response = NextResponse.json({
      success: true,
      user: toSafeUser(targetUser),
      redirectUrl: ['SUPER_ADMIN', 'ADMIN'].includes(targetUser.role) ? '/admin' : '/dashboard',
    });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error('Account switch error:', error);
    return NextResponse.json({ success: false, error: 'Unable to switch account.' }, { status: 500 });
  }
}
