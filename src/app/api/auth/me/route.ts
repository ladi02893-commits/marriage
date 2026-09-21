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
    const profileIdCode = user.profile_id_code || user.profileIdCode || user.profile?.profile_id_code || user.profile?.profileIdCode || 'VRM-000001';
    const totalConnections = user.total_connections ?? user.totalConnections ?? (subscriptionTier === 'PREMIUM_PLUS' || subscriptionTier === 'VIP' ? 300 : subscriptionTier === 'PREMIUM' ? 100 : 30);
    const usedConnections = user.used_connections ?? user.usedConnections ?? 0;
    const remainingConnections = user.remaining_connections ?? user.remainingConnections ?? Math.max(0, totalConnections - usedConnections);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || user.profile?.phone || '',
      whatsappNumber: user.whatsapp_number || user.whatsappNumber || user.profile?.whatsappNumber || user.phone || '',
      profileIdCode,
      role: user.role,
      subscriptionTier,
      isVerified,
      isWhatsappVerified: user.is_whatsapp_verified ?? user.isWhatsappVerified ?? true,
      isEmailVerified: user.is_email_verified ?? user.isEmailVerified ?? true,
      avatarUrl: user.avatar_url || user.avatarUrl || user.profile?.photos?.[0]?.url || null,
      profileId: user.profile?.id || null,
      accountStatus,
      totalConnections,
      usedConnections,
      remainingConnections,
      assignedConsultantId: user.assigned_consultant_id || user.assignedConsultantId || 'consultant-1',
    };

    let mappedProfile = user.profile;
    if (mappedProfile) {
      (mappedProfile as any).verificationBadge = isVerified ? 'APPROVED' : 'UNVERIFIED';
      if (!(mappedProfile as any).profileIdCode) {
        (mappedProfile as any).profileIdCode = profileIdCode;
      }
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
