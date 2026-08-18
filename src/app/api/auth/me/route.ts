import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user: any = await getCurrentUserFromCookies();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null, profile: null });
    }

    const isVerified = user.is_verified ?? user.isVerified ?? false;
    const subscriptionTier = user.subscription_tier ?? user.subscriptionTier ?? 'FREE';
    const accountStatus = user.account_status ?? user.accountStatus ?? 'ACTIVE';

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier,
      isVerified,
      avatarUrl: user.avatar_url || user.avatarUrl || user.profile?.photos?.[0]?.url || null,
      profileId: user.profile?.id || null,
      accountStatus,
    };

    let mappedProfile = user.profile;
    if (mappedProfile) {
      (mappedProfile as any).verificationBadge = isVerified ? 'APPROVED' : 'UNVERIFIED';
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
