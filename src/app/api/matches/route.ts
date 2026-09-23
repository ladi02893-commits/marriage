import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { MatchingService } from '@/lib/matching-service';

const MATCH_SELECT = '*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,is_verified,account_status)';

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const { data: ownProfile, error: ownError } = await insforgeAdmin.database.from('matrimonial_profiles')
      .select(MATCH_SELECT).eq('user_id', auth.user.id).maybeSingle();
    if (ownError) throw ownError;
    if (!ownProfile) return NextResponse.json({ success: false, error: 'Complete your profile before viewing matches.' }, { status: 409 });

    let query = insforgeAdmin.database.from('matrimonial_profiles').select(MATCH_SELECT)
      .eq('approval_status', 'APPROVED').neq('user_id', auth.user.id);
    if (ownProfile.gender === 'MALE') query = query.eq('gender', 'FEMALE');
    if (ownProfile.gender === 'FEMALE') query = query.eq('gender', 'MALE');
    const { data: candidates, error } = await query.limit(100);
    if (error) throw error;

    const { data: accepted, error: acceptedError } = await insforgeAdmin.database.from('interest_requests')
      .select('sender_id,receiver_id').eq('status', 'ACCEPTED')
      .or(`sender_id.eq.${auth.user.id},receiver_id.eq.${auth.user.id}`);
    if (acceptedError) throw acceptedError;
    const connectedUserIds = new Set((accepted ?? []).map((interest) =>
      interest.sender_id === auth.user.id ? interest.receiver_id : interest.sender_id));

    const matches = (await Promise.all((candidates ?? [])
      .filter((candidate) => candidate.user?.account_status === 'ACTIVE' && !candidate.privacySettings?.hide_profile_temporarily)
      .map(async (candidate) => {
        const privacy = candidate.privacySettings;
        const visibility = privacy?.photo_visibility ?? 'ONLY_ACCEPTED_INTERESTS';
        const showPhotos = ['ALL', 'REGISTERED_ONLY'].includes(visibility) ||
          (visibility === 'ONLY_ACCEPTED_INTERESTS' && connectedUserIds.has(candidate.user_id));
        const photos = showPhotos ? await Promise.all((candidate.photos ?? [])
          .filter((photo: Record<string, unknown>) => photo.is_approved)
          .map(async (photo: Record<string, any>) => {
            let url = photo.url;
            if (photo.storage_key) {
              const { data, error } = await insforgeAdmin.storage.from('profile-photos')
                .createSignedUrl(photo.storage_key, 60 * 60);
              if (error) throw error;
              url = data?.signedUrl ?? url;
            }
            return { id: photo.id, url, is_primary: photo.is_primary, is_approved: photo.is_approved };
          })) : [];
        const safeCandidate = {
          ...candidate,
          userId: candidate.user_id,
          fullName: candidate.display_name,
          displayName: candidate.display_name,
          bioHeadline: candidate.bio_headline,
          aboutMe: candidate.about_me,
          dateOfBirth: privacy?.show_age ? candidate.date_of_birth : null,
          motherTongue: candidate.mother_tongue,
          sectOrCommunity: candidate.sect_or_community,
          completionPercentage: candidate.completion_percentage,
          isFeatured: candidate.is_featured,
          isBoosted: candidate.is_boosted,
          verificationBadge: candidate.verification_badge,
          photos,
          educationCareer: candidate.educationCareer
            ? { ...candidate.educationCareer, annual_income: privacy?.show_income ? candidate.educationCareer.annual_income : null }
            : null,
          familyInfo: undefined,
          partnerPreferences: undefined,
          privacySettings: undefined,
          user: undefined,
          full_name: undefined,
          date_of_birth: undefined,
        };
        return {
          candidate: safeCandidate,
          compatibility: MatchingService.calculateCompatibility(ownProfile, candidate),
        };
      })))
      .sort((a, b) => (b.compatibility?.overallScore ?? 0) - (a.compatibility?.overallScore ?? 0));

    return NextResponse.json({ success: true, data: matches, total: matches.length });
  } catch (error) {
    console.error('Match calculation failed:', error);
    return NextResponse.json({ success: false, error: 'Matches could not be loaded.' }, { status: 503 });
  }
}
