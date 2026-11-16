import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getCurrentUserFromCookies } from '@/lib/auth';
import { rejectCrossSiteMutation } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  try {
    const user = await getCurrentUserFromCookies();
    if (user?.id) {
      await insforgeAdmin.database
        .from('users')
        .update({ session_version: (user.session_version ?? 0) + 1 })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Session revocation during logout failed:', error);
  }
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
