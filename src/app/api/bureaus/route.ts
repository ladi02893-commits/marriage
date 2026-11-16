import { randomBytes, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  getCurrentUserFromCookies,
  hashPassword,
  signAuthToken,
} from '@/lib/auth';
import {
  ADMIN_ROLES,
  BUREAU_ROLES,
  rejectCrossSiteMutation,
  requireAdmin,
  requireUser,
} from '@/lib/api-auth';
import {
  getBureauPlans,
  getBureausRegistry,
  getUserBureauMap,
  linkUserToBureau,
  saveBureauPlans,
  saveBureausRegistry,
} from '@/lib/bureau-store';
import { checkRateLimit } from '@/lib/rate-limit';
import { toProfileDto } from '@/lib/profile-dto';
import { toSafeUser } from '@/lib/user-dto';
import { BureauApprovalStatus, BureauPlanSlug, MarriageBureau } from '@/lib/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_PASSWORDS = new Set(['password', 'password123', 'admin123', '12345678', 'qwerty123']);

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function stringList(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean).slice(0, 20);
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
  }
  return fallback;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookies();
    const isAdmin = currentUser ? ADMIN_ROLES.has(currentUser.role) : false;

    const [bureaus, bureauPlans, userBureauMap, usersRes] = await Promise.all([
      getBureausRegistry(),
      getBureauPlans(),
      getUserBureauMap(),
      insforgeAdmin.database
        .from('users')
        .select('id,role,assigned_consultant_id')
        .eq('role', 'USER'),
    ]);

    const clientCounts = new Map<string, number>();
    for (const u of (usersRes.data ?? []) as Array<{ id: string; role: string; assigned_consultant_id?: string | null }>) {
      const linkedBureauId = userBureauMap[u.id]?.bureauId || u.assigned_consultant_id || null;
      if (linkedBureauId) {
        clientCounts.set(linkedBureauId, (clientCounts.get(linkedBureauId) ?? 0) + 1);
      }
    }

    const params = request.nextUrl.searchParams;
    const cityFilter = text(params.get('city'), 80).toLowerCase();
    const statusFilter = text(params.get('status'), 30).toUpperCase();

    let visible = bureaus
      .map((b) => ({
        ...b,
        clientCount: clientCounts.get(b.id) ?? 0,
      }))
      .filter((b) => {
        if (isAdmin) return true;
        if (currentUser && (b.ownerUserId === currentUser.id || b.id === currentUser.assigned_consultant_id)) {
          return true;
        }
        return b.approvalStatus === 'APPROVED';
      });

    if (statusFilter && statusFilter !== 'ALL') {
      visible = visible.filter((b) => b.approvalStatus === statusFilter);
    }

    if (cityFilter && cityFilter !== 'all') {
      const exactOrServiceMatches = visible.filter((b) => {
        const primaryCity = (b.city || '').toLowerCase();
        const extraCities = (b.serviceCities ?? []).map((c) => c.toLowerCase());
        return (
          primaryCity === cityFilter ||
          primaryCity.includes(cityFilter) ||
          extraCities.some((c) => c === cityFilter || c.includes(cityFilter))
        );
      });
      if (exactOrServiceMatches.length > 0 || params.get('strictCity') === '1') {
        visible = exactOrServiceMatches;
      }
    }

    return NextResponse.json({
      success: true,
      data: visible,
      bureauPlans,
      total: visible.length,
    });
  } catch (error) {
    console.error('Bureaus GET failed:', error);
    return NextResponse.json({ success: false, error: 'Marriage bureaus could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  let createdUserId: string | null = null;
  try {
    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action : 'REGISTER_BUREAU';

    // -------------------------------------------------------------------------
    // 0. RECHARGE_BUREAU — Bureau submits subscription package recharge request
    // -------------------------------------------------------------------------
    if (action === 'RECHARGE_BUREAU') {
      const auth = await requireUser();
      if (auth.response) return auth.response;
      if (!BUREAU_ROLES.has(auth.user.role) && !ADMIN_ROLES.has(auth.user.role)) {
        return NextResponse.json({ success: false, error: 'Marriage Bureau account required.' }, { status: 403 });
      }

      const planSlug = text(body.planSlug, 30) as BureauPlanSlug;
      const paymentMethod = text(body.paymentMethod, 60) || 'BANK_TRANSFER';
      const transactionId = text(body.transactionId, 120);
      if (!['BUREAU_1M', 'BUREAU_3M', 'BUREAU_1Y'].includes(planSlug)) {
        return NextResponse.json({ success: false, error: 'Select a valid 1-Month, 3-Month, or 1-Year package.' }, { status: 400 });
      }
      if (transactionId.length < 3) {
        return NextResponse.json({ success: false, error: 'Please provide a valid payment reference / transaction ID.' }, { status: 400 });
      }

      const [bureaus, plans] = await Promise.all([getBureausRegistry(), getBureauPlans()]);
      const idx = bureaus.findIndex(
        (b) => b.ownerUserId === auth.user.id || b.id === auth.user.assigned_consultant_id,
      );
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Marriage Bureau record not found.' }, { status: 404 });
      }

      const selectedPlan = plans.find((p) => p.slug === planSlug);
      if (!selectedPlan) {
        return NextResponse.json({ success: false, error: 'Bureau subscription package not found.' }, { status: 404 });
      }

      const existing = bureaus[idx];
      const updatedBureau: MarriageBureau = {
        ...existing,
        subscriptionStatus: existing.subscriptionStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING_VERIFICATION',
        pendingRechargeRequest: {
          planSlug: selectedPlan.slug,
          planName: selectedPlan.name,
          amountPKR: selectedPlan.pricePKR,
          durationDays: selectedPlan.durationDays,
          paymentMethod,
          transactionId,
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      const nextBureaus = [...bureaus];
      nextBureaus[idx] = updatedBureau;
      await saveBureausRegistry(nextBureaus);

      return NextResponse.json({
        success: true,
        data: updatedBureau,
        message: 'Bureau subscription recharge submitted for Admin verification.',
      });
    }

    // -------------------------------------------------------------------------
    // 1. ADMIN_CREATE_BUREAU — Admin creates an approved bureau directly
    // -------------------------------------------------------------------------
    if (action === 'ADMIN_CREATE_BUREAU') {
      const adminAuth = await requireAdmin();
      if (adminAuth.response) return adminAuth.response;

      const name = text(body.name ?? body.bureauName, 140);
      const ownerName = text(body.ownerName, 100) || name;
      const email = text(body.email, 254).toLowerCase();
      const phone = text(body.phone, 30);
      const whatsappNumber = text(body.whatsappNumber ?? body.phone, 30);
      const country = text(body.country, 80) || 'Pakistan';
      const stateProvince = text(body.stateProvince ?? body.province, 80);
      const city = text(body.city, 80);
      const address = text(body.address, 250);
      const password = typeof body.password === 'string' ? body.password : '';

      if (name.length < 3 || !EMAIL_PATTERN.test(email) || !phone || !city || !address) {
        return NextResponse.json(
          { success: false, error: 'Bureau name, valid email, phone, city, and address are required.' },
          { status: 400 },
        );
      }

      const bureaus = await getBureausRegistry();
      const bureauId = `bureau-${randomUUID()}`;
      const cityTag = (city.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'PAK').toUpperCase();
      const bureauCode = `MB-${cityTag}-${String(bureaus.length + 101).slice(-3)}`;

      let ownerUserId: string | undefined;
      if (password.length >= 8) {
        const { data: existingUser } = await insforgeAdmin.database
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (existingUser) {
          return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
        }
        const { data: newOwner, error: ownerErr } = await insforgeAdmin.database
          .from('users')
          .insert([{
            email,
            password_hash: await hashPassword(password),
            name: ownerName,
            phone,
            whatsapp_number: whatsappNumber || phone,
            role: 'BUREAU',
            subscription_tier: 'FREE',
            is_verified: true,
            is_whatsapp_verified: false,
            is_email_verified: true,
            account_status: 'ACTIVE',
            profile_id_code: bureauCode,
            assigned_consultant_id: bureauId,
            total_connections: 0,
            used_connections: 0,
            remaining_connections: 0,
          }])
          .select()
          .single();
        if (ownerErr || !newOwner) throw ownerErr ?? new Error('Bureau account could not be created.');
        ownerUserId = newOwner.id;
        createdUserId = newOwner.id;
      }

      const newBureau: MarriageBureau = {
        id: bureauId,
        bureauCode,
        ownerUserId,
        name,
        ownerName,
        email,
        phone,
        whatsappNumber: whatsappNumber || phone,
        country,
        stateProvince: stateProvince || undefined,
        city,
        serviceCities: Array.from(new Set([city, ...stringList(body.serviceCities)])),
        address,
        registrationNumber: text(body.registrationNumber, 80) || undefined,
        description: text(body.description, 1000) || undefined,
        specializations: stringList(body.specializations),
        rishtaScope: body.rishtaScope === 'BUREAU_PRIORITY' ? 'BUREAU_PRIORITY' : 'ALL_PLATFORM',
        approvalStatus: 'APPROVED',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveBureausRegistry([newBureau, ...bureaus]);
      if (ownerUserId) {
        await linkUserToBureau(ownerUserId, bureauId, false);
      }
      return NextResponse.json({ success: true, data: newBureau }, { status: 201 });
    }

    // -------------------------------------------------------------------------
    // 2. CREATE_CLIENT — Approved Bureau (or Admin) adds a walk-in client profile
    // -------------------------------------------------------------------------
    if (action === 'CREATE_CLIENT') {
      const auth = await requireUser();
      if (auth.response) return auth.response;

      const isAdmin = ADMIN_ROLES.has(auth.user.role);
      const isBureau = BUREAU_ROLES.has(auth.user.role);
      if (!isAdmin && !isBureau) {
        return NextResponse.json({ success: false, error: 'Bureau or Administrator privileges required.' }, { status: 403 });
      }

      const bureaus = await getBureausRegistry();
      const targetBureau = isAdmin && typeof body.bureauId === 'string' && body.bureauId
        ? bureaus.find((b) => b.id === body.bureauId)
        : bureaus.find((b) => b.ownerUserId === auth.user.id || b.id === auth.user.assigned_consultant_id);

      if (!targetBureau) {
        return NextResponse.json({ success: false, error: 'Marriage Bureau record not found.' }, { status: 404 });
      }
      if (!isAdmin && targetBureau.approvalStatus !== 'APPROVED') {
        return NextResponse.json(
          { success: false, error: 'Your Marriage Bureau must be approved by Admin before adding clients.' },
          { status: 403 },
        );
      }

      const fullName = text(body.fullName, 100);
      const gender = body.gender;
      const dateOfBirth = text(body.dateOfBirth, 20);
      const country = text(body.country, 80) || targetBureau.country || 'Pakistan';
      const city = text(body.city, 80) || targetBureau.city;
      const phone = text(body.phone, 30) || targetBureau.phone;
      const whatsappNumber = text(body.whatsappNumber ?? body.phone, 30) || phone;
      const rawPassword = typeof body.password === 'string' && body.password.trim()
        ? body.password
        : randomBytes(12).toString('hex');

      if (fullName.length < 2 || !['MALE', 'FEMALE'].includes(gender) || !dateOfBirth || !country || !city) {
        return NextResponse.json(
          { success: false, error: 'Client full name, gender, date of birth, country, and city are required.' },
          { status: 400 },
        );
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        return NextResponse.json({ success: false, error: 'Use a valid date of birth.' }, { status: 400 });
      }
      const birthDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
      const age = Math.floor((Date.now() - birthDate.getTime()) / 31_557_600_000);
      if (Number.isNaN(birthDate.getTime()) || !Number.isFinite(age) || age < 18 || age > 100) {
        return NextResponse.json({ success: false, error: 'Client must be aged between 18 and 100 years.' }, { status: 400 });
      }

      const profileIdCode = `TP-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;
      const providedEmail = text(body.email, 254).toLowerCase();
      const email = providedEmail || `${profileIdCode.toLowerCase()}@client.truepair.pk`;
      if (!EMAIL_PATTERN.test(email)) {
        return NextResponse.json({ success: false, error: 'Provide a valid client email address.' }, { status: 400 });
      }

      const { data: existingClient } = await insforgeAdmin.database
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existingClient) {
        return NextResponse.json({ success: false, error: 'An account with this client email already exists.' }, { status: 409 });
      }

      const { data: newClientUser, error: clientUserErr } = await insforgeAdmin.database
        .from('users')
        .insert([{
          email,
          password_hash: await hashPassword(rawPassword),
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
          assigned_consultant_id: targetBureau.id,
          total_connections: 3,
          used_connections: 0,
          remaining_connections: 3,
        }])
        .select()
        .single();
      if (clientUserErr || !newClientUser) throw clientUserErr ?? new Error('Client user creation failed.');
      createdUserId = newClientUser.id;

      const nameParts = fullName.split(/\s+/);
      const defaultDisplay = text(body.displayName, 60) || `${nameParts[0]}${nameParts[1] ? ` ${nameParts[1][0]}.` : ''}`;

      const { data: profile, error: profileErr } = await insforgeAdmin.database
        .from('matrimonial_profiles')
        .insert([{
          user_id: newClientUser.id,
          profile_created_for: text(body.profileCreatedFor, 30) || 'PARENTS',
          full_name: fullName,
          display_name: defaultDisplay,
          gender,
          date_of_birth: birthDate.toISOString(),
          marital_status: text(body.maritalStatus, 40) || 'NEVER_MARRIED',
          religion: text(body.religion, 50) || 'ISLAM',
          sect_or_community: text(body.sectOrCommunity, 80) || null,
          caste_or_sub_clan: text(body.caste, 100) || null,
          mother_tongue: text(body.motherTongue, 50) || 'Urdu',
          country,
          state_province: text(body.stateProvince, 80) || null,
          city,
          bio_headline: text(body.bioHeadline, 180) || `Managed by ${targetBureau.name}`,
          about_me: text(body.aboutMe, 2000) || `Registered walk-in family client verified through ${targetBureau.name} (${targetBureau.city}).`,
          completion_percentage: 70,
          approval_status: 'APPROVED',
        }])
        .select()
        .single();
      if (profileErr || !profile) throw profileErr ?? new Error('Client profile creation failed.');

      const family = body.familyInfo && typeof body.familyInfo === 'object' ? body.familyInfo : {};
      const childResults = await Promise.all([
        insforgeAdmin.database.from('education_careers').insert([{
          profile_id: profile.id,
          highest_degree: text(body.highestDegree, 120) || "Bachelor's Degree",
          institution: text(body.institution, 160) || null,
          field_of_study: text(body.fieldOfStudy, 120) || null,
          profession: text(body.profession, 120) || 'Professional',
          job_title: text(body.jobTitle, 120) || null,
          company_name: text(body.company, 160) || null,
          annual_income: text(body.annualIncome, 80) || null,
        }]),
        insforgeAdmin.database.from('lifestyles').insert([{
          profile_id: profile.id,
          height: text(body.height, 30) || '5 ft 6 in (168 cm)',
          diet: 'HALAL_ONLY',
          smoking: 'NO',
          drinking: 'NO',
          mother_tongue: text(body.motherTongue, 50) || 'Urdu',
          languages_spoken: [text(body.motherTongue, 50) || 'Urdu'],
        }]),
        insforgeAdmin.database.from('family_infos').insert([{
          profile_id: profile.id,
          family_type: text(family.familyType ?? body.familyType, 40) || 'NUCLEAR',
          family_values: text(family.familyValues ?? body.familyValues, 40) || 'MODERATE',
          father_occupation: text(family.fatherOccupation ?? body.fatherOccupation, 160) || null,
          mother_occupation: text(family.motherOccupation ?? body.motherOccupation, 160) || null,
          brothers_count: Math.max(0, Number(family.brothersCount ?? body.brothersCount) || 0),
          sisters_count: Math.max(0, Number(family.sistersCount ?? body.sistersCount) || 0),
          family_location: `${city}, ${country}`,
          about_family: text(family.aboutFamily ?? body.aboutFamily, 1000) || null,
        }]),
        insforgeAdmin.database.from('partner_preferences').insert([{
          profile_id: profile.id,
          min_age: 20,
          max_age: 38,
          religions: [text(body.religion, 50) || 'ISLAM'],
          marital_statuses: [text(body.maritalStatus, 40) || 'NEVER_MARRIED'],
          education_levels: [],
          professions: [],
          countries: [country],
          expectations_notes: text(body.expectationsNotes, 1000) || null,
        }]),
        insforgeAdmin.database.from('privacy_settings').insert([{
          profile_id: profile.id,
          photo_visibility: 'ONLY_ACCEPTED_INTERESTS',
          contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
          show_age: true,
          show_income: false,
        }]),
      ]);
      const childErr = childResults.find((r) => r.error)?.error;
      if (childErr) throw childErr;

      await linkUserToBureau(newClientUser.id, targetBureau.id, true);

      const { data: fullProfile, error: fetchErr } = await insforgeAdmin.database
        .from('matrimonial_profiles')
        .select('*,photos:profile_photos(*),educationCareer:education_careers(*),lifestyle:lifestyles(*),familyInfo:family_infos(*),partnerPreferences:partner_preferences(*),privacySettings:privacy_settings(*),user:users(id,phone,whatsapp_number,profile_id_code,is_verified,is_whatsapp_verified,is_email_verified,account_status,assigned_consultant_id)')
        .eq('id', profile.id)
        .single();
      if (fetchErr) throw fetchErr;

      return NextResponse.json({
        success: true,
        data: await toProfileDto(fullProfile, true, true, {
          id: targetBureau.id,
          name: targetBureau.name,
          bureauCode: targetBureau.bureauCode,
          createdByBureau: true,
        }),
      }, { status: 201 });
    }

    // -------------------------------------------------------------------------
    // 3. REGISTER_BUREAU — Self-registration for a new Marriage Bureau (Daftar)
    // -------------------------------------------------------------------------
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limit = checkRateLimit(`register-bureau:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const email = text(body.email, 254).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const bureauName = text(body.bureauName ?? body.name, 140);
    const ownerName = text(body.ownerName ?? body.fullName, 100);
    const phone = text(body.phone, 30);
    const whatsappNumber = text(body.whatsappNumber ?? body.phone, 30);
    const country = text(body.country, 80) || 'Pakistan';
    const stateProvince = text(body.stateProvince ?? body.province, 80);
    const city = text(body.city, 80);
    const address = text(body.address, 250);

    if (
      bureauName.length < 3 ||
      ownerName.length < 2 ||
      !EMAIL_PATTERN.test(email) ||
      !phone ||
      !city ||
      !address
    ) {
      return NextResponse.json(
        { success: false, error: 'Please provide office name, owner name, email, phone, country, city, and address.' },
        { status: 400 },
      );
    }
    if (password.length < 8 || password.length > 128 || BLOCKED_PASSWORDS.has(password.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Use a strong password of at least 8 characters.' },
        { status: 400 },
      );
    }

    const { data: existing, error: existingErr } = await insforgeAdmin.database
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingErr) throw existingErr;
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const bureaus = await getBureausRegistry();
    const bureauId = `bureau-${randomUUID()}`;
    const cityTag = (city.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'PAK').toUpperCase();
    const bureauCode = `MB-${cityTag}-${randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase()}`;

    const { data: newUser, error: userErr } = await insforgeAdmin.database
      .from('users')
      .insert([{
        email,
        password_hash: await hashPassword(password),
        name: ownerName,
        phone,
        whatsapp_number: whatsappNumber || phone,
        role: 'BUREAU',
        subscription_tier: 'FREE',
        is_verified: false,
        is_whatsapp_verified: false,
        is_email_verified: false,
        avatar_url: null,
        account_status: 'ACTIVE',
        profile_id_code: bureauCode,
        assigned_consultant_id: bureauId,
        total_connections: 0,
        used_connections: 0,
        remaining_connections: 0,
      }])
      .select()
      .single();
    if (userErr || !newUser) throw userErr ?? new Error('Bureau user account could not be created.');
    createdUserId = newUser.id;

    const newBureau: MarriageBureau = {
      id: bureauId,
      bureauCode,
      ownerUserId: newUser.id,
      name: bureauName,
      ownerName,
      email,
      phone,
      whatsappNumber: whatsappNumber || phone,
      country,
      stateProvince: stateProvince || undefined,
      city,
      serviceCities: Array.from(new Set([city, ...stringList(body.serviceCities)])),
      address,
      registrationNumber: text(body.registrationNumber, 80) || undefined,
      description: text(body.description, 1000) || undefined,
      specializations: stringList(body.specializations),
      rishtaScope: body.rishtaScope === 'BUREAU_PRIORITY' ? 'BUREAU_PRIORITY' : 'ALL_PLATFORM',
      approvalStatus: 'PENDING',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveBureausRegistry([newBureau, ...bureaus]);
    await linkUserToBureau(newUser.id, bureauId, false);

    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      sessionVersion: newUser.session_version ?? 0,
    });

    const response = NextResponse.json({
      success: true,
      user: toSafeUser(newUser),
      bureau: newBureau,
      redirectUrl: '/bureau',
      message: 'Marriage Bureau submitted for Admin approval.',
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
      await insforgeAdmin.database.from('users').delete().eq('id', createdUserId);
    }
    console.error('Bureaus POST failed:', error);
    return NextResponse.json({ success: false, error: 'Marriage bureau request failed.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const isAdmin = ADMIN_ROLES.has(auth.user.role);
    const isBureau = BUREAU_ROLES.has(auth.user.role);

    const [bureaus, userBureauMap] = await Promise.all([
      getBureausRegistry(),
      getUserBureauMap(),
    ]);

    // Update Marriage Bureau subscription plan prices (Admin only)
    if (body.action === 'UPDATE_BUREAU_PLAN') {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Administrator access required.' }, { status: 403 });
      }
      const slug = text(body.slug, 30) as BureauPlanSlug;
      if (!['BUREAU_1M', 'BUREAU_3M', 'BUREAU_1Y'].includes(slug)) {
        return NextResponse.json({ success: false, error: 'Valid bureau plan slug is required.' }, { status: 400 });
      }
      const plans = await getBureauPlans();
      const idx = plans.findIndex((p) => p.slug === slug);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Bureau subscription plan not found.' }, { status: 404 });
      }
      const pricePKR = body.pricePKR !== undefined ? Number(body.pricePKR) : plans[idx].pricePKR;
      if (!Number.isFinite(pricePKR) || pricePKR < 0) {
        return NextResponse.json({ success: false, error: 'Price must be a valid non-negative number.' }, { status: 400 });
      }
      const nextPlans = [...plans];
      nextPlans[idx] = {
        ...plans[idx],
        pricePKR,
        ...(typeof body.name === 'string' && body.name.trim() ? { name: body.name.trim().slice(0, 100) } : {}),
        ...(typeof body.description === 'string' ? { description: body.description.trim().slice(0, 300) } : {}),
        ...(Array.isArray(body.features) ? { features: body.features.map(String).slice(0, 10) } : {}),
      };
      await saveBureauPlans(nextPlans);
      return NextResponse.json({ success: true, data: nextPlans });
    }

    // Activate or recharge a Marriage Bureau subscription (Admin only)
    if (body.action === 'ACTIVATE_BUREAU_SUBSCRIPTION') {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Administrator access required.' }, { status: 403 });
      }
      const targetBureauId = text(body.bureauId ?? body.id, 100);
      const planSlug = text(body.planSlug, 30) as BureauPlanSlug;
      const plans = await getBureauPlans();
      const plan = plans.find((p) => p.slug === planSlug);
      if (!plan) {
        return NextResponse.json({ success: false, error: 'Invalid bureau subscription plan.' }, { status: 400 });
      }
      const idx = bureaus.findIndex((b) => b.id === targetBureauId);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Marriage Bureau not found.' }, { status: 404 });
      }
      const existing = bureaus[idx];
      const existingExpiryMs = existing.subscriptionExpiresAt ? new Date(existing.subscriptionExpiresAt).getTime() : 0;
      const baseMs = Number.isFinite(existingExpiryMs) && existingExpiryMs > Date.now() ? existingExpiryMs : Date.now();
      const nextExpiry = new Date(baseMs + plan.durationDays * 86_400_000).toISOString();

      const updated: MarriageBureau = {
        ...existing,
        approvalStatus: 'APPROVED',
        isVerified: true,
        subscriptionPlanSlug: plan.slug,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: nextExpiry,
        pendingRechargeRequest: null,
        updatedAt: new Date().toISOString(),
      };
      const nextBureaus = [...bureaus];
      nextBureaus[idx] = updated;
      await saveBureausRegistry(nextBureaus);

      if (existing.ownerUserId) {
        await insforgeAdmin.database.from('notifications').insert([{
          user_id: existing.ownerUserId,
          title: `${plan.name} Activated!`,
          description: `Your Marriage Bureau (${existing.name}) recharge is active until ${new Date(nextExpiry).toLocaleDateString()}.`,
          type: 'PAYMENT_APPROVED',
          link_url: '/bureau',
        }]);
      }
      return NextResponse.json({ success: true, data: updated });
    }

    // Update a client profile status belonging to this bureau
    if (body.action === 'UPDATE_CLIENT_STATUS') {
      if (!isAdmin && !isBureau) {
        return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
      }
      const profileId = text(body.profileId, 100);
      const nextStatus = text(body.approvalStatus, 40);
      if (!profileId || !['APPROVED', 'CHANGES_REQUESTED', 'PENDING_APPROVAL'].includes(nextStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid profile ID or approval status.' }, { status: 400 });
      }

      const ownBureau = isAdmin
        ? bureaus.find((b) => b.id === body.bureauId)
        : bureaus.find((b) => b.ownerUserId === auth.user.id || b.id === auth.user.assigned_consultant_id);

      if (!isAdmin && (!ownBureau || ownBureau.approvalStatus !== 'APPROVED')) {
        return NextResponse.json({ success: false, error: 'Only approved bureaus can manage client profiles.' }, { status: 403 });
      }

      const { data: targetProfile, error: profErr } = await insforgeAdmin.database
        .from('matrimonial_profiles')
        .select('id,user_id')
        .eq('id', profileId)
        .maybeSingle();
      if (profErr) throw profErr;
      if (!targetProfile) return NextResponse.json({ success: false, error: 'Client profile not found.' }, { status: 404 });

      if (!isAdmin && ownBureau) {
        const { data: targetUser } = await insforgeAdmin.database
          .from('users')
          .select('id,assigned_consultant_id')
          .eq('id', targetProfile.user_id)
          .maybeSingle();
        const linkedBureauId = userBureauMap[targetProfile.user_id]?.bureauId || targetUser?.assigned_consultant_id;
        if (linkedBureauId !== ownBureau.id) {
          return NextResponse.json({ success: false, error: 'This client does not belong to your Marriage Bureau.' }, { status: 403 });
        }
      }

      const { error: updateErr } = await insforgeAdmin.database
        .from('matrimonial_profiles')
        .update({ approval_status: nextStatus })
        .eq('id', profileId);
      if (updateErr) throw updateErr;

      await insforgeAdmin.database.from('notifications').insert([{
        user_id: targetProfile.user_id,
        title: nextStatus === 'APPROVED' ? 'Profile approved by your Marriage Bureau' : 'Profile changes requested',
        description: nextStatus === 'APPROVED'
          ? 'Your profile has been approved and is now active.'
          : 'Your Marriage Bureau requested updates to your profile.',
        type: nextStatus === 'APPROVED' ? 'PROFILE_APPROVED' : 'PROFILE_CHANGES_REQUESTED',
        link_url: '/dashboard/profile',
      }]);

      return NextResponse.json({ success: true });
    }

    const bureauId = text(body.id, 100);
    const targetIdx = bureaus.findIndex((b) => b.id === bureauId);
    if (targetIdx === -1) {
      return NextResponse.json({ success: false, error: 'Marriage Bureau not found.' }, { status: 404 });
    }
    const existing = bureaus[targetIdx];

    if (!isAdmin) {
      const isOwner = isBureau && (existing.ownerUserId === auth.user.id || existing.id === auth.user.assigned_consultant_id);
      if (!isOwner) {
        return NextResponse.json({ success: false, error: 'Administrator or Bureau owner permission required.' }, { status: 403 });
      }
      if (body.approvalStatus !== undefined || body.isVerified !== undefined) {
        return NextResponse.json({ success: false, error: 'Only an Administrator can change bureau approval status.' }, { status: 403 });
      }
    }

    const validStatuses: BureauApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    const nextApprovalStatus =
      isAdmin && typeof body.approvalStatus === 'string' && validStatuses.includes(body.approvalStatus as BureauApprovalStatus)
        ? (body.approvalStatus as BureauApprovalStatus)
        : existing.approvalStatus;

    const updated: MarriageBureau = {
      ...existing,
      ...(typeof body.name === 'string' && body.name.trim() ? { name: body.name.trim().slice(0, 140) } : {}),
      ...(typeof body.ownerName === 'string' && body.ownerName.trim() ? { ownerName: body.ownerName.trim().slice(0, 100) } : {}),
      ...(typeof body.phone === 'string' && body.phone.trim() ? { phone: body.phone.trim().slice(0, 30) } : {}),
      ...(typeof body.whatsappNumber === 'string' ? { whatsappNumber: body.whatsappNumber.trim().slice(0, 30) } : {}),
      ...(typeof body.country === 'string' && body.country.trim() ? { country: body.country.trim().slice(0, 80) } : {}),
      ...(typeof body.city === 'string' && body.city.trim() ? { city: body.city.trim().slice(0, 80) } : {}),
      ...(typeof body.address === 'string' && body.address.trim() ? { address: body.address.trim().slice(0, 250) } : {}),
      ...(typeof body.description === 'string' ? { description: body.description.trim().slice(0, 1000) } : {}),
      ...(typeof body.registrationNumber === 'string' ? { registrationNumber: body.registrationNumber.trim().slice(0, 80) } : {}),
      ...(body.serviceCities !== undefined ? { serviceCities: stringList(body.serviceCities) } : {}),
      ...(body.specializations !== undefined ? { specializations: stringList(body.specializations) } : {}),
      ...(body.rishtaScope === 'ALL_PLATFORM' || body.rishtaScope === 'BUREAU_PRIORITY'
        ? { rishtaScope: body.rishtaScope }
        : {}),
      approvalStatus: nextApprovalStatus,
      ...(isAdmin && typeof body.reviewerNotes === 'string' ? { reviewerNotes: body.reviewerNotes.trim().slice(0, 500) } : {}),
      isVerified: isAdmin && typeof body.isVerified === 'boolean'
        ? body.isVerified
        : isAdmin && nextApprovalStatus === 'APPROVED'
        ? true
        : existing.isVerified,
      updatedAt: new Date().toISOString(),
    };

    const nextBureaus = [...bureaus];
    nextBureaus[targetIdx] = updated;
    await saveBureausRegistry(nextBureaus);

    if (isAdmin && body.approvalStatus !== undefined && existing.ownerUserId && nextApprovalStatus !== existing.approvalStatus) {
      const notesSuffix = updated.reviewerNotes ? ` Note: ${updated.reviewerNotes}` : '';
      await insforgeAdmin.database.from('notifications').insert([{
        user_id: existing.ownerUserId,
        title: nextApprovalStatus === 'APPROVED'
          ? 'Marriage Bureau Approved!'
          : `Marriage Bureau Status: ${nextApprovalStatus}`,
        description: nextApprovalStatus === 'APPROVED'
          ? `Your Marriage Bureau (${updated.name}) is now live in ${updated.city}. Members can now register under your office and you can add clients.`
          : `Your bureau review status was set to ${nextApprovalStatus}.${notesSuffix}`,
        type: 'SYSTEM',
        link_url: '/bureau',
      }]);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Bureaus PATCH failed:', error);
    return NextResponse.json({ success: false, error: 'Marriage bureau update failed.' }, { status: 500 });
  }
}
