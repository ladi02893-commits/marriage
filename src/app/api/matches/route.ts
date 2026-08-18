import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROFILES } from '@/lib/data-store';
import { MatchingService } from '@/lib/matching-service';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const gender = searchParams.get('gender');
    const profileId = searchParams.get('profileId');

    let profiles: any[] = [];
    try {
      let query = insforgeAdmin.database
        .from('matrimonial_profiles')
        .select('*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*), user:users(is_verified)');

      if (gender === 'MALE') query = query.eq('gender', 'FEMALE');
      if (gender === 'FEMALE') query = query.eq('gender', 'MALE');

      const { data: rawProfiles, error } = await query.limit(30);

      if (!error && rawProfiles) {
        profiles = rawProfiles.map((p: any) => ({
          ...p,
          userId: p.user_id || p.userId,
          fullName: p.full_name || p.fullName,
          displayName: p.display_name || p.displayName,
          bioHeadline: p.bio_headline || p.bioHeadline,
          aboutMe: p.about_me || p.aboutMe,
          caste: p.caste_or_sub_clan || p.caste,
          sectOrCommunity: p.sect_or_community || p.sectOrCommunity,
          motherTongue: p.mother_tongue || p.motherTongue,
          state: p.state_province || p.state || p.province,
          province: p.state_province || p.province,
          dateOfBirth: p.date_of_birth || p.dateOfBirth,
          completionPercentage: p.completion_percentage ?? p.completionPercentage ?? 85,
          viewCount: p.view_count ?? p.viewCount ?? 0,
          likeCount: p.like_count ?? p.likeCount ?? 0,
          isFeatured: p.is_featured ?? p.isFeatured ?? true,
          isBoosted: p.is_boosted ?? p.isBoosted ?? false,
          verificationBadge: (p.user?.is_verified ?? p.user?.isVerified) ? 'APPROVED' : 'UNVERIFIED',
        }));
      }
    } catch (err) {
      console.warn('InsForge match fetch fallback:', err);
    }

    if (profiles.length === 0) {
      profiles = INITIAL_PROFILES.filter(
        (p) => !gender || p.gender !== gender
      );
    }

    let userProfile = null;
    if (profileId) {
      const { data: up } = await insforgeAdmin.database
        .from('matrimonial_profiles')
        .select('*, partnerPreferences:partner_preferences(*), lifestyle:lifestyles(*), educationCareer:education_careers(*), familyInfo:family_infos(*)')
        .eq('id', profileId)
        .maybeSingle();
      userProfile = up;
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
      source: profiles.length > 0 && profiles[0].id !== INITIAL_PROFILES[0]?.id ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches.' },
      { status: 500 }
    );
  }
}
