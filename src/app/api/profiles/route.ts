import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_PROFILES } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const religion = searchParams.get('religion');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Attempt fetching from InsForge Database
    let dbProfiles: any[] = [];
    try {
      let query = insforgeAdmin.database
        .from('matrimonial_profiles')
        .select('*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*), user:users(is_verified)');

      if (gender && gender !== 'ALL') query = query.eq('gender', gender);
      if (religion && religion !== 'ALL') query = query.eq('religion', religion);
      if (country && country !== 'ALL') query = query.ilike('country', `%${country}%`);
      if (city && city !== 'ALL') query = query.ilike('city', `%${city}%`);

      const { data: rawProfiles, error } = await query.order('created_at', { ascending: false });

      if (!error && rawProfiles) {
        dbProfiles = rawProfiles.map((p: any) => ({
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
    } catch (dbErr) {
      console.warn('InsForge DB query fallback to initial store:', dbErr);
    }

    let results = dbProfiles.length > 0 ? dbProfiles : INITIAL_PROFILES;

    if (gender && gender !== 'ALL') {
      results = results.filter((p) => p.gender === gender);
    }
    if (religion && religion !== 'ALL') {
      results = results.filter((p) => p.religion === religion);
    }
    if (country && country !== 'ALL') {
      results = results.filter((p) => p.country && p.country.toLowerCase().includes(country.toLowerCase()));
    }
    if (city && city !== 'ALL') {
      results = results.filter((p) => p.city && p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (search && search.trim()) {
      const term = search.toLowerCase();
      results = results.filter(
        (p) =>
          (p.fullName && p.fullName.toLowerCase().includes(term)) ||
          (p.displayName && p.displayName.toLowerCase().includes(term)) ||
          (p.city && p.city.toLowerCase().includes(term)) ||
          (p.bioHeadline && p.bioHeadline.toLowerCase().includes(term)) ||
          (p.educationCareer?.profession && p.educationCareer.profession.toLowerCase().includes(term))
      );
    }

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      source: dbProfiles.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
      message: 'Profiles retrieved successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profiles.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, displayName, gender, dateOfBirth, maritalStatus, religion, motherTongue, city, country, bioHeadline, aboutMe, photos, educationCareer } = body;

    const { data: created, error } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .insert([{
        user_id: userId,
        full_name: fullName || displayName,
        display_name: displayName || fullName,
        gender: gender || 'FEMALE',
        date_of_birth: new Date(dateOfBirth || '1998-01-01').toISOString(),
        marital_status: maritalStatus || 'NEVER_MARRIED',
        religion: religion || 'ISLAM',
        mother_tongue: motherTongue || 'Urdu',
        city: city || 'Islamabad',
        country: country || 'Pakistan',
        bio_headline: bioHeadline || 'Matrimonial Candidate',
        about_me: aboutMe || 'Family-oriented individual',
      }])
      .select()
      .single();

    if (error || !created) {
      return NextResponse.json({ success: false, error: error?.message || 'Failed to create profile' }, { status: 500 });
    }

    if (photos?.length) {
      await insforgeAdmin.database.from('profile_photos').insert(
        photos.map((ph: any, idx: number) => ({
          profile_id: created.id,
          url: typeof ph === 'string' ? ph : ph.url,
          is_primary: idx === 0,
          order_num: idx + 1,
        }))
      );
    }

    if (educationCareer) {
      await insforgeAdmin.database.from('education_careers').insert([{
        profile_id: created.id,
        highest_degree: educationCareer.highestDegree || "Bachelor's",
        institution: educationCareer.institution,
        profession: educationCareer.profession || 'Executive',
        annual_income: educationCareer.annualIncome?.toString(),
      }]);
    }

    return NextResponse.json({
      success: true,
      profile: created,
      message: 'Profile created successfully in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create profile in database.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      fullName,
      displayName,
      gender,
      dateOfBirth,
      maritalStatus,
      religion,
      sectOrCommunity,
      motherTongue,
      city,
      country,
      stateProvince,
      bioHeadline,
      aboutMe,
      completionPercentage,
      educationCareer,
      lifestyle,
      familyInfo,
      partnerPreferences,
      privacySettings,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Profile id is required.' }, { status: 400 });
    }

    const profileData: any = {};
    if (fullName !== undefined) profileData.full_name = fullName;
    if (displayName !== undefined) profileData.display_name = displayName;
    if (gender !== undefined) profileData.gender = gender;
    if (dateOfBirth !== undefined) profileData.date_of_birth = new Date(dateOfBirth).toISOString();
    if (maritalStatus !== undefined) profileData.marital_status = maritalStatus;
    if (religion !== undefined) profileData.religion = religion;
    if (sectOrCommunity !== undefined) profileData.sect_or_community = sectOrCommunity;
    if (motherTongue !== undefined) profileData.mother_tongue = motherTongue;
    if (city !== undefined) profileData.city = city;
    if (country !== undefined) profileData.country = country;
    if (stateProvince !== undefined) profileData.state_province = stateProvince;
    if (bioHeadline !== undefined) profileData.bio_headline = bioHeadline;
    if (aboutMe !== undefined) profileData.about_me = aboutMe;
    if (completionPercentage !== undefined) profileData.completion_percentage = completionPercentage;

    const { data: updated, error } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .update(profileData)
      .eq('id', id)
      .select('*, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*), partnerPreferences:partner_preferences(*), privacySettings:privacy_settings(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (educationCareer) {
      await insforgeAdmin.database.from('education_careers').upsert([{
        profile_id: id,
        highest_degree: educationCareer.highestDegree || "Bachelor's",
        institution: educationCareer.institution,
        profession: educationCareer.profession || 'Professional',
        job_title: educationCareer.jobTitle,
        field_of_study: educationCareer.fieldOfStudy,
        annual_income: educationCareer.annualIncome?.toString(),
      }], { onConflict: 'profile_id' });
    }

    if (lifestyle) {
      await insforgeAdmin.database.from('lifestyles').upsert([{
        profile_id: id,
        height: lifestyle.height || "5' 6\"",
        weight: lifestyle.weight,
        body_type: lifestyle.bodyType,
        diet: lifestyle.diet || 'HALAL_ONLY',
        smoking: lifestyle.smoking || 'NO',
        drinking: lifestyle.drinking || 'NO',
        mother_tongue: lifestyle.motherTongue || 'Urdu',
      }], { onConflict: 'profile_id' });
    }

    if (familyInfo) {
      await insforgeAdmin.database.from('family_infos').upsert([{
        profile_id: id,
        family_type: familyInfo.familyType || 'NUCLEAR',
        family_values: familyInfo.familyValues || 'MODERATE',
        father_occupation: familyInfo.fatherOccupation,
        mother_occupation: familyInfo.motherOccupation,
        brothers_count: familyInfo.brothersCount || 0,
        sisters_count: familyInfo.sistersCount || 0,
        family_location: familyInfo.familyLocation,
        about_family: familyInfo.aboutFamily,
      }], { onConflict: 'profile_id' });
    }

    if (partnerPreferences) {
      await insforgeAdmin.database.from('partner_preferences').upsert([{
        profile_id: id,
        min_age: partnerPreferences.ageRange?.min || partnerPreferences.minAge || 20,
        max_age: partnerPreferences.ageRange?.max || partnerPreferences.maxAge || 38,
        expectations_notes: partnerPreferences.expectationsNotes,
      }], { onConflict: 'profile_id' });
    }

    if (privacySettings) {
      await insforgeAdmin.database.from('privacy_settings').upsert([{
        profile_id: id,
        photo_visibility: privacySettings.photoVisibility || 'ALL',
        contact_visibility: privacySettings.contactVisibility || 'ONLY_ACCEPTED_INTERESTS',
        show_age: privacySettings.showAge ?? true,
        show_income: privacySettings.showIncome ?? true,
        show_last_seen: privacySettings.showLastSeen ?? true,
        hide_profile_temporarily: privacySettings.hideProfileTemporarily ?? false,
      }], { onConflict: 'profile_id' });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile in database.' },
      { status: 500 }
    );
  }
}
