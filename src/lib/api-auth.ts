import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from './auth';

export const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUserFromCookies>>>;

export async function requireUser(): Promise<
  | { user: SessionUser; response?: never }
  | { user?: never; response: NextResponse }
> {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }
  return { user };
}

export async function requireAdmin(): Promise<
  | { user: SessionUser; response?: never }
  | { user?: never; response: NextResponse }
> {
  const auth = await requireUser();
  if (auth.response) return auth;
  if (!ADMIN_ROLES.has(auth.user.role)) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Administrator access required.' },
        { status: 403 },
      ),
    };
  }
  return auth;
}

export function rejectCrossSiteMutation(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ success: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  return null;
}

