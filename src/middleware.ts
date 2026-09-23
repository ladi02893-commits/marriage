import { jwtVerify } from 'jose/jwt/verify';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-constants';

export async function middleware(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret || secret.length < 32) return NextResponse.redirect(loginUrl);

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    if (typeof payload.userId !== 'string') return NextResponse.redirect(loginUrl);
    if (request.nextUrl.pathname.startsWith('/admin') && !['SUPER_ADMIN', 'ADMIN'].includes(String(payload.role))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
