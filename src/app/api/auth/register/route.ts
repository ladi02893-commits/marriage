import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { Gender, MaritalStatus, Religion, DietType, HabitFrequency, FamilyType, FamilyValues, Role, SubscriptionTier } from '@prisma/client';

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

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Map Gender & Enum helpers safely
    const parsedGender = gender === 'FEMALE' ? Gender.FEMALE : Gender.MALE;
    const parsedMarital =
      maritalStatus === 'DIVORCED'
        ? MaritalStatus.DIVORCED
        : maritalStatus === 'WIDOWED'
        ? MaritalStatus.WIDOWED
        : maritalStatus === 'AWAITING_DIVORCE'
        ? MaritalStatus.AWAITING_DIVORCE
        : MaritalStatus.NEVER_MARRIED;

    const parsedReligion =
      religion === 'CHRISTIANITY'
        ? Religion.CHRISTIANITY
        : religion === 'HINDUISM'
        ? Religion.HINDUISM
        : religion === 'SIKHISM'
        ? Religion.SIKHISM
        : religion === 'JUDAISM'
        ? Religion.JUDAISM
        : religion === 'OTHER'
        ? Religion.OTHER
        : Religion.ISLAM;

    // Create User and Matrimonial Profile in a single database transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash: hashedPassword,
        name: fullName.trim(),
        role: Role.USER,
        subscriptionTier: SubscriptionTier.FREE,
        isVerified: false,
        avatarUrl:
          avatarUrl ||
          (parsedGender === Gender.FEMALE
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'),
        profile: {
          create: {
            fullName: fullName.trim(),
            displayName: fullName.trim().split(' ')[0],
            gender: parsedGender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1998-01-01'),
            maritalStatus: parsedMarital,
            religion: parsedReligion,
            sectOrCommunity: sectOrCommunity || 'Sunni',
            motherTongue: motherTongue || 'Urdu',
            country: country || 'Pakistan',
            stateProvince: stateProvince || 'Punjab',
            city: city || 'Lahore',
            bioHeadline: bioHeadline || 'Ambitious professional seeking life companion.',
            aboutMe: aboutMe || 'Looking for an understanding partner with strong moral and family values.',
            completionPercentage: 85,
            photos: avatarUrl
              ? {
                  create: [
                    {
                      url: avatarUrl,
                      isPrimary: true,
                      isApproved: true,
                      order: 1,
                    },
                  ],
                }
              : undefined,
            educationCareer: {
              create: {
                highestDegree: highestDegree || 'Bachelors Degree',
                institution: institution || 'Recognized University',
                profession: profession || 'Professional',
                annualIncome: annualIncome || '$30,000 - $60,000',
              },
            },
            lifestyle: {
              create: {
                height: height || "5' 8\"",
                diet: DietType.HALAL_ONLY,
                smoking: HabitFrequency.NO,
                drinking: HabitFrequency.NO,
                motherTongue: motherTongue || 'Urdu',
                languagesSpoken: ['English', motherTongue || 'Urdu'],
              },
            },
            familyInfo: {
              create: {
                familyType: FamilyType.NUCLEAR,
                familyValues: FamilyValues.MODERATE,
                familyLocation: `${city || 'Lahore'}, ${country || 'Pakistan'}`,
              },
            },
            partnerPreferences: {
              create: {
                minAge: 20,
                maxAge: 35,
                religions: [parsedReligion],
                maritalStatuses: [parsedMarital],
                expectationsNotes: 'Seeking a kind, sincere, and compatible partner.',
              },
            },
            privacySettings: {
              create: {
                photoVisibility: 'ALL',
                contactVisibility: 'ONLY_ACCEPTED_INTERESTS',
                showAge: true,
                showIncome: true,
              },
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

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
      subscriptionTier: newUser.subscriptionTier,
      isVerified: newUser.isVerified,
      avatarUrl: newUser.avatarUrl,
      profileId: newUser.profile?.id || null,
      accountStatus: newUser.accountStatus,
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
