import { NextResponse } from 'next/server';
import { INITIAL_PROFILES } from '@/lib/data-store';
import { MatchingService } from '@/lib/matching-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId') || 'profile-me';

    const userProfile = INITIAL_PROFILES.find((p) => p.id === profileId) || INITIAL_PROFILES[0];
    const candidates = INITIAL_PROFILES.filter((p) => p.id !== userProfile.id);

    const matches = candidates.map((candidate) => {
      const breakdown = MatchingService.calculateCompatibility(userProfile, candidate);
      return {
        candidate,
        compatibility: breakdown,
      };
    }).sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

    return NextResponse.json({
      success: true,
      data: matches,
      message: 'Ranked matches calculated successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Matching calculation failed.' },
      { status: 500 }
    );
  }
}
