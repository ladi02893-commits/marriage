import { insforgeAdmin } from '@/lib/insforge/server';

type Row = Record<string, any>;

function relation(value: Row | Row[] | null | undefined): Row {
  return (Array.isArray(value) ? value[0] : value) ?? {};
}

function ageFromBirthDate(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

export async function toProfileDto(profile: Row, canSeePrivate: boolean, isOwnerOrAdmin = false) {
  const user = relation(profile.user);
  const privacy = relation(profile.privacySettings);
  const career = relation(profile.educationCareer);
  const lifestyle = relation(profile.lifestyle);
  const family = relation(profile.familyInfo);
  const preferences = relation(profile.partnerPreferences);
  const photoVisibility = privacy.photo_visibility ?? 'ONLY_ACCEPTED_INTERESTS';
  const showPhotos = isOwnerOrAdmin || ((canSeePrivate && photoVisibility !== 'NONE') || photoVisibility === 'ALL' || photoVisibility === 'REGISTERED_ONLY');
  const showContact = isOwnerOrAdmin || (canSeePrivate && privacy.contact_visibility !== 'NONE');
  const showAge = isOwnerOrAdmin || privacy.show_age !== false;
  const showIncome = isOwnerOrAdmin || privacy.show_income === true;
  const photos = showPhotos ? await Promise.all((profile.photos ?? [])
    .filter((photo: Row) => isOwnerOrAdmin || photo.is_approved)
    .map(async (photo: Row) => {
      let url = photo.url;
      if (photo.storage_key) {
        const { data, error } = await insforgeAdmin.storage.from('profile-photos')
          .createSignedUrl(photo.storage_key, 60 * 60);
        if (error) throw error;
        url = data?.signedUrl ?? url;
      }
      return { id: photo.id, url, isPrimary: photo.is_primary, isApproved: photo.is_approved, order: photo.order_num };
    })) : [];

  return {
    id: profile.id,
    userId: profile.user_id,
    profileIdCode: user.profile_id_code ?? undefined,
    fullName: isOwnerOrAdmin ? profile.full_name : profile.display_name,
    displayName: profile.display_name,
    gender: profile.gender,
    dateOfBirth: showAge ? profile.date_of_birth : undefined,
    age: showAge ? ageFromBirthDate(profile.date_of_birth) : undefined,
    maritalStatus: profile.marital_status,
    religion: profile.religion,
    sectOrCommunity: profile.sect_or_community ?? undefined,
    caste: profile.caste_or_sub_clan ?? undefined,
    motherTongue: profile.mother_tongue,
    phone: showContact ? user.phone ?? undefined : undefined,
    whatsappNumber: showContact ? user.whatsapp_number ?? undefined : undefined,
    city: profile.city,
    country: profile.country,
    state: profile.state_province ?? undefined,
    province: profile.state_province ?? undefined,
    bioHeadline: profile.bio_headline,
    aboutMe: profile.about_me,
    photos,
    educationCareer: {
      highestDegree: career.highest_degree ?? '',
      fieldOfStudy: career.field_of_study ?? undefined,
      institution: career.institution ?? undefined,
      profession: career.profession ?? '',
      jobTitle: career.job_title ?? undefined,
      company: career.company_name ?? undefined,
      annualIncome: showIncome ? career.annual_income ?? undefined : undefined,
      currency: career.currency ?? undefined,
    },
    lifestyle: {
      height: lifestyle.height ?? '',
      weight: lifestyle.weight ?? undefined,
      bodyType: lifestyle.body_type ?? undefined,
      diet: lifestyle.diet ?? undefined,
      smoking: lifestyle.smoking ?? undefined,
      drinking: lifestyle.drinking ?? undefined,
      motherTongue: lifestyle.mother_tongue ?? undefined,
      languagesSpoken: lifestyle.languages_spoken ?? [],
    },
    familyInfo: {
      familyType: family.family_type ?? undefined,
      familyValues: family.family_values ?? undefined,
      fatherOccupation: family.father_occupation ?? undefined,
      motherOccupation: family.mother_occupation ?? undefined,
      brothersCount: family.brothers_count ?? 0,
      sistersCount: family.sisters_count ?? 0,
      familyLocation: family.family_location ?? undefined,
      aboutFamily: family.about_family ?? undefined,
    },
    partnerPreferences: {
      ageRange: { min: preferences.min_age ?? 20, max: preferences.max_age ?? 38 },
      heightRange: { min: preferences.min_height ?? '', max: preferences.max_height ?? '' },
      maritalStatuses: preferences.marital_statuses ?? [],
      religions: preferences.religions ?? [],
      educationLevels: preferences.education_levels ?? [],
      professions: preferences.professions ?? [],
      preferredLocations: preferences.countries ?? [],
      expectationsNotes: preferences.expectations_notes ?? undefined,
    },
    privacy: {
      photoVisibility,
      contactVisibility: privacy.contact_visibility ?? 'ONLY_ACCEPTED_INTERESTS',
      showAge: privacy.show_age ?? true,
      showIncome: privacy.show_income ?? false,
      showLastSeen: privacy.show_last_seen ?? true,
      hideProfileTemporarily: privacy.hide_profile_temporarily ?? false,
      searchEngineIndex: privacy.search_engine_index ?? false,
    },
    completionPercentage: profile.completion_percentage ?? 0,
    approvalStatus: profile.approval_status ?? 'PENDING_APPROVAL',
    isApproved: profile.approval_status === 'APPROVED',
    isFeatured: profile.is_featured ?? false,
    isBoosted: profile.is_boosted ?? false,
    verificationBadge: profile.verification_badge ?? 'UNVERIFIED',
    isVerified: user.is_verified ?? false,
    isIdentityVerified: profile.is_identity_verified ?? false,
    isWhatsappVerified: user.is_whatsapp_verified ?? false,
    isEmailVerified: user.is_email_verified ?? false,
    viewCount: profile.view_count ?? 0,
    likeCount: profile.like_count ?? 0,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
