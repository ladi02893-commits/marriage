import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  hashPassword,
  signAuthToken,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { toSafeUser } from '@/lib/user-dto';
import { toProfileDto } from '@/lib/profile-dto';
import { rejectCrossSiteMutation } from '@/lib/api-auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_PASSWORDS = new Set(['password', 'password123', 'admin123', '12345678', 'qwerty123']);

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function stringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean).slice(0, 20);
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  let createdUserId: string | null = null;
  try {
    const body = await request.json();
    const email = text(body.email, 254).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = text(body.fullName, 100);
    const phone = text(body.phone ?? body.whatsappNumber, 30);
    const whatsappNumber = text(body.whatsappNumber ?? body.phone, 30);
    const dateOfBirth = text(body.dateOfBirth, 20);
    const country = text(body.country, 80);
    const city = text(body.city, 80);

    const [settingsRes, cmsRes] = await Promise.all([
      insforgeAdmin.database.from('system_settings').select('*').eq('id', 'default-settings').maybeSingle(),
      insforgeAdmin.database.from('cms_contents').select('data').eq('key', 'system_settings_extended').maybeSingle(),
    ]);
    const dbSettings = settingsRes.data as Record<string, any> | null;
    const extended = (cmsRes.data?.data as Record<string, any> | null) ?? {};
    if (extended.allowNewRegistrations === false) {
      return NextResponse.json(
        { success: false, error: 'New registrations are currently closed.' },
        { status: 403 },
      );
    }

    const minAge = Math.max(18, Number(dbSettings?.min_age ?? 18));
    const freeConnections = Math.max(
      0,
      Number(extended.freeTierConnectionsLimit ?? dbSettings?.free_tier_monthly_interest_limit ?? 3),
    );
    const prefix =
      typeof extended.profileIdPrefix === 'string' && /^[A-Za-z0-9-]{1,8}$/.test(extended.profileIdPrefix.trim())
        ? extended.profileIdPrefix.trim()
        : 'TP-';
    const approvalStatus = extended.requireAdminProfileApproval === false ? 'APPROVED' : 'PENDING_APPROVAL';

    if (!EMAIL_PATTERN.test(email) || fullName.length < 2 || !dateOfBirth || !country || !city || !['MALE', 'FEMALE'].includes(body.gender)) {
      return NextResponse.json(
        { success: false, error: 'Valid identity, location, email address, and date of birth are required.' },
        { status: 400 },
      );
    }
    if (password.length < 8 || password.length > 128 || BLOCKED_PASSWORDS.has(password.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Use a password of at least 8 characters that is not commonly used.' },
        { status: 400 },
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      return NextResponse.json({ success: false, error: 'Use a valid date of birth.' }, { status: 400 });
    }
    const birthDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== dateOfBirth) {
      return NextResponse.json({ success: false, error: 'Use a valid date of birth.' }, { status: 400 });
    }
    const age = Math.floor((Date.now() - birthDate.getTime()) / 31_557_600_000);
    if (!Number.isFinite(age) || age < minAge || age > 100) {
      return NextResponse.json({ success: false, error: `You must be at least ${minAge} years old.` }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const { data: existing, error: existingError } = await insforgeAdmin.database
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const profileIdCode = `${prefix}${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;
    const { data: newUser, error: userError } = await insforgeAdmin.database
      .from('users')
      .insert([{
        email,
        password_hash: await hashPassword(password),
        name: fullName,
        phone: phone || null,
        whatsapp_number: whatsappNumber || null,
        role: 'USER',
        subscription_tier: 'FREE',
        is_verified: false,
        is_whatsapp_verified: false,
        is_email_verified: false,
        avatar_url: null,
        account_status: 'ACTIVE',
        profile_id_code: profileIdCode,
        total_connections: freeConnections,
        used_connections: 0,
        remaining_connections: freeConnections,
      }])
      .select()
      .single();
    if (userError || !newUser) throw userError ?? new Error('User could not be created.');
    createdUserId = newUser.id;

    const gender = body.gender;
    const { data: profile, error: profileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .insert([{
        user_id: newUser.id,
        profile_created_for: text(body.profileCreatedFor, 30) || 'SELF',
        full_name: fullName,
        display_name: text(body.displayName, 60) || fullName.split(/\s+/)[0],
        gender,
        date_of_birth: birthDate.toISOString(),
        marital_status: text(body.maritalStatus, 40) || 'NEVER_MARRIED',
        religion: text(body.religion, 50) || 'ISLAM',
        sect_or_community: text(body.sectOrCommunity, 80) || null,
        caste_or_sub_clan: text(body.casteOrSubClan ?? body.caste ?? body.subClan, 100) || null,
        mother_tongue: text(body.motherTongue, 50) || 'Urdu',
        country,
        state_province: text(body.stateProvince ?? body.province, 80) || null,
        city,
        bio_headline: text(body.bioHeadline, 180),
        about_me: text(body.aboutMe, 2000),
        completion_percentage: 60,
        approval_status: approvalStatus,
      }])
      .select()
      .single();
    if (profileError || !profile) throw profileError ?? new Error('Profile could not be created.');

    const family = body.familyInfo && typeof body.familyInfo === 'object' ? body.familyInfo : {};
    const prefs = body.partnerPreferences && typeof body.partnerPreferences === 'object' ? body.partnerPreferences : {};
    const minPrefAge = Math.max(18, Math.min(99, Number(prefs.ageRange?.min ?? prefs.minAge ?? 20) || 20));
    const maxPrefAge = Math.max(minPrefAge, Math.min(100, Number(prefs.ageRange?.max ?? prefs.maxAge ?? 40) || 40));

    const childWrites = [
      insforgeAdmin.database.from('education_careers').insert([{
        profile_id: profile.id,
        highest_degree: text(body.highestDegree, 120) || 'Not specified',
        institution: text(body.institution, 160) || null,
        field_of_study: text(body.fieldOfStudy, 120) || null,
        profession: text(body.profession, 120) || 'Not specified',
        job_title: text(body.jobTitle, 120) || null,
        company_name: text(body.company ?? body.companyName, 160) || null,
        annual_income: text(body.annualIncome, 80) || null,
      }]),
      insforgeAdmin.database.from('lifestyles').insert([{
        profile_id: profile.id,
        height: text(body.height, 30) || 'Not specified',
        diet: ['VEGETARIAN', 'NON_VEGETARIAN', 'HALAL_ONLY', 'EGGETARIAN', 'VEGAN'].includes(body.diet) ? body.diet : 'HALAL_ONLY',
        smoking: ['NO', 'OCCASIONALLY', 'REGULARLY'].includes(body.smoking) ? body.smoking : 'NO',
        drinking: ['NO', 'OCCASIONALLY', 'SOCIALLY', 'REGULARLY'].includes(body.drinking) ? body.drinking : 'NO',
        mother_tongue: text(body.motherTongue, 50) || 'Urdu',
        languages_spoken: [text(body.motherTongue, 50) || 'Urdu'],
      }]),
      insforgeAdmin.database.from('family_infos').insert([{
        profile_id: profile.id,
        family_type: text(family.familyType, 40) || 'NUCLEAR',
        family_values: text(family.familyValues, 40) || 'MODERATE',
        father_occupation: text(family.fatherOccupation, 160) || null,
        mother_occupation: text(family.motherOccupation, 160) || null,
        brothers_count: Math.max(0, Number(family.brothersCount) || 0),
        sisters_count: Math.max(0, Number(family.sistersCount) || 0),
        family_location: text(family.familyLocation, 160) || ([city, country].filter(Boolean).join(', ') || null),
        about_family: text(family.aboutFamily, 1000) || null,
      }]),
      insforgeAdmin.database.from('partner_preferences').insert([{
        profile_id: profile.id,
        min_age: minPrefAge,
        max_age: maxPrefAge,
        religions: stringArray(prefs.religions, [text(body.religion, 50) || 'ISLAM']),
        marital_statuses: stringArray(prefs.maritalStatuses ?? prefs.maritalStatus, [text(body.maritalStatus, 40) || 'NEVER_MARRIED']),
        education_levels: stringArray(prefs.educationLevels),
        professions: stringArray(prefs.professions),
        countries: stringArray(prefs.preferredLocations),
        expectations_notes: text(prefs.expectationsNotes, 1000) || null,
      }]),
      insforgeAdmin.database.from('privacy_settings').insert([{
        profile_id: profile.id,
        photo_visibility: 'ONLY_ACCEPTED_INTERESTS',
        contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
        show_age: true,
        show_income: false,
      }]),
    ];
    const childResults = await Promise.all(childWrites);
    const childError = childResults.find((result) => result.error)?.error;
    if (childError) throw childError;

    const { data: fullProfile, error: fetchProfileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .select('*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status)')
      .eq('id', profile.id)
      .single();
    if (fetchProfileError) throw fetchProfileError;

    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      sessionVersion: newUser.session_version ?? 0,
    });
    const response = NextResponse.json({
      success: true,
      user: toSafeUser({ ...newUser, profile: { id: profile.id, photos: [] } }),
      profile: await toProfileDto(fullProfile, true, true),
      redirectUrl: '/dashboard',
      message: 'Account created. Email and WhatsApp verification are pending.',
    }, { status: 201 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    if (createdUserId) {
      const { error: rollbackError } = await insforgeAdmin.database.from('users').delete().eq('id', createdUserId);
      if (rollbackError) console.error('Registration rollback failed:', rollbackError.message);
    }
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registration could not be completed.' }, { status: 500 });
  }
}
