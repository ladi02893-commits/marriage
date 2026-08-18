import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      gender,
      dateOfBirth,
      maritalStatus,
      religion,
      sectOrCommunity,
      motherTongue,
      country,
      stateProvince,
      city,
      profession,
      highestDegree,
      institution,
      annualIncome,
      height,
      bioHeadline,
      aboutMe,
      avatarUrl,
    } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { data: existing } = await insforgeAdmin.database
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const parsedGender = gender === 'FEMALE' ? 'FEMALE' : 'MALE';
    const parsedMarital = maritalStatus || 'NEVER_MARRIED';
    const parsedReligion = religion || 'ISLAM';

    const defaultAvatar =
      avatarUrl ||
      (parsedGender === 'FEMALE'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400');

    // 1. Create User
    const { data: newUser, error: userError } = await insforgeAdmin.database
      .from('users')
      .insert([{
        email: cleanEmail,
        password_hash: hashedPassword,
        name: fullName.trim(),
        role: 'USER',
        subscription_tier: 'FREE',
        is_verified: false,
        avatar_url: defaultAvatar,
        account_status: 'ACTIVE',
      }])
      .select()
      .single();

    if (userError || !newUser) {
      console.error('User creation error:', userError);
      return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 });
    }

    // 2. Create Matrimonial Profile
    const { data: profile, error: profileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .insert([{
        user_id: newUser.id,
        profile_created_for: 'SELF',
        full_name: fullName.trim(),
        display_name: fullName.trim().split(' ')[0],
        gender: parsedGender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : new Date('1998-01-01').toISOString(),
        marital_status: parsedMarital,
        religion: parsedReligion,
        sect_or_community: sectOrCommunity || 'Sunni',
        mother_tongue: motherTongue || 'Urdu',
        country: country || 'Pakistan',
        state_province: stateProvince || 'Punjab',
        city: city || 'Lahore',
        bio_headline: bioHeadline || 'Ambitious professional seeking life companion.',
        about_me: aboutMe || 'Looking for an understanding partner with strong moral and family values.',
        completion_percentage: 85,
      }])
      .select()
      .single();

    if (profileError || !profile) {
      console.error('Profile creation error:', profileError);
    } else {
      // 3. Create Child Tables
      await Promise.all([
        insforgeAdmin.database.from('profile_photos').insert([{
          profile_id: profile.id,
          url: defaultAvatar,
          is_primary: true,
          is_approved: true,
          order_num: 1,
        }]),
        insforgeAdmin.database.from('education_careers').insert([{
          profile_id: profile.id,
          highest_degree: highestDegree || 'Bachelors Degree',
          institution: institution || 'Recognized University',
          profession: profession || 'Professional',
          annual_income: annualIncome || '$30,000 - $60,000',
        }]),
        insforgeAdmin.database.from('lifestyles').insert([{
          profile_id: profile.id,
          height: height || "5' 8\"",
          diet: 'HALAL_ONLY',
          smoking: 'NO',
          drinking: 'NO',
          mother_tongue: motherTongue || 'Urdu',
          languages_spoken: ['English', motherTongue || 'Urdu'],
        }]),
        insforgeAdmin.database.from('family_infos').insert([{
          profile_id: profile.id,
          family_type: 'NUCLEAR',
          family_values: 'MODERATE',
          family_location: `${city || 'Lahore'}, ${country || 'Pakistan'}`,
        }]),
        insforgeAdmin.database.from('partner_preferences').insert([{
          profile_id: profile.id,
          min_age: 20,
          max_age: 35,
          religions: [parsedReligion],
          marital_statuses: [parsedMarital],
          expectations_notes: 'Seeking a kind, sincere, and compatible partner.',
        }]),
        insforgeAdmin.database.from('privacy_settings').insert([{
          profile_id: profile.id,
          photo_visibility: 'ALL',
          contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
          show_age: true,
          show_income: true,
        }]),
      ]);
    }

    // Create session JWT token
    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      subscriptionTier: newUser.subscription_tier || 'FREE',
      isVerified: newUser.is_verified || false,
      avatarUrl: newUser.avatar_url,
      profileId: profile?.id || null,
      accountStatus: newUser.account_status || 'ACTIVE',
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      redirectUrl: '/dashboard',
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please verify your inputs and try again.' },
      { status: 500 }
    );
  }
}
