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
import { rejectCrossSiteMutation } from '@/lib/api-auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_PASSWORDS = new Set(['password', 'password123', 'admin123', '12345678', 'qwerty123']);

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
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
    const phone = text(body.whatsappNumber ?? body.phone, 30);
    const dateOfBirth = text(body.dateOfBirth, 20);
    const country = text(body.country, 80);
    const city = text(body.city, 80);

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
    if (!Number.isFinite(age) || age < 18 || age > 100) {
      return NextResponse.json({ success: false, error: 'You must be at least 18 years old.' }, { status: 400 });
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

    const profileIdCode = `TP-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;
    const { data: newUser, error: userError } = await insforgeAdmin.database
      .from('users')
      .insert([{
        email,
        password_hash: await hashPassword(password),
        name: fullName,
        phone: phone || null,
        whatsapp_number: phone || null,
        role: 'USER',
        subscription_tier: 'FREE',
        is_verified: false,
        is_whatsapp_verified: false,
        is_email_verified: false,
        avatar_url: null,
        account_status: 'ACTIVE',
        profile_id_code: profileIdCode,
        total_connections: 30,
        used_connections: 0,
        remaining_connections: 30,
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
        caste_or_sub_clan: text(body.casteOrSubClan ?? body.caste, 100) || null,
        mother_tongue: text(body.motherTongue, 50) || 'Urdu',
        country,
        state_province: text(body.stateProvince ?? body.province, 80) || null,
        city,
        bio_headline: text(body.bioHeadline, 180),
        about_me: text(body.aboutMe, 2000),
        completion_percentage: 45,
        approval_status: 'PENDING_APPROVAL',
      }])
      .select()
      .single();
    if (profileError || !profile) throw profileError ?? new Error('Profile could not be created.');

    const childWrites = [
      insforgeAdmin.database.from('education_careers').insert([{
        profile_id: profile.id,
        highest_degree: text(body.highestDegree, 120) || 'Not specified',
        institution: text(body.institution, 160) || null,
        profession: text(body.profession, 120) || 'Not specified',
        annual_income: text(body.annualIncome, 80) || null,
      }]),
      insforgeAdmin.database.from('lifestyles').insert([{
        profile_id: profile.id,
        height: text(body.height, 30) || 'Not specified',
        mother_tongue: text(body.motherTongue, 50) || 'Urdu',
        languages_spoken: [text(body.motherTongue, 50) || 'Urdu'],
      }]),
      insforgeAdmin.database.from('family_infos').insert([{
        profile_id: profile.id,
        family_location: [text(body.city, 80), text(body.country, 80)].filter(Boolean).join(', ') || null,
      }]),
      insforgeAdmin.database.from('partner_preferences').insert([{
        profile_id: profile.id,
        min_age: 20,
        max_age: 40,
        religions: [text(body.religion, 50) || 'ISLAM'],
        marital_statuses: [text(body.maritalStatus, 40) || 'NEVER_MARRIED'],
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

    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      sessionVersion: newUser.session_version ?? 0,
    });
    const response = NextResponse.json({
      success: true,
      user: toSafeUser({ ...newUser, profile: { id: profile.id, photos: [] } }),
      profile,
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
