import fs from 'fs';
import path from 'path';
import { ALL_20_PROFILES_DATA } from './seed-20-pakistani-profiles';

function generateDataStore() {
  const usersCode = `// ============================================================================
// 1. SYSTEM USERS (1 Super Admin + 10 Boys + 10 Girls = 21 Real Users)
// ============================================================================
export const INITIAL_USERS: User[] = [
  // SUPER ADMIN
  {
    id: 'user-ladi',
    name: 'Ladi (Super Admin)',
    email: 'ladi02893@gmail.com',
    role: 'SUPER_ADMIN',
    subscriptionTier: 'PREMIUM_PLUS',
    accountStatus: 'ACTIVE',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2025-01-01T00:00:00Z',
    lastActive: 'Online',
    profileId: 'profile-ladi',
  },
${ALL_20_PROFILES_DATA.map(p => `  // [${p.gender} #${p.num}] ${p.name}
  {
    id: '${p.userId}',
    name: '${p.name.replace(/'/g, "\\'")}',
    email: '${p.email}',
    role: 'USER',
    subscriptionTier: '${p.userId === 'user-amna' ? 'PREMIUM_PLUS' : 'FREE'}',
    accountStatus: 'ACTIVE',
    isVerified: true,
    avatarUrl: '${p.avatarUrl}',
    createdAt: '2025-02-01T10:00:00Z',
    lastActive: 'Online',
    profileId: '${p.profileId}',
  },`).join('\n')}
];`;

  const profilesCode = `// ============================================================================
// 2. MATRIMONIAL PROFILES (1 Super Admin + 10 Boys + 10 Girls = 21 Profiles)
// ============================================================================
export const INITIAL_PROFILES: MatrimonialProfile[] = [
  // SUPER ADMIN PROFILE
  {
    id: 'profile-ladi',
    userId: 'user-ladi',
    fullName: 'Ladi (Super Admin)',
    displayName: 'Ladi',
    gender: 'MALE',
    dateOfBirth: '1995-05-15',
    age: 30,
    maritalStatus: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sectOrCommunity: 'Sunni',
    caste: 'Syed',
    motherTongue: 'Urdu',
    phone: '+92 300 1234567',
    city: 'Lahore',
    state: 'Punjab',
    province: 'Punjab',
    area: 'DHA Phase 5',
    country: 'Pakistan',
    citizenship: 'Pakistani',
    bioHeadline: 'Super Administrator & Matchmaking Executive Director',
    aboutMe: 'Official System Administrator for Compatible Matrimonials. Dedicated to ensuring trust, privacy, and authentic rishta connections.',
    completionPercentage: 100,
    isFeatured: true,
    isBoosted: true,
    viewCount: 120,
    likeCount: 45,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    verificationBadge: 'APPROVED',
    educationCareer: {
      highestDegree: "Master's in Computer Science",
      institution: 'LUMS Lahore',
      profession: 'Executive Director & Tech Architect',
      annualIncome: 'PKR 10 Million',
      currency: 'PKR',
    },
    lifestyle: {
      height: "5' 10\\"",
      weight: '74 kg',
      diet: 'HALAL_ONLY',
      smoking: 'NO',
      drinking: 'NO',
      motherTongue: 'Urdu',
      languagesSpoken: ['English', 'Urdu', 'Punjabi'],
    },
    familyInfo: {
      familyType: 'NUCLEAR',
      familyValues: 'MODERATE',
      fatherOccupation: 'Retired Civil Servant',
      motherOccupation: 'Educator & Homemaker',
      brothersCount: 1,
      sistersCount: 1,
      familyLocation: 'Lahore, Pakistan',
      aboutFamily: 'Respected, educated family with high ethical standards.',
    },
    partnerPreferences: {
      minAge: 22,
      maxAge: 30,
      maritalStatuses: ['NEVER_MARRIED'],
      religions: ['ISLAM'],
      expectationsNotes: 'Seeking a sincere, educated life partner with good moral values.',
    },
    privacy: {
      photoVisibility: 'ALL',
      contactVisibility: 'ONLY_ACCEPTED_INTERESTS',
      showAge: true,
      showIncome: true,
    },
    photos: [
      {
        id: 'photo-ladi-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        isPrimary: true,
        isApproved: true,
      },
    ],
  },
${ALL_20_PROFILES_DATA.map(p => `  // [${p.gender} #${p.num}] ${p.name}
  {
    id: '${p.profileId}',
    userId: '${p.userId}',
    fullName: '${p.name.replace(/'/g, "\\'")}',
    displayName: '${p.name.split(' ')[0]}',
    gender: '${p.gender}',
    dateOfBirth: '${p.dob}',
    age: ${p.age},
    maritalStatus: '${p.maritalStatus}',
    religion: 'ISLAM',
    sectOrCommunity: '${p.sect}',
    caste: '${p.caste}',
    motherTongue: '${p.motherTongue}',
    phone: '${p.phone}',
    city: '${p.city}',
    state: 'Punjab',
    province: 'Punjab',
    area: '${p.area}',
    country: 'Pakistan',
    citizenship: '${p.citizenship}',
    bioHeadline: '${p.bioHeadline.replace(/'/g, "\\'")}',
    aboutMe: '${p.aboutMe.replace(/'/g, "\\'")}',
    completionPercentage: 95,
    isFeatured: ${p.userId === 'user-amna'},
    isBoosted: ${p.userId === 'user-amna'},
    viewCount: ${25 + p.num * 4},
    likeCount: ${8 + p.num * 2},
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
    verificationBadge: 'APPROVED',
    educationCareer: {
      highestDegree: '${p.education.degree.replace(/'/g, "\\'")}',
      institution: '${p.education.institution.replace(/'/g, "\\'")}',
      profession: '${p.education.occupation.replace(/'/g, "\\'")}',
      annualIncome: 'PKR ${(p.education.annualIncomePkr / 1000000).toFixed(1)} Million',
      currency: 'PKR',
    },
    lifestyle: {
      height: "${Math.floor(p.heightCm / 30.48)}' ${Math.round((p.heightCm % 30.48) / 2.54)}\\"",
      weight: '68 kg',
      diet: 'HALAL_ONLY',
      smoking: 'NO',
      drinking: 'NO',
      motherTongue: '${p.motherTongue}',
      languagesSpoken: ['English', 'Urdu'],
    },
    familyInfo: {
      familyType: '${p.family.familyType}',
      familyValues: '${p.family.familyValues}',
      fatherOccupation: '${p.family.fatherOccupation.replace(/'/g, "\\'")}',
      motherOccupation: '${p.family.motherOccupation.replace(/'/g, "\\'")}',
      brothersCount: ${p.family.brothersCount},
      sistersCount: ${p.family.sistersCount},
      familyLocation: '${p.family.familyLocation.replace(/'/g, "\\'")}',
      aboutFamily: '${p.caste} family with high academic and moral values residing in ${p.city}.',
    },
    partnerPreferences: {
      minAge: ${p.partnerPref.minAge},
      maxAge: ${p.partnerPref.maxAge},
      maritalStatuses: ['NEVER_MARRIED'],
      religions: ['ISLAM'],
      expectationsNotes: 'Seeking an educated, sincere partner from a respectable family. ${p.partnerPref.education.replace(/'/g, "\\'")}',
    },
    privacy: {
      photoVisibility: 'ALL',
      contactVisibility: 'ONLY_ACCEPTED_INTERESTS',
      showAge: true,
      showIncome: true,
    },
    photos: [
      {
        id: 'photo-${p.profileId}-1',
        url: '${p.avatarUrl}',
        isPrimary: true,
        isApproved: true,
      },
    ],
  },`).join('\n')}
];`;

  const remainingData = `
// ============================================================================
// 3. MEMBERSHIP PLANS
// ============================================================================
export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Free Basic Matchmaking',
    slug: 'FREE',
    price: 0,
    monthlyPrice: 0,
    durationMonths: 12,
    description: 'Essential rishta discovery for genuine Pakistani families.',
    features: [
      'Create and manage verified matrimonial profile',
      'Browse all candidates across Pakistan & overseas',
      'Send up to 2 direct interest requests monthly',
      'Standard photo and bio visibility',
      'Basic search filters (City, Caste, Sect, Age)',
    ],
    limits: {
      monthlyInterests: 2,
      viewProfileLimit: 20,
      canChat: false,
      directContactAccess: false,
      isFeatured: false,
    },
    popular: false,
  },
  {
    id: 'plan-premium',
    name: 'Elite Executive Plan',
    slug: 'PREMIUM',
    price: 12000,
    monthlyPrice: 12000,
    durationMonths: 1,
    description: 'Active matchmaking with direct chat & full contact details.',
    features: [
      'Unlimited interest requests & instant approvals',
      'Direct WhatsApp & phone contact reveal upon match',
      'Real-time encrypted direct chat messaging',
      'Profile boosted on search & recommendation engine',
      'Dedicated matchmaker support on WhatsApp',
    ],
    limits: {
      monthlyInterests: 50,
      viewProfileLimit: 200,
      canChat: true,
      directContactAccess: true,
      isFeatured: true,
    },
    popular: true,
  },
  {
    id: 'plan-vip',
    name: 'VIP Royal Matchmaking',
    slug: 'PREMIUM_PLUS',
    price: 35000,
    monthlyPrice: 35000,
    durationMonths: 3,
    description: 'Exclusive 1-on-1 personalized matchmaking concierge by senior consultants.',
    features: [
      'Dedicated Senior Family Consultant assigned',
      'Handpicked high-profile doctor / bureaucrat / corporate rishtas',
      '100% confidential private family background checks',
      'Direct introduction meetings arranged',
      'Top priority verified badge & lifetime validity option',
    ],
    limits: {
      monthlyInterests: 999,
      viewProfileLimit: 999,
      canChat: true,
      directContactAccess: true,
      isFeatured: true,
    },
    popular: false,
  },
];

// Clean Real-Time Activity Stores
export const INITIAL_INTERESTS: InterestRequest[] = [];
export const INITIAL_FAVORITES: FavoriteItem[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_VERIFICATIONS: VerificationRequest[] = [];
export const INITIAL_REPORTS: AbuseReport[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = INITIAL_TICKETS;
export const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_CMS: CMSContent = {
  announcementBanner: {
    enabled: false,
    text: 'Welcome to Compatible Matrimonials - Pakistan’s Trusted Matrimonial Network',
    link: '/pricing',
  },
  successStories: [],
  faqs: [],
};
export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [];
export const INITIAL_PAYMENT_PROOFS: PaymentProof[] = [];
export const INITIAL_RECEIVING_ACCOUNTS: ReceivingAccount[] = [];

export const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  requireVerificationForContact: true,
  freeTierMonthlyInterestLimit: 2,
  allowNewRegistrations: true,
  whatsappSupportNumber: '+92 300 1234567',
  supportEmail: 'support@compatiblematrimonials.pk',
  currency: 'PKR',
};
`;

  const fullContent = `import {
  User,
  MatrimonialProfile,
  InterestRequest,
  FavoriteItem,
  Conversation,
  ChatMessage,
  NotificationItem,
  SubscriptionPlan,
  Invoice,
  VerificationRequest,
  AbuseReport,
  SupportTicket,
  Coupon,
  CMSContent,
  AdminAuditLog,
  SystemSettings,
  PaymentProof,
  ReceivingAccount,
} from './types';

${usersCode}

${profilesCode}

${remainingData}`;

  fs.writeFileSync(path.join(process.cwd(), 'src/lib/data-store.ts'), fullContent);
  console.log('✅ src/lib/data-store.ts successfully updated with all 21 Users & 21 Profiles!');
}

generateDataStore();
