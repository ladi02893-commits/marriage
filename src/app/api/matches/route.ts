import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROFILES } from '@/lib/data-store';
import { MatchingService } from '@/lib/matching-service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const gender = searchParams.get('gender');
    const profileId = searchParams.get('profileId');

    let profiles: any[] = [];
    try {
      // Find matching profiles (opposite gender)
      const where: any = {};
      if (gender === 'MALE') where.gender = 'FEMALE';
      if (gender === 'FEMALE') where.gender = 'MALE';
      
      const rawProfiles = await prisma.matrimonialProfile.findMany({
        where,
        include: {
          photos: true,
          educationCareer: true,
          lifestyle: true,
          familyInfo: true,
          partnerPreferences: true,
          privacySettings: true,
          user: { select: { isVerified: true } }
        },
        take: 30, // Limit for performance
      });

      profiles = rawProfiles.map(p => ({
        ...p,
        verificationBadge: p.user?.isVerified ? 'APPROVED' : 'UNVERIFIED'
      }));
    } catch (err) {
      console.warn('Prisma match fetch fallback:', err);
    }

    if (profiles.length === 0) {
      profiles = INITIAL_PROFILES.filter(
        (p) => !gender || p.gender !== gender
      );
    }

    let userProfile = null;
    if (profileId) {
      userProfile = await prisma.matrimonialProfile.findUnique({
        where: { id: profileId },
        include: { partnerPreferences: true, lifestyle: true, educationCareer: true, familyInfo: true }
      }).catch(() => null);
    }
    if (!userProfile) {
      userProfile = INITIAL_PROFILES.find((p) => p.id === profileId || p.userId === userId) || INITIAL_PROFILES[0];
    }

    const matches = profiles
      .filter((p) => p.id !== userProfile?.id)
      .map((candidate) => {
        const breakdown = userProfile ? MatchingService.calculateCompatibility(userProfile as any, candidate as any) : null;
        return {
          candidate,
          compatibility: breakdown,
        };
      })
      .sort((a, b) => (b.compatibility?.overallScore || 0) - (a.compatibility?.overallScore || 0));

    return NextResponse.json({
      success: true,
      data: matches,
      total: matches.length,
      source: profiles.length > 0 && profiles[0].id !== INITIAL_PROFILES[0]?.id ? 'PRISMA_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches.' },
      { status: 500 }
    );
  }
}
