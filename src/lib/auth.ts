import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { insforgeAdmin } from './insforge/server';
export { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './auth-constants';
import { AUTH_COOKIE_NAME } from './auth-constants';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: string;
  sessionVersion: number;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash.startsWith('$2')) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function signAuthToken(payload: {
  userId: string;
  email: string;
  role: string;
  sessionVersion?: number;
}): Promise<string> {
  return new SignJWT({ ...payload, sessionVersion: payload.sessionVersion ?? 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getJwtSecret());
}

async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') return null;
    return {
      userId: payload.userId,
      email: payload.email,
      role: typeof payload.role === 'string' ? payload.role : 'USER',
      sessionVersion: typeof payload.sessionVersion === 'number' ? payload.sessionVersion : 0,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookies() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyAuthToken(token);
    if (!payload?.userId) return null;

    const { data: user, error } = await insforgeAdmin.database
      .from('users')
      .select('id,email,name,role,is_verified,subscription_tier,account_status,avatar_url,phone,last_login_at,profile_id_code,whatsapp_number,is_whatsapp_verified,is_email_verified,total_connections,used_connections,remaining_connections,assigned_consultant_id,session_version,created_at,updated_at,profile:matrimonial_profiles(*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*))')
      .eq('id', payload.userId)
      .maybeSingle();

    if (error || !user || user.account_status !== 'ACTIVE') {
      return null;
    }

    if ((user.session_version ?? 0) !== payload.sessionVersion) return null;

    return user;
  } catch (err) {
    console.error('Error retrieving session user:', err);
    return null;
  }
}
