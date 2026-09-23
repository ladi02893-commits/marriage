import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { rejectCrossSiteMutation } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
