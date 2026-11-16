import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, BUREAU_ROLES, rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { getBureausRegistry, getUserBureauMap, linkUserToBureau } from '@/lib/bureau-store';
import { insforgeAdmin } from '@/lib/insforge/server';
import { toProfileDto } from '@/lib/profile-dto';

const PROFILE_SELECT = '*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status,assigned_consultant_id)';

type Row = Record<string, any>;

function relation(value: Row | Row[] | null | undefined): Row {
  return (Array.isArray(value) ? value[0] : value) ?? {};
}

function normalizedFilter(value: string | null): string | null {
  if (!value || value === 'ALL') return null;
  const trimmed = value.trim().slice(0, 80);
  return /^[\p{L}\p{N} .'-]+$/u.test(trimmed) ? trimmed : null;
}

function computeCompletionPercentage(profile: Row): number {
  const career = relation(profile.educationCareer);
  const lifestyle = relation(profile.lifestyle);
  const family = relation(profile.familyInfo);
  const prefs = relation(profile.partnerPreferences);
  const checks = [
    Boolean(profile.full_name),
    Boolean(profile.date_of_birth),
    Boolean(profile.city && profile.city !== 'Not specified' && profile.country),
    Boolean(profile.bio_headline && String(profile.bio_headline).trim().length >= 5),
    Boolean(profile.about_me && String(profile.about_me).trim().length >= 20),
    Boolean(career.highest_degree && career.highest_degree !== 'Not specified'),
    Boolean(career.profession && career.profession !== 'Not specified'),
    Boolean(lifestyle.height && lifestyle.height !== 'Not specified'),
    Boolean(family.father_occupation || family.about_family),
    Boolean(prefs.expectations_notes || (Array.isArray(prefs.countries) && prefs.countries.length > 0)),
    Array.isArray(profile.photos) && profile.photos.length > 0,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return Math.max(20, Math.min(100, score));
}


export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUserFromCookies();
  const isAdmin = currentUser ? ADMIN_ROLES.has(currentUser.role) : false;

  try {
    const params = request.nextUrl.searchParams;
    const gender = normalizedFilter(params.get('gender'));
    const religion = normalizedFilter(params.get('religion'));
    const country = normalizedFilter(params.get('country'));
    const city = normalizedFilter(params.get('city'));
    const search = normalizedFilter(params.get('search'))?.toLowerCase();

    const [bureaus, userBureauMap] = await Promise.all([
      getBureausRegistry(),
      getUserBureauMap(),
    ]);
    const bureauById = new Map(bureaus.map((b) => [b.id, b]));
    const ownBureau =
      currentUser && BUREAU_ROLES.has(currentUser.role)
        ? bureaus.find((b) => b.ownerUserId === currentUser.id || b.id === currentUser.assigned_consultant_id)
        : undefined;

    let query = insforgeAdmin.database.from('matrimonial_profiles').select(PROFILE_SELECT);
    if (!currentUser) {
      query = query.eq('approval_status', 'APPROVED');
    } else if (!isAdmin && !ownBureau) {
      query = query.or(`approval_status.eq.APPROVED,user_id.eq.${currentUser.id}`);
    }
    if (gender) query = query.eq('gender', gender);
    if (religion) query = query.eq('religion', religion);
    if (country) query = query.eq('country', country);
    if (city) query = query.eq('city', city);
    const { data: profiles, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    const connectedUserIds = new Set<string>();
    let ownGender: string | null = null;
    if (currentUser) {
      connectedUserIds.add(currentUser.id);
      const [{ data: accepted, error: acceptedError }, { data: ownProf }] = await Promise.all([
        insforgeAdmin.database
          .from('interest_requests')
          .select('sender_id,receiver_id')
          .eq('status', 'ACCEPTED')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`),
        insforgeAdmin.database
          .from('matrimonial_profiles')
          .select('gender')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
      ]);
      if (acceptedError) throw acceptedError;
      for (const connection of accepted ?? []) {
        connectedUserIds.add(connection.sender_id === currentUser.id ? connection.receiver_id : connection.sender_id);
      }
      ownGender = ownProf?.gender ?? null;
    }

    const resolveBureauId = (profile: Row): string | null =>
      profile.bureau_id ??
      userBureauMap[profile.user_id]?.bureauId ??
      relation(profile.user).assigned_consultant_id ??
      null;

    let visibleProfiles = (profiles ?? []).filter((profile) => {
      const user = relation(profile.user);
      const privacy = relation(profile.privacySettings);
      if (isAdmin || (currentUser && profile.user_id === currentUser.id)) return true;
      const clientBureauId = resolveBureauId(profile);
      if (ownBureau && ownBureau.approvalStatus === 'APPROVED' && clientBureauId === ownBureau.id) {
        return true;
      }
      if (profile.approval_status !== 'APPROVED') return false;
      if (user.account_status !== 'ACTIVE' || privacy.hide_profile_temporarily) return false;
      if (!isAdmin && currentUser && (ownGender === 'MALE' || ownGender === 'FEMALE') && profile.gender === ownGender) {
        return false;
      }
      return true;
    });
    if (search) {
      visibleProfiles = visibleProfiles.filter((profile) => {
        const career = relation(profile.educationCareer);
        return [profile.display_name, profile.city, profile.bio_headline, career.profession]
          .some((value) => typeof value === 'string' && value.toLowerCase().includes(search));
      });
    }

    return NextResponse.json({
      success: true,
      data: await Promise.all(visibleProfiles.map((profile) => {
        const resolvedBureauId = resolveBureauId(profile);
        const mapEntry = userBureauMap[profile.user_id];
        const bureauObj = resolvedBureauId ? bureauById.get(resolvedBureauId) : undefined;
        const isClientOfOwnBureau = Boolean(ownBureau && resolvedBureauId === ownBureau.id);
        return toProfileDto(
          profile,
          isAdmin || isClientOfOwnBureau || connectedUserIds.has(profile.user_id),
          isAdmin || isClientOfOwnBureau || (Boolean(currentUser) && profile.user_id === currentUser?.id),
          {
            id: resolvedBureauId,
            name: bureauObj?.name ?? mapEntry?.customBureauName ?? null,
            bureauCode: bureauObj?.bureauCode ?? null,
            createdByBureau: Boolean(profile.created_by_bureau || mapEntry?.createdByBureau),
            username: mapEntry?.username ?? null,
          },
        );
      })),
      total: visibleProfiles.length,
    });
  } catch (error) {
    console.error('Profiles fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Profiles could not be loaded.' }, { status: 503 });
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Profiles are created only during account registration.' },
    { status: 405, headers: { Allow: 'GET, PATCH' } },
  );
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    if (typeof body.id !== 'string') {
      return NextResponse.json({ success: false, error: 'Profile ID is required.' }, { status: 400 });
    }
    const { data: existing, error: existingError } = await insforgeAdmin.database
      .from('matrimonial_profiles').select('id,user_id').eq('id', body.id).maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    const isAdmin = ADMIN_ROLES.has(auth.user.role);
    let isClientBureauManager = false;
    if (!isAdmin && existing.user_id !== auth.user.id && BUREAU_ROLES.has(auth.user.role)) {
      const [bureaus, userBureauMap, targetUserRes] = await Promise.all([
        getBureausRegistry(),
        getUserBureauMap(),
        insforgeAdmin.database.from('users').select('assigned_consultant_id').eq('id', existing.user_id).maybeSingle(),
      ]);
      const ownBureau = bureaus.find((b) => b.ownerUserId === auth.user.id || b.id === auth.user.assigned_consultant_id);
      const targetBureauId = userBureauMap[existing.user_id]?.bureauId || targetUserRes.data?.assigned_consultant_id;
      isClientBureauManager = Boolean(ownBureau && ownBureau.approvalStatus === 'APPROVED' && targetBureauId === ownBureau.id);
    }
    if (existing.user_id !== auth.user.id && !isAdmin && !isClientBureauManager) {
      return NextResponse.json({ success: false, error: 'You cannot edit this profile.' }, { status: 403 });
    }

    const profileData: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      fullName: 'full_name', displayName: 'display_name', gender: 'gender',
      maritalStatus: 'marital_status', religion: 'religion', sectOrCommunity: 'sect_or_community',
      caste: 'caste_or_sub_clan', casteOrSubClan: 'caste_or_sub_clan',
      motherTongue: 'mother_tongue', city: 'city', country: 'country',
      state: 'state_province', province: 'state_province', stateProvince: 'state_province',
      bioHeadline: 'bio_headline', aboutMe: 'about_me',
    };
    for (const [clientKey, dbKey] of Object.entries(fields)) {
      if (typeof body[clientKey] === 'string') profileData[dbKey] = body[clientKey].trim().slice(0, clientKey === 'aboutMe' ? 2000 : 180);
    }
    if (typeof body.dateOfBirth === 'string') {
      const parsed = new Date(`${body.dateOfBirth.slice(0, 10)}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) return NextResponse.json({ success: false, error: 'Invalid date of birth.' }, { status: 400 });
      profileData.date_of_birth = parsed.toISOString();
    }
    let approvalChangedTo: string | null = null;
    if (body.approvalStatus !== undefined) {
      if (!isAdmin && !isClientBureauManager) {
        return NextResponse.json({ success: false, error: 'Administrator or Marriage Bureau access required.' }, { status: 403 });
      }
      const allowedStatuses = isAdmin
        ? ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUSPENDED']
        : ['PENDING_APPROVAL', 'APPROVED', 'CHANGES_REQUESTED'];
      if (!allowedStatuses.includes(body.approvalStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid approval status.' }, { status: 400 });
      }
      profileData.approval_status = body.approvalStatus;
      approvalChangedTo = body.approvalStatus;
    } else if (body.submitForApproval === true && existing.user_id === auth.user.id) {
      profileData.approval_status = 'PENDING_APPROVAL';
    }

    // Optional contact/name updates on user row
    const userContactUpdate: Record<string, string> = {};
    if (typeof body.fullName === 'string' && body.fullName.trim()) {
      userContactUpdate.name = body.fullName.trim().slice(0, 100);
    }
    if (typeof body.phone === 'string' && body.phone.trim()) {
      userContactUpdate.phone = body.phone.trim().slice(0, 30);
    }
    if (typeof body.whatsappNumber === 'string' && body.whatsappNumber.trim()) {
      userContactUpdate.whatsapp_number = body.whatsappNumber.trim().slice(0, 30);
    }
    if (Object.keys(userContactUpdate).length > 0) {
      const { error: userUpdateError } = await insforgeAdmin.database
        .from('users')
        .update(userContactUpdate)
        .eq('id', existing.user_id);
      if (userUpdateError) throw userUpdateError;
    }

    // Marriage Bureau linking or custom bureau name update
    const nextUsername = typeof body.username === 'string' && body.username.trim()
      ? body.username.trim().slice(0, 30)
      : undefined;
    if (body.bureauId === 'CUSTOM') {
      const customBureauName = typeof body.customBureauName === 'string' ? body.customBureauName.trim().slice(0, 140) : '';
      if (customBureauName.length < 2) {
        return NextResponse.json({ success: false, error: 'Please enter your Marriage Bureau name.' }, { status: 400 });
      }
      await linkUserToBureau(existing.user_id, 'custom-bureau', false, {
        customBureauName,
        username: nextUsername,
      });
    } else if (typeof body.bureauId === 'string' && body.bureauId.trim()) {
      const bureaus = await getBureausRegistry();
      const targetBureau = bureaus.find((b) => b.id === body.bureauId.trim() && b.approvalStatus === 'APPROVED');
      if (!targetBureau) {
        return NextResponse.json({ success: false, error: 'Selected Marriage Bureau was not found or is not approved.' }, { status: 400 });
      }
      await linkUserToBureau(existing.user_id, targetBureau.id, false, {
        customBureauName: '',
        username: nextUsername,
      });
    } else if (nextUsername) {
      const userBureauMap = await getUserBureauMap();
      const currentEntry = userBureauMap[existing.user_id];
      await linkUserToBureau(existing.user_id, currentEntry?.bureauId ?? '', Boolean(currentEntry?.createdByBureau), {
        username: nextUsername,
      });
    }

    const relatedWrites = [];
    if (body.educationCareer && typeof body.educationCareer === 'object') {
      const value = body.educationCareer;
      relatedWrites.push(insforgeAdmin.database.from('education_careers').upsert([{
        profile_id: body.id,
        highest_degree: String(value.highestDegree || 'Not specified').slice(0, 120),
        institution: value.institution ? String(value.institution).slice(0, 160) : null,
        profession: String(value.profession || 'Not specified').slice(0, 120),
        job_title: value.jobTitle ? String(value.jobTitle).slice(0, 120) : null,
        company_name: value.company ? String(value.company).slice(0, 160) : null,
        field_of_study: value.fieldOfStudy ? String(value.fieldOfStudy).slice(0, 120) : null,
        annual_income: value.annualIncome ? String(value.annualIncome).slice(0, 80) : null,
        currency: value.currency ? String(value.currency).slice(0, 10) : 'PKR',
      }], { onConflict: 'profile_id' }));
    }
    if (body.lifestyle && typeof body.lifestyle === 'object') {
      const value = body.lifestyle;
      relatedWrites.push(insforgeAdmin.database.from('lifestyles').upsert([{
        profile_id: body.id,
        height: String(value.height || 'Not specified').slice(0, 30),
        weight: value.weight ? String(value.weight).slice(0, 30) : null,
        body_type: value.bodyType ? String(value.bodyType).slice(0, 30) : null,
        diet: ['VEGETARIAN', 'NON_VEGETARIAN', 'HALAL_ONLY', 'EGGETARIAN', 'VEGAN'].includes(value.diet) ? value.diet : 'HALAL_ONLY',
        smoking: ['NO', 'OCCASIONALLY', 'REGULARLY'].includes(value.smoking) ? value.smoking : 'NO',
        drinking: ['NO', 'OCCASIONALLY', 'SOCIALLY', 'REGULARLY'].includes(value.drinking) ? value.drinking : 'NO',
        ...(typeof value.motherTongue === 'string' && value.motherTongue.trim() ? { mother_tongue: value.motherTongue.trim().slice(0, 50) } : {}),
        ...(Array.isArray(value.languagesSpoken) ? { languages_spoken: value.languagesSpoken.map(String).slice(0, 15) } : {}),
      }], { onConflict: 'profile_id' }));
    }
    if (body.familyInfo && typeof body.familyInfo === 'object') {
      const value = body.familyInfo;
      relatedWrites.push(insforgeAdmin.database.from('family_infos').upsert([{
        profile_id: body.id,
        family_type: String(value.familyType || 'NUCLEAR').slice(0, 40),
        family_values: String(value.familyValues || 'MODERATE').slice(0, 40),
        father_occupation: value.fatherOccupation ? String(value.fatherOccupation).slice(0, 160) : null,
        mother_occupation: value.motherOccupation ? String(value.motherOccupation).slice(0, 160) : null,
        brothers_count: Math.max(0, Number(value.brothersCount) || 0),
        sisters_count: Math.max(0, Number(value.sistersCount) || 0),
        family_location: value.familyLocation ? String(value.familyLocation).slice(0, 160) : null,
        about_family: value.aboutFamily ? String(value.aboutFamily).slice(0, 1000) : null,
      }], { onConflict: 'profile_id' }));
    }
    if (body.partnerPreferences && typeof body.partnerPreferences === 'object') {
      const value = body.partnerPreferences;
      const minAge = Number(value.ageRange?.min ?? value.minAge ?? 20);
      const maxAge = Number(value.ageRange?.max ?? value.maxAge ?? 38);
      if (!Number.isInteger(minAge) || !Number.isInteger(maxAge) || minAge < 18 || maxAge > 100 || minAge > maxAge) {
        return NextResponse.json({ success: false, error: 'Invalid preferred age range.' }, { status: 400 });
      }
      relatedWrites.push(insforgeAdmin.database.from('partner_preferences').upsert([{
        profile_id: body.id,
        min_age: minAge,
        max_age: maxAge,
        ...(value.heightRange?.min ? { min_height: String(value.heightRange.min).slice(0, 30) } : {}),
        ...(value.heightRange?.max ? { max_height: String(value.heightRange.max).slice(0, 30) } : {}),
        ...(Array.isArray(value.maritalStatuses) ? { marital_statuses: value.maritalStatuses.map(String) } : {}),
        ...(Array.isArray(value.religions) ? { religions: value.religions.map(String) } : {}),
        ...(Array.isArray(value.educationLevels) ? { education_levels: value.educationLevels.map(String) } : {}),
        ...(Array.isArray(value.professions) ? { professions: value.professions.map(String) } : {}),
        ...(Array.isArray(value.preferredLocations) ? { countries: value.preferredLocations.map(String) } : {}),
        expectations_notes: value.expectationsNotes ? String(value.expectationsNotes).slice(0, 1000) : null,
      }], { onConflict: 'profile_id' }));
    }
    const privacyValue = body.privacy ?? body.privacySettings;
    if (privacyValue && typeof privacyValue === 'object') {
      const value = privacyValue;
      const photoVisibility = ['ALL', 'REGISTERED_ONLY', 'ONLY_ACCEPTED_INTERESTS', 'NONE'].includes(value.photoVisibility)
        ? value.photoVisibility : 'ONLY_ACCEPTED_INTERESTS';
      relatedWrites.push(insforgeAdmin.database.from('privacy_settings').upsert([{
        profile_id: body.id,
        photo_visibility: photoVisibility,
        contact_visibility: value.contactVisibility === 'NONE' ? 'NONE' : 'ONLY_ACCEPTED_INTERESTS',
        show_age: value.showAge === true,
        show_income: value.showIncome === true,
        show_last_seen: value.showLastSeen === true,
        hide_profile_temporarily: value.hideProfileTemporarily === true,
        search_engine_index: value.searchEngineIndex === true,
      }], { onConflict: 'profile_id' }));
    }
    const results = await Promise.all(relatedWrites);
    const relatedError = results.find((result) => result.error)?.error;
    if (relatedError) throw relatedError;

    if (Object.keys(profileData).length) {
      const { error } = await insforgeAdmin.database.from('matrimonial_profiles').update(profileData).eq('id', body.id);
      if (error) throw error;
    }

    const { data: refreshed, error: refreshedError } = await insforgeAdmin.database
      .from('matrimonial_profiles').select(PROFILE_SELECT).eq('id', body.id).single();
    if (refreshedError) throw refreshedError;

    const newCompletion = computeCompletionPercentage(refreshed);
    if (newCompletion !== refreshed.completion_percentage) {
      await insforgeAdmin.database
        .from('matrimonial_profiles')
        .update({ completion_percentage: newCompletion })
        .eq('id', body.id);
      refreshed.completion_percentage = newCompletion;
    }

    if (body.submitForApproval === true && existing.user_id === auth.user.id) {
      await insforgeAdmin.database.from('notifications').insert([{
        user_id: existing.user_id,
        title: 'Profile approval request sent to Admin',
        description: 'Your complete matrimonial profile and Marriage Bureau details have been saved and submitted for Administrator approval.',
        type: 'SYSTEM',
        link_url: '/dashboard/profile',
      }]);
    } else if (approvalChangedTo && existing.user_id !== auth.user.id) {
      const notes = typeof body.reviewerNotes === 'string' && body.reviewerNotes.trim()
        ? ` Note: ${body.reviewerNotes.trim().slice(0, 300)}`
        : '';
      const isApproved = approvalChangedTo === 'APPROVED';
      await insforgeAdmin.database.from('notifications').insert([{
        user_id: existing.user_id,
        title: isApproved ? 'Profile approved' : 'Profile review update',
        description: isApproved
          ? 'Your matrimonial profile has been approved and is now live.'
          : `Your profile status was updated to ${approvalChangedTo.replaceAll('_', ' ')}.${notes}`,
        type: isApproved ? 'PROFILE_APPROVED' : 'PROFILE_CHANGES_REQUESTED',
        link_url: '/dashboard/profile',
      }]);
    }

    const [bureausAfter, userBureauMapAfter] = await Promise.all([
      getBureausRegistry(),
      getUserBureauMap(),
    ]);
    const refreshedMapEntry = userBureauMapAfter[refreshed.user_id];
    const refreshedBureauId = refreshed.bureau_id ?? refreshedMapEntry?.bureauId ?? relation(refreshed.user).assigned_consultant_id ?? null;
    const refreshedBureauObj = refreshedBureauId ? bureausAfter.find((b) => b.id === refreshedBureauId) : undefined;

    return NextResponse.json({
      success: true,
      data: await toProfileDto(refreshed, true, true, {
        id: refreshedBureauId,
        name: refreshedBureauObj?.name ?? refreshedMapEntry?.customBureauName ?? null,
        bureauCode: refreshedBureauObj?.bureauCode ?? null,
        createdByBureau: Boolean(refreshed.created_by_bureau || refreshedMapEntry?.createdByBureau),
        username: refreshedMapEntry?.username ?? null,
      }),
    });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ success: false, error: 'Profile could not be updated.' }, { status: 500 });
  }
}
