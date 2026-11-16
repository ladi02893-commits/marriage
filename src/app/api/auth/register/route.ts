import { randomInt, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  hashPassword,
  signAuthToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { toSafeUser } from '@/lib/user-dto';
import { toProfileDto } from '@/lib/profile-dto';
import { rejectCrossSiteMutation } from '@/lib/api-auth';
import { linkUserToBureau } from '@/lib/bureau-store';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/;
const BLOCKED_PASSWORDS = new Set(['password', 'password123', 'admin123', '12345678', 'qwerty123']);

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  let createdUserId: string | null = null;
  try {
    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action : 'COMPLETE_REGISTRATION';
    const email = text(body.email, 254).toLowerCase();
    const username = text(body.username, 30);
    const firstName = text(body.firstName, 50);
    const lastName = text(body.lastName, 50);
    const password = typeof body.password === 'string' ? body.password : '';

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

    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Username must be 3–30 characters using letters, numbers, dots, hyphens, or underscores.' },
        { status: 400 },
      );
    }
    if (firstName.length < 1 || lastName.length < 1 || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and a valid email address are required.' },
        { status: 400 },
      );
    }
    if (password.length < 8 || password.length > 128 || BLOCKED_PASSWORDS.has(password.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Use a password of at least 8 characters that is not commonly used.' },
        { status: 400 },
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = checkRateLimit(`register:${ip}`, 15, 60 * 60 * 1000);
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

    // -------------------------------------------------------------------------
    // STEP 1: Send 6-digit verification code to the user's email
    // -------------------------------------------------------------------------
    if (action === 'SEND_VERIFICATION_CODE') {
      const code = String(randomInt(100000, 1000000));
      const verificationToken = await signEmailVerificationToken({
        email,
        username,
        firstName,
        lastName,
        code,
      });

      let emailSent = false;
      try {
        const emailResult = await insforgeAdmin.emails.send({
          to: email,
          subject: `${code} — Your Email Verification Code`,
          html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px">
            <h2 style="margin:0 0 12px;color:#7c2d12">Email Verification</h2>
            <p style="font-size:14px;color:#374151">Assalam-o-Alaikum ${escapeHtml(firstName)} ${escapeHtml(lastName)} (@${escapeHtml(username)}),</p>
            <p style="font-size:14px;color:#374151">Use the 6-digit code below to verify your email address and complete registration:</p>
            <div style="margin:20px 0;padding:16px;background:#fef3c7;border-radius:12px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#78350f">${code}</div>
            <p style="font-size:12px;color:#6b7280">This code expires in 15 minutes.</p>
          </div>`,
        });
        emailSent = !emailResult.error;
      } catch {
        emailSent = false;
      }

      return NextResponse.json({
        success: true,
        verificationRequired: true,
        verificationToken,
        emailSent,
        devCodePreview: emailSent ? undefined : code,
        message: emailSent
          ? `Verification code sent to ${email}.`
          : `Verification code generated for ${email}.`,
      });
    }

    // -------------------------------------------------------------------------
    // STEP 2: Verify the 6-digit code and create the user + starter profile
    // -------------------------------------------------------------------------
    const verificationCode = text(body.verificationCode, 12);
    const verificationToken = typeof body.verificationToken === 'string' ? body.verificationToken.trim() : '';
    const verifiedPayload = await verifyEmailVerificationToken(verificationToken);

    if (
      !verifiedPayload ||
      verifiedPayload.email !== email ||
      verifiedPayload.code !== verificationCode
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired email verification code. Please check the 6-digit code and try again.' },
        { status: 400 },
      );
    }

    const freeConnections = Math.max(
      0,
      Number(extended.freeTierConnectionsLimit ?? dbSettings?.free_tier_monthly_interest_limit ?? 3),
    );
    const prefix =
      typeof extended.profileIdPrefix === 'string' && /^[A-Za-z0-9-]{1,8}$/.test(extended.profileIdPrefix.trim())
        ? extended.profileIdPrefix.trim()
        : 'TP-';

    const resolvedFirstName = verifiedPayload.firstName || firstName;
    const resolvedLastName = verifiedPayload.lastName || lastName;
    const resolvedUsername = verifiedPayload.username || username;
    const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();
    const displayName = resolvedUsername || resolvedFirstName;
    const profileIdCode = `${prefix}${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;

    const { data: newUser, error: userError } = await insforgeAdmin.database
      .from('users')
      .insert([{
        email,
        password_hash: await hashPassword(password),
        name: fullName,
        phone: null,
        whatsapp_number: null,
        role: 'USER',
        subscription_tier: 'FREE',
        is_verified: false,
        is_whatsapp_verified: false,
        is_email_verified: true,
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

    const { data: profile, error: profileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .insert([{
        user_id: newUser.id,
        profile_created_for: 'SELF',
        full_name: fullName,
        display_name: displayName,
        gender: body.gender === 'MALE' ? 'MALE' : 'FEMALE',
        date_of_birth: '2000-01-01T00:00:00.000Z',
        marital_status: 'NEVER_MARRIED',
        religion: 'ISLAM',
        mother_tongue: 'Urdu',
        country: text(body.country, 80) || 'Pakistan',
        city: text(body.city, 80) || 'Not specified',
        bio_headline: '',
        about_me: '',
        completion_percentage: 20,
        approval_status: 'PENDING_APPROVAL',
      }])
      .select()
      .single();
    if (profileError || !profile) throw profileError ?? new Error('Profile could not be created.');

    const childWrites = [
      insforgeAdmin.database.from('education_careers').insert([{
        profile_id: profile.id,
        highest_degree: 'Not specified',
        profession: 'Not specified',
      }]),
      insforgeAdmin.database.from('lifestyles').insert([{
        profile_id: profile.id,
        height: 'Not specified',
        diet: 'HALAL_ONLY',
        smoking: 'NO',
        drinking: 'NO',
        mother_tongue: 'Urdu',
        languages_spoken: ['Urdu'],
      }]),
      insforgeAdmin.database.from('family_infos').insert([{
        profile_id: profile.id,
        family_type: 'NUCLEAR',
        family_values: 'MODERATE',
        brothers_count: 0,
        sisters_count: 0,
      }]),
      insforgeAdmin.database.from('partner_preferences').insert([{
        profile_id: profile.id,
        min_age: 20,
        max_age: 38,
        religions: ['ISLAM'],
        marital_statuses: ['NEVER_MARRIED'],
        education_levels: [],
        professions: [],
        countries: ['Pakistan'],
      }]),
      insforgeAdmin.database.from('privacy_settings').insert([{
        profile_id: profile.id,
        photo_visibility: 'ONLY_ACCEPTED_INTERESTS',
        contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
        show_age: true,
        show_income: false,
      }]),
      insforgeAdmin.database.from('notifications').insert([{
        user_id: newUser.id,
        title: 'Complete your profile & select your Marriage Bureau',
        description: 'Fill out all required and optional profile details, choose your Marriage Bureau name, and submit your profile for Admin approval.',
        type: 'SYSTEM',
        link_url: '/dashboard/profile?onboarding=1',
      }]),
    ];
    const childResults = await Promise.all(childWrites);
    const childError = childResults.find((result) => result.error)?.error;
    if (childError) throw childError;

    await linkUserToBureau(newUser.id, '', false, { username: resolvedUsername });

    const { data: fullProfile, error: fetchProfileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .select('*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status,assigned_consultant_id)')
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
      user: {
        ...toSafeUser({ ...newUser, profile: { id: profile.id, photos: [] } }),
        username: resolvedUsername,
      },
      profile: await toProfileDto(fullProfile, true, true, { username: resolvedUsername }),
      redirectUrl: '/dashboard/profile?onboarding=1',
      message: 'Account verified! Please complete your profile details and select your Marriage Bureau on the dashboard.',
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
