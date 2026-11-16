import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { MatchingService } from '@/lib/matching-service';
import { toProfileDto } from '@/lib/profile-dto';

const MATCH_SELECT = '*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status)';

type Row = Record<string, any>;

function relation(value: Row | Row[] | null | undefined): Row {
  return (Array.isArray(value) ? value[0] : value) ?? {};
}

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

    const ownDto = await toProfileDto(ownProfile, true, true);

    const matches = (await Promise.all((candidates ?? [])
      .filter((candidate) => {
        const user = relation(candidate.user);
        const privacy = relation(candidate.privacySettings);
        return user.account_status === 'ACTIVE' && !privacy.hide_profile_temporarily;
      })
      .map(async (candidate) => {
        const privacy = relation(candidate.privacySettings);
        const visibility = privacy.photo_visibility ?? 'ONLY_ACCEPTED_INTERESTS';
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
            return { id: photo.id, url, isPrimary: photo.is_primary, isApproved: photo.is_approved, order: photo.order_num };
          })) : [];
        const dto = await toProfileDto(candidate, connectedUserIds.has(candidate.user_id), false);
        const safeCandidate = { ...dto, photos };
        return {
          candidate: safeCandidate,
          compatibility: MatchingService.calculateCompatibility(ownDto, safeCandidate),
        };
      })))
      .sort((a, b) => (b.compatibility?.overallScore ?? 0) - (a.compatibility?.overallScore ?? 0));

    return NextResponse.json({ success: true, data: matches, total: matches.length });
  } catch (error) {
    console.error('Match calculation failed:', error);
    return NextResponse.json({ success: false, error: 'Matches could not be loaded.' }, { status: 503 });
  }
}
