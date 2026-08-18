import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookies();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null, profile: null });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl || user.profile?.photos?.[0]?.url || null,
      profileId: user.profile?.id || null,
      accountStatus: user.accountStatus,
    };

    let mappedProfile = user.profile;
    if (mappedProfile) {
      (mappedProfile as any).verificationBadge = user.isVerified ? 'APPROVED' : 'UNVERIFIED';
    }

    return NextResponse.json({
      authenticated: true,
      user: safeUser,
      profile: mappedProfile,
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    return NextResponse.json({ authenticated: false, user: null, profile: null });
  }
}
