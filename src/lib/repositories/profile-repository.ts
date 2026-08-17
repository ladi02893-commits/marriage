import { prisma } from '@/lib/db';
import { Religion, Gender, MaritalStatus } from '@prisma/client';

export class ProfileRepository {
  /**
   * Search candidate profiles with filters
   */
  static async searchProfiles(filters: {
    gender?: Gender;
    religion?: Religion;
    minAge?: number;
    maxAge?: number;
    country?: string;
    city?: string;
    maritalStatus?: MaritalStatus;
    page?: number;
    pageSize?: number;
  }) {
    const {
      gender,
      religion,
      minAge,
      maxAge,
      country,
      city,
      maritalStatus,
      page = 1,
      pageSize = 12,
    } = filters;

    const where: any = {};

    if (gender) where.gender = gender;
    if (religion) where.religion = religion;
    if (maritalStatus) where.maritalStatus = maritalStatus;
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };

    // Calculate birthdate range for minAge / maxAge
    if (minAge || maxAge) {
      const now = new Date();
      where.dateOfBirth = {};
      if (maxAge) {
        const minDob = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
        where.dateOfBirth.gte = minDob;
      }
      if (minAge) {
        const maxDob = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        where.dateOfBirth.lte = maxDob;
      }
    }

    const [profiles, total] = await Promise.all([
      prisma.matrimonialProfile.findMany({
        where,
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          educationCareer: true,
          lifestyle: true,
          familyInfo: true,
          partnerPreferences: true,
          privacySettings: true,
          user: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              subscriptionTier: true,
              accountStatus: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.matrimonialProfile.count({ where }),
    ]);

    return {
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get single matrimonial dossier by ID
   */
  static async getProfileById(profileId: string) {
    return prisma.matrimonialProfile.findUnique({
      where: { id: profileId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        educationCareer: true,
        lifestyle: true,
        familyInfo: true,
        partnerPreferences: true,
        privacySettings: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isVerified: true,
            subscriptionTier: true,
            accountStatus: true,
          },
        },
      },
    });
  }

  /**
   * Increment profile view count
   */
  static async incrementViewCount(profileId: string) {
    return prisma.matrimonialProfile.update({
      where: { id: profileId },
      data: { viewCount: { increment: 1 } },
    });
  }
}
