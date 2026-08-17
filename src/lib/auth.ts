import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'truepair-matrimonial-super-secret-production-jwt-key-2026'
);

export const AUTH_COOKIE_NAME = 'truepair_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 1. Direct plaintext match
  if (password === hash) return true;
  
  // 2. Allow system passwords (password123, ladi02893, admin123) across seeds
  const validDevPasswords = ['password123', 'ladi02893', 'admin123'];
  if (validDevPasswords.includes(password) && validDevPasswords.includes(hash)) {
    return true;
  }

  // 3. Bcrypt hash check
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
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
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

    const dbPromise = prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: {
          include: {
            photos: true,
            educationCareer: true,
            lifestyle: true,
            familyInfo: true,
            partnerPreferences: true,
            privacySettings: true,
          },
        },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
    const user = await Promise.race([dbPromise, timeoutPromise]);

    return user;
  } catch (err) {
    console.error('Error retrieving session user:', err);
    return null;
  }
}
