import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  signAuthToken,
  verifyPassword,
} from '@/lib/auth';
import { clearRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { toSafeUser } from '@/lib/user-dto';
import { rejectCrossSiteMutation } from '@/lib/api-auth';

const LOGIN_SELECT = 'id,email,password_hash,name,role,is_verified,subscription_tier,account_status,avatar_url,phone,profile_id_code,whatsapp_number,is_whatsapp_verified,is_email_verified,total_connections,used_connections,remaining_connections,assigned_consultant_id,session_version,created_at,profile:matrimonial_profiles(id,photos:profile_photos(url,is_primary))';

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || password.length > 128) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const rateKey = `${forwardedFor || 'unknown'}:${email}`;
    const limit = checkRateLimit(rateKey);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const { data: user, error } = await insforgeAdmin.database
      .from('users')
      .select(LOGIN_SELECT)
      .eq('email', email)
      .maybeSingle();
    if (error) {
      console.error('Login database error:', error.message);
      return NextResponse.json({ success: false, error: 'Login is temporarily unavailable.' }, { status: 503 });
    }
    if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }
    if (user.account_status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'This account is not active.' }, { status: 403 });
    }

    clearRateLimit(rateKey);
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.session_version ?? 0,
    });
    const { error: loginUpdateError } = await insforgeAdmin.database
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);
    if (loginUpdateError) console.error('Could not update last login:', loginUpdateError.message);

    const response = NextResponse.json({
      success: true,
      user: toSafeUser(user),
      redirectUrl: ['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? '/admin' : '/dashboard',
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
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Invalid login request.' }, { status: 400 });
  }
}
