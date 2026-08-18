import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { INITIAL_USERS } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Try find in InsForge or INITIAL_USERS
    let targetUser: any = INITIAL_USERS.find((u) => u.id === userId);
    if (!targetUser) {
      try {
        const { data, error } = await insforgeAdmin.database
          .from('users')
          .select('*, profile:matrimonial_profiles(*)')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          targetUser = data;
        }
      } catch {
        // fallback
      }
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const token = await signAuthToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
    });

    const isPrivileged =
      targetUser.role === 'SUPER_ADMIN' ||
      targetUser.role === 'ADMIN' ||
      targetUser.role === 'MODERATOR' ||
      targetUser.email === 'ladi02893@gmail.com';

    const response = NextResponse.json({
      success: true,
      user: targetUser,
      redirectUrl: isPrivileged ? '/admin' : '/dashboard',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
