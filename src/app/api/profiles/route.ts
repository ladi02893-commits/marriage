import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PROFILES } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const religion = searchParams.get('religion');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Attempt fetching from Prisma Database
    let dbProfiles: any[] = [];
    try {
      const where: any = {};
      if (gender && gender !== 'ALL') where.gender = gender;
      if (religion && religion !== 'ALL') where.religion = religion;
      if (country && country !== 'ALL') where.country = { contains: country, mode: 'insensitive' };
      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { bioHeadline: { contains: search, mode: 'insensitive' } },
        ];
      }

      dbProfiles = await prisma.matrimonialProfile.findMany({
        where,
        include: {
          photos: { orderBy: { order: 'asc' } },
          educationCareer: true,
          lifestyle: true,
          familyInfo: true,
          partnerPreferences: true,
          privacySettings: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('Prisma DB query fallback to initial store:', dbErr);
    }

    // Merge database profiles with initial curated profiles ensuring complete discovery catalog
    const combinedMap = new Map<string, any>();
    
    // 1. Load initial curated profiles first
    INITIAL_PROFILES.forEach((p) => combinedMap.set(p.id, p));

    // 2. Merge or override with live Prisma database profiles
    dbProfiles.forEach((p) => {
      combinedMap.set(p.id, p);
    });

    let results = Array.from(combinedMap.values());

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
      source: dbProfiles.length > 0 ? 'PRISMA_DATABASE_MERGED' : 'DATA_STORE',
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
    const { userId, fullName, displayName, gender, dateOfBirth, maritalStatus, religion, motherTongue, city, country, bioHeadline, aboutMe, photos, educationCareer, lifestyle, familyInfo } = body;

    const created = await prisma.matrimonialProfile.create({
      data: {
        userId,
        fullName: fullName || displayName,
        displayName: displayName || fullName,
        gender: gender || 'FEMALE',
        dateOfBirth: new Date(dateOfBirth || '1998-01-01'),
        maritalStatus: maritalStatus || 'NEVER_MARRIED',
        religion: religion || 'ISLAM',
        motherTongue: motherTongue || 'Urdu',
        city: city || 'Islamabad',
        country: country || 'Pakistan',
        bioHeadline: bioHeadline || 'Matrimonial Candidate',
        aboutMe: aboutMe || 'Family-oriented individual',
        photos: photos?.length
          ? {
              create: photos.map((ph: any, idx: number) => ({
                url: typeof ph === 'string' ? ph : ph.url,
                isPrimary: idx === 0,
                order: idx + 1,
              })),
            }
          : undefined,
        educationCareer: educationCareer
          ? {
              create: {
                highestDegree: educationCareer.highestDegree || "Bachelor's",
                institution: educationCareer.institution,
                profession: educationCareer.profession || 'Executive',
                annualIncome: educationCareer.annualIncome?.toString(),
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      profile: created,
      message: 'Profile created successfully in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create profile in database.' },
      { status: 500 }
    );
  }
}
