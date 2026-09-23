import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, hashPassword, signAuthToken, verifyPassword } from '@/lib/auth';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { checkRateLimit } from '@/lib/rate-limit';

const BLOCKED_PASSWORDS = new Set(['password', 'password123', 'admin123', '12345678', 'qwerty123']);

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const limit = checkRateLimit(`password:${auth.user.id}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!currentPassword || newPassword.length < 8 || newPassword.length > 128 ||
      currentPassword === newPassword || BLOCKED_PASSWORDS.has(newPassword.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Choose a different password of 8 to 128 characters.' }, { status: 400 });
    }

    const { data: user, error: lookupError } = await insforgeAdmin.database.from('users')
      .select('id,email,role,password_hash,session_version').eq('id', auth.user.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!user || !(await verifyPassword(currentPassword, user.password_hash ?? ''))) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 403 });
    }

    const sessionVersion = (user.session_version ?? 0) + 1;
    const { data: updated, error: updateError } = await insforgeAdmin.database.from('users')
      .update({ password_hash: await hashPassword(newPassword), session_version: sessionVersion })
      .eq('id', user.id).eq('session_version', user.session_version ?? 0).select('id').maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ success: false, error: 'Session changed. Please sign in again.' }, { status: 409 });

    const token = await signAuthToken({ userId: user.id, email: user.email, role: user.role, sessionVersion });
    const response = NextResponse.json({ success: true, message: 'Password updated. Other sessions have been signed out.' });
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
    console.error('Password change failed:', error);
    return NextResponse.json({ success: false, error: 'Password could not be updated.' }, { status: 500 });
  }
}
