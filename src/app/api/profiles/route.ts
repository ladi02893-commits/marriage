import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { toProfileDto } from '@/lib/profile-dto';

const PROFILE_SELECT = '*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status)';

function normalizedFilter(value: string | null): string | null {
  if (!value || value === 'ALL') return null;
  const trimmed = value.trim().slice(0, 80);
  return /^[\p{L}\p{N} .'-]+$/u.test(trimmed) ? trimmed : null;
}


export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const isAdmin = ADMIN_ROLES.has(auth.user.role);

  try {
    const params = request.nextUrl.searchParams;
    const gender = normalizedFilter(params.get('gender'));
    const religion = normalizedFilter(params.get('religion'));
    const country = normalizedFilter(params.get('country'));
    const city = normalizedFilter(params.get('city'));
    const search = normalizedFilter(params.get('search'))?.toLowerCase();

    let query = insforgeAdmin.database.from('matrimonial_profiles').select(PROFILE_SELECT);
    if (!isAdmin) query = query.or(`approval_status.eq.APPROVED,user_id.eq.${auth.user.id}`);
    if (gender) query = query.eq('gender', gender);
    if (religion) query = query.eq('religion', religion);
    if (country) query = query.eq('country', country);
    if (city) query = query.eq('city', city);
    const { data: profiles, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    const { data: accepted, error: acceptedError } = await insforgeAdmin.database
      .from('interest_requests')
      .select('sender_id,receiver_id')
      .eq('status', 'ACCEPTED')
      .or(`sender_id.eq.${auth.user.id},receiver_id.eq.${auth.user.id}`);
    if (acceptedError) throw acceptedError;
    const connectedUserIds = new Set<string>([auth.user.id]);
    for (const connection of accepted ?? []) {
      connectedUserIds.add(connection.sender_id === auth.user.id ? connection.receiver_id : connection.sender_id);
    }

    let visibleProfiles = (profiles ?? []).filter((profile) => {
      if (isAdmin || profile.user_id === auth.user.id) return true;
      return profile.user?.account_status === 'ACTIVE' && !profile.privacySettings?.hide_profile_temporarily;
    });
    if (search) {
      visibleProfiles = visibleProfiles.filter((profile) =>
        [profile.display_name, profile.city, profile.bio_headline, profile.educationCareer?.profession]
          .some((value) => typeof value === 'string' && value.toLowerCase().includes(search)),
      );
    }

    return NextResponse.json({
      success: true,
      data: await Promise.all(visibleProfiles.map((profile) => toProfileDto(
        profile,
        isAdmin || connectedUserIds.has(profile.user_id),
        isAdmin || profile.user_id === auth.user.id,
      ))),
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
    if (existing.user_id !== auth.user.id && !isAdmin) {
      return NextResponse.json({ success: false, error: 'You cannot edit this profile.' }, { status: 403 });
    }

    const profileData: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      fullName: 'full_name', displayName: 'display_name', gender: 'gender',
      maritalStatus: 'marital_status', religion: 'religion', sectOrCommunity: 'sect_or_community',
      motherTongue: 'mother_tongue', city: 'city', country: 'country', stateProvince: 'state_province',
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
    if (body.approvalStatus !== undefined) {
      if (!isAdmin) return NextResponse.json({ success: false, error: 'Administrator access required.' }, { status: 403 });
      if (!['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(body.approvalStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid approval status.' }, { status: 400 });
      }
      profileData.approval_status = body.approvalStatus;
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
        field_of_study: value.fieldOfStudy ? String(value.fieldOfStudy).slice(0, 120) : null,
        annual_income: value.annualIncome ? String(value.annualIncome).slice(0, 80) : null,
      }], { onConflict: 'profile_id' }));
    }
    if (body.lifestyle && typeof body.lifestyle === 'object') {
      const value = body.lifestyle;
      relatedWrites.push(insforgeAdmin.database.from('lifestyles').upsert([{
        profile_id: body.id,
        height: String(value.height || 'Not specified').slice(0, 30),
        diet: ['VEGETARIAN', 'NON_VEGETARIAN', 'HALAL_ONLY', 'EGGETARIAN', 'VEGAN'].includes(value.diet) ? value.diet : 'HALAL_ONLY',
        smoking: ['NO', 'OCCASIONALLY', 'REGULARLY'].includes(value.smoking) ? value.smoking : 'NO',
        drinking: ['NO', 'OCCASIONALLY', 'SOCIALLY', 'REGULARLY'].includes(value.drinking) ? value.drinking : 'NO',
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
        family_location: value.familyLocation ? String(value.familyLocation).slice(0, 160) : null,
        about_family: value.aboutFamily ? String(value.aboutFamily).slice(0, 1000) : null,
      }], { onConflict: 'profile_id' }));
    }
    if (body.partnerPreferences && typeof body.partnerPreferences === 'object') {
      const value = body.partnerPreferences;
      const minAge = Number(value.ageRange?.min);
      const maxAge = Number(value.ageRange?.max);
      if (!Number.isInteger(minAge) || !Number.isInteger(maxAge) || minAge < 18 || maxAge > 100 || minAge > maxAge) {
        return NextResponse.json({ success: false, error: 'Invalid preferred age range.' }, { status: 400 });
      }
      relatedWrites.push(insforgeAdmin.database.from('partner_preferences').upsert([{
        profile_id: body.id,
        min_age: minAge,
        max_age: maxAge,
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
      }], { onConflict: 'profile_id' }));
    }
    const results = await Promise.all(relatedWrites);
    const relatedError = results.find((result) => result.error)?.error;
    if (relatedError) throw relatedError;

    if (Object.keys(profileData).length) {
      const { error } = await insforgeAdmin.database.from('matrimonial_profiles').update(profileData).eq('id', body.id);
      if (error) throw error;
    }

    const { data: updated, error: updatedError } = await insforgeAdmin.database
      .from('matrimonial_profiles').select(PROFILE_SELECT).eq('id', body.id).single();
    if (updatedError) throw updatedError;
    return NextResponse.json({ success: true, data: await toProfileDto(updated, true, true) });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ success: false, error: 'Profile could not be updated.' }, { status: 500 });
  }
}
