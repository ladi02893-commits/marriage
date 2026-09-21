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
    phone: '+92 300 1234567',
    whatsappNumber: '+92 300 1234567',
    profileIdCode: 'VRM-000001',
    role: 'SUPER_ADMIN',
    subscriptionTier: 'PREMIUM_PLUS',
    accountStatus: 'ACTIVE',
    profileApprovalStatus: 'APPROVED',
    isVerified: true,
    isWhatsappVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    totalConnections: 300,
    usedConnections: 43,
    remainingConnections: 257,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    createdAt: '2025-01-01T00:00:00Z',
    lastActive: 'Online',
    profileId: 'profile-ladi',
  },
${ALL_20_PROFILES_DATA.map((p, idx) => {
  const codeNum = String(idx + 2).padStart(6, '0');
  const profileIdCode = `VRM-${codeNum}`;
  const isVip = p.userId === 'user-amna';
  const isPremium = p.userId === 'user-boy-2' || p.userId === 'user-girl-6';
  const totalConn = isVip ? 300 : isPremium ? 100 : 30;
  const usedConn = isVip ? 43 : isPremium ? 12 : 5;
  const remainingConn = totalConn - usedConn;

  return `  // [${p.gender} #${p.num}] ${p.name}
  {
    id: '${p.userId}',
    name: '${p.name.replace(/'/g, "\\'")}',
    email: '${p.email}',
    phone: '${p.phone || '+92 300 ' + Math.floor(1000000 + Math.random() * 9000000)}',
    whatsappNumber: '${p.phone || '+92 300 ' + Math.floor(1000000 + Math.random() * 9000000)}',
    profileIdCode: '${profileIdCode}',
    role: 'USER',
    subscriptionTier: '${isVip ? 'PREMIUM_PLUS' : isPremium ? 'PREMIUM' : 'FREE'}',
    accountStatus: 'ACTIVE',
    profileApprovalStatus: 'APPROVED',
    isVerified: true,
    isWhatsappVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    totalConnections: ${totalConn},
    usedConnections: ${usedConn},
    remainingConnections: ${remainingConn},
    assignedConsultantId: ${isVip ? "'consultant-1'" : 'undefined'},
    avatarUrl: '${p.avatarUrl}',
    createdAt: '2025-02-01T10:00:00Z',
    lastActive: 'Online',
    profileId: '${p.profileId}',
  },`;
}).join('\n')}
];`;

  const profilesCode = `// ============================================================================
// 2. MATRIMONIAL PROFILES (1 Super Admin + 10 Boys + 10 Girls = 21 Profiles)
// ============================================================================
export const INITIAL_PROFILES: MatrimonialProfile[] = [
  // SUPER ADMIN PROFILE
  {
    id: 'profile-ladi',
    userId: 'user-ladi',
    profileIdCode: 'VRM-000001',
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
    whatsappNumber: '+92 300 1234567',
    city: 'Lahore',
    state: 'Punjab',
    province: 'Punjab',
    area: 'DHA Phase 5',
    country: 'Pakistan',
    citizenship: 'Pakistani',
    nationality: 'Pakistani',
    bioHeadline: 'Super Administrator & Matchmaking Executive Director',
    aboutMe: 'Official Executive Director for VIP Royal Matchmaking. Dedicated to ensuring family trust, verified profiles, and discrete matrimonial connections.',
    completionPercentage: 100,
    isFeatured: true,
    isBoosted: true,
    approvalStatus: 'APPROVED',
    viewCount: 120,
    likeCount: 45,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    verificationBadge: 'APPROVED',
    isWhatsappVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    isVIPVerified: true,
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
      familyCity: 'Lahore',
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
      profileVisibility: 'PUBLIC',
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
${ALL_20_PROFILES_DATA.map((p, idx) => {
  const codeNum = String(idx + 2).padStart(6, '0');
  const profileIdCode = `VRM-${codeNum}`;
  const isVip = p.userId === 'user-amna';
  const isRecommended = p.userId === 'user-boy-1' || p.userId === 'user-boy-2' || p.userId === 'user-amna' || p.userId === 'user-girl-2';
  const recNote = p.userId === 'user-boy-1'
    ? 'Cardiologist from a noble background, highly recommended based on family preferences and educational alignment.'
    : p.userId === 'user-boy-2'
    ? 'Principal AI Cloud Architect at NUST, cultured family residing in F-10 Islamabad.'
    : p.userId === 'user-amna'
    ? 'Clinical Psychologist & Lecturer with exceptional family standing in Gulberg III, Lahore.'
    : undefined;

  return `  // [${p.gender} #${p.num}] ${p.name}
  {
    id: '${p.profileId}',
    userId: '${p.userId}',
    profileIdCode: '${profileIdCode}',
    fullName: '${p.name.replace(/'/g, "\\'")}',
    displayName: '${p.name.split(' ')[0]}',
    gender: '${p.gender}',
    dateOfBirth: '${p.dob}T00:00:00Z',
    age: ${p.age},
    maritalStatus: '${p.maritalStatus}',
    religion: 'ISLAM',
    sectOrCommunity: '${p.sect}',
    caste: '${p.caste}',
    motherTongue: '${p.motherTongue}',
    phone: '${p.phone}',
    whatsappNumber: '${p.phone}',
    city: '${p.city}',
    state: 'Punjab',
    province: 'Punjab',
    area: '${p.area}',
    country: 'Pakistan',
    citizenship: '${p.citizenship}',
    nationality: 'Pakistani',
    bioHeadline: '${p.bioHeadline.replace(/'/g, "\\'")}',
    aboutMe: '${p.aboutMe.replace(/'/g, "\\'")}',
    completionPercentage: ${Math.floor(80 + Math.random() * 16)},
    isFeatured: ${p.num <= 4},
    isBoosted: ${p.num <= 2},
    approvalStatus: 'APPROVED',
    viewCount: ${25 + p.num * 8},
    likeCount: ${8 + p.num * 3},
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
    verificationBadge: 'APPROVED',
    isWhatsappVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    isVIPVerified: ${isVip},
    assignedConsultantId: ${isVip ? "'consultant-1'" : 'undefined'},
    consultantRecommended: ${isRecommended},
    consultantNote: ${recNote ? `'${recNote.replace(/'/g, "\\'")}'` : 'undefined'},
    educationCareer: {
      highestDegree: '${p.education.degree.replace(/'/g, "\\'")}',
      institution: '${p.education.institution.replace(/'/g, "\\'")}',
      profession: '${p.education.occupation.replace(/'/g, "\\'")}',
      annualIncome: 'PKR ${(p.education.annualIncomePkr / 1000000).toFixed(1)} Million',
      currency: 'PKR',
    },
    lifestyle: {
      height: "${Math.floor(p.heightCm / 30.48)}' ${Math.round((p.heightCm % 30.48) / 2.54)}\\"",
      diet: 'HALAL_ONLY',
      smoking: 'NO',
      drinking: 'NO',
      motherTongue: '${p.motherTongue}',
      languagesSpoken: ['English', 'Urdu'],
    },
    familyInfo: {
      familyType: 'NUCLEAR',
      familyValues: 'MODERATE',
      fatherOccupation: 'Senior Executive / Civil Officer',
      motherOccupation: 'Homemaker',
      brothersCount: 1,
      sistersCount: 1,
      familyLocation: '${p.city}, Pakistan',
      familyCity: '${p.city}',
      aboutFamily: 'Cultured family with strong Islamic morals and educated background.',
    },
    partnerPreferences: {
      minAge: ${p.gender === 'MALE' ? 22 : 27},
      maxAge: ${p.gender === 'MALE' ? 28 : 33},
      maritalStatuses: ['NEVER_MARRIED'],
      religions: ['ISLAM'],
      expectationsNotes: 'Seeking an educated, sincere life partner from an honorable family.',
    },
    privacy: {
      photoVisibility: 'ALL',
      contactVisibility: 'ONLY_ACCEPTED_INTERESTS',
      showPhone: true,
      showWhatsapp: true,
      showEmail: false,
      showAge: true,
      showIncome: true,
      profileVisibility: 'PUBLIC',
    },
    photos: [
      {
        id: 'photo-${p.profileId}-1',
        url: '${p.avatarUrl}',
        isPrimary: true,
        isApproved: true,
      },
    ],
  },`;
}).join('\n')}
];`;

  const remainingData = `
// ============================================================================
// 3. CONNECTION-BASED PACKAGES (Section 2)
// ============================================================================
export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Package',
    slug: 'BASIC',
    price: 2000,
    monthlyPrice: 2000,
    yearlyPrice: 2000,
    currency: 'PKR',
    connectionsLimit: 30,
    hasConsultant: false,
    durationMonths: 12,
    description: 'Essential matrimonial connections for genuine rishta discovery.',
    features: [
      '30 Direct Matrimonial Connection Credits',
      'Unique VRM Profile ID & Verification',
      'Full Contact Unlock (Phone, WhatsApp, Email)',
      'Unlimited Incoming Interest Requests',
      'Advanced Filters: Caste, City, Sect, Education',
      'Bank Transfer & Instant Manual Approval',
    ],
    limits: {
      connectionsCount: 30,
      directContactAccess: true,
      canChat: true,
      isFeatured: false,
      dedicatedConsultant: false,
    },
    popular: false,
  },
  {
    id: 'plan-premium',
    name: 'Premium Package',
    slug: 'PREMIUM',
    price: 5000,
    monthlyPrice: 5000,
    yearlyPrice: 5000,
    currency: 'PKR',
    connectionsLimit: 100,
    hasConsultant: false,
    durationMonths: 12,
    description: 'High-volume rishta connections with priority match recommendations.',
    features: [
      '100 Direct Matrimonial Connection Credits',
      'Highlighted Profile in Search & Compatibility Engine',
      'Direct Phone & WhatsApp Unlock on Acceptance',
      'Priority Admin Approval for Identity Documents',
      'WhatsApp & Email Notification Alerts',
      'Lifetime Connection Rollover (No Monthly Expiry)',
    ],
    limits: {
      connectionsCount: 100,
      directContactAccess: true,
      canChat: true,
      isFeatured: true,
      dedicatedConsultant: false,
    },
    popular: true,
  },
  {
    id: 'plan-vip',
    name: 'VIP Royal Package',
    slug: 'VIP',
    badge: '👑 Royal Concierge',
    price: 10000,
    monthlyPrice: 10000,
    yearlyPrice: 10000,
    currency: 'PKR',
    connectionsLimit: 300,
    hasConsultant: true,
    durationMonths: 12,
    description: 'Exclusive 1-on-1 concierge with Dedicated Senior Family Consultant.',
    features: [
      '300 Direct Matrimonial Connection Credits',
      'Dedicated Senior Family Consultant Assigned',
      'Handpicked Doctor / Bureaucrat / Corporate Rishtas',
      'Consultant Personalized Match Recommendations',
      '100% Confidential Family Background Verification',
      'Direct Family Introduction & Meeting Coordination',
      'VIP Verified Profile Badge on Dossier',
    ],
    limits: {
      connectionsCount: 300,
      directContactAccess: true,
      canChat: true,
      isFeatured: true,
      dedicatedConsultant: true,
    },
    popular: false,
  },
];

// Alias for backwards compatibility
export const INITIAL_SUBSCRIPTION_PLANS = INITIAL_PLANS;

// Additional Connection Packs (Section 38)
export const EXTRA_CONNECTION_PACKS: ExtraConnectionPack[] = [
  { id: 'pack-10', name: '10 Extra Connections', connectionsCount: 10, pricePKR: 800, description: 'Top up your account with 10 instant connections' },
  { id: 'pack-30', name: '30 Extra Connections', connectionsCount: 30, pricePKR: 2000, description: 'Popular booster pack for active matchmaking', popular: true },
  { id: 'pack-50', name: '50 Extra Connections', connectionsCount: 50, pricePKR: 3200, description: 'Extensive outreach pack for families' },
  { id: 'pack-100', name: '100 Extra Connections', connectionsCount: 100, pricePKR: 5500, description: 'Maximum volume booster for royal search' },
];

// Dedicated Senior Family Consultants (Sections 24-27)
export const INITIAL_CONSULTANTS: Consultant[] = [
  {
    id: 'consultant-1',
    name: 'Begum Bilquis Khan',
    title: 'Senior Family Matchmaker & Matrimonial Consultant',
    email: 'bilquis.khan@viproyalmatchmaking.com',
    phone: '+92 301 8899001',
    whatsappNumber: '+92 301 8899001',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    bio: 'Over 18 years of specialized experience in discreet family introductions for elite Pakistani business houses, civil servants, and medical professionals.',
    specialization: 'Doctors, Civil Servants & Corporate Executives',
    assignedClientIds: ['user-amna', 'user-ladi'],
    isActive: true,
    rating: 4.9,
    consultationsCompleted: 340,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: '10:00 AM - 7:00 PM PKT',
  },
  {
    id: 'consultant-2',
    name: 'Dr. Tariq Mansoor',
    title: 'Director of Family Affairs & Relationship Counselor',
    email: 'tariq.mansoor@viproyalmatchmaking.com',
    phone: '+92 302 7788990',
    whatsappNumber: '+92 302 7788990',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    bio: 'Former university dean and family mediation specialist. Guides parents and candidates through cultural compatibility and background verification.',
    specialization: 'Overseas Pakistani Families & Academic Rishtas',
    assignedClientIds: ['user-boy-2'],
    isActive: true,
    rating: 4.8,
    consultationsCompleted: 215,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: '11:00 AM - 8:00 PM PKT',
  },
];

// Connection Transactions Log (Section 82)
export const INITIAL_CONNECTION_TRANSACTIONS: ConnectionTransaction[] = [
  {
    id: 'ctx-001',
    userId: 'user-amna',
    userProfileIdCode: 'VRM-000012',
    connectedUserId: 'user-boy-1',
    connectedProfileId: 'profile-boy-1',
    connectedProfileIdCode: 'VRM-000002',
    creditsUsed: 1,
    reason: 'Contact Details Unlocked',
    date: '2025-02-15T14:30:00Z',
  },
];

// Clean Real-Time Activity Stores
export const INITIAL_INTERESTS: InterestRequest[] = [
  {
    id: 'interest-sample-1',
    senderId: 'user-boy-1',
    senderName: 'Dr. Hamza Malik',
    senderPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    senderProfileId: 'profile-boy-1',
    senderProfileIdCode: 'VRM-000002',
    receiverId: 'user-amna',
    receiverName: 'Amna Khan',
    receiverPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    receiverProfileId: 'profile-amna',
    receiverProfileIdCode: 'VRM-000012',
    status: 'ACCEPTED',
    message: 'Salam, our family was very impressed by your academic credentials and values.',
    createdAt: '2025-02-14T10:00:00Z',
    updatedAt: '2025-02-15T14:30:00Z',
    relationshipStatus: 'FAMILY_CONTACTED',
  }
];

export const INITIAL_FAVORITES: FavoriteItem[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-amna',
    type: 'CONSULTANT_RECOMMENDATION',
    title: 'Consultant Recommendation',
    description: 'Senior Consultant Begum Bilquis Khan recommended Dr. Hamza Malik for your dossier.',
    linkUrl: '/dashboard/connections',
    isRead: false,
    createdAt: '2025-02-15T12:00:00Z',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2025-001',
    userId: 'user-amna',
    userProfileIdCode: 'VRM-000012',
    userName: 'Amna Khan',
    planName: 'VIP Royal Package (300 Connections)',
    amount: 10000,
    subtotal: 10000,
    taxAmount: 0,
    discountAmount: 0,
    currency: 'PKR',
    status: 'PAID',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    transactionId: 'TRX-MEEZ-883921',
    date: '2025-02-01T12:00:00Z',
  }
];

export const INITIAL_VERIFICATIONS: VerificationRequest[] = [];
export const INITIAL_REPORTS: AbuseReport[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-001',
    ticketCode: 'SUP-000123',
    userId: 'user-amna',
    userName: 'Amna Khan',
    userEmail: 'amna.khan@gmail.com',
    userProfileIdCode: 'VRM-000012',
    subject: 'Consultant introduction meeting schedule inquiry',
    category: 'CONSULTANT',
    relatedProfileId: 'VRM-000002',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2025-02-16T11:00:00Z',
    updatedAt: '2025-02-16T11:00:00Z',
    messages: [
      {
        id: 'msg-t-1',
        sender: 'USER',
        senderName: 'Amna Khan',
        text: 'Assalam o Alaikum, we would like to coordinate a phone consultation with Begum Bilquis Khan regarding the proposal for Dr. Hamza Malik (VRM-000002).',
        timestamp: '2025-02-16T11:00:00Z',
      }
    ]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon-vip20',
    code: 'VIP20',
    discountPercent: 20,
    expiresAt: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    timesUsed: 14,
    applicablePackages: ['BASIC', 'PREMIUM', 'VIP'],
    isActive: true,
  }
];

export const INITIAL_CMS: CMSContent = {
  announcementBanner: {
    enabled: true,
    text: 'VIP Royal Matchmaking – Exclusive Connections with Dedicated Family Consultants',
    link: '/pricing',
  },
  successStories: [
    {
      id: 'story-1',
      coupleName: 'Dr. Zaid & Fatima',
      weddingDate: 'December 2024',
      story: 'Through VIP Royal Matchmaking and Senior Consultant Begum Bilquis Khan, both our families were connected with complete transparency and respect. Highly recommended for families seeking dignified matchmaking.',
      photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      city: 'Islamabad & Lahore',
      isApproved: true,
    },
    {
      id: 'story-2',
      coupleName: 'Engr. Shahmeer & Dr. Ayla',
      weddingDate: 'January 2025',
      story: 'The connection credits model gave us complete control over our outreach. The privacy safeguards and verified backgrounds made our parents feel completely secure.',
      photoUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
      city: 'Karachi (PECHS)',
      isApproved: true,
    }
  ],
  faqs: [
    {
      question: 'What is a connection credit and when is it deducted?',
      answer: 'A connection credit allows you to unlock verified direct contact details (phone, WhatsApp, email) or establish a confirmed mutual match. Merely viewing profiles or candidate dossiers never deducts connection credits.',
      category: 'Connections',
    },
    {
      question: 'Do connection credits expire every month?',
      answer: 'No. Connection credits do not expire monthly. Your purchased credits remain safely in your account as long as your account is in good standing.',
      category: 'Connections',
    },
    {
      question: 'Can I purchase additional connections without changing my package?',
      answer: 'Yes, you can purchase booster packs of 10, 30, 50, or 100 connections anytime from your dashboard.',
      category: 'Billing',
    },
    {
      question: 'What is the role of a Dedicated Senior Family Consultant?',
      answer: 'For VIP Royal members, a Senior Consultant reviews your family requirements, handpicks compatible matches, performs confidential background verifications, and assists in arranging family introduction meetings.',
      category: 'Consultant',
    },
    {
      question: 'How does bank transfer payment approval work?',
      answer: 'After transferring funds to our official bank account, submit your transaction ID and receipt screenshot. Our administrative desk verifies the payment and activates your connection credits promptly.',
      category: 'Billing',
    }
  ],
  testimonials: [],
};

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit-001',
    adminId: 'user-ladi',
    adminName: 'Ladi (Super Admin)',
    action: 'SYSTEM_UPGRADE_INITIALIZED',
    targetType: 'SETTING',
    targetId: 'VRM-SYSTEM',
    ipAddress: '127.0.0.1',
    timestamp: '2025-02-01T00:00:00Z',
    details: 'VIP Royal Matchmaking connection-based architecture activated with verified profile IDs.',
  }
];

export const INITIAL_PAYMENT_PROOFS: PaymentProof[] = [
  {
    id: 'proof-001',
    userId: 'user-amna',
    userName: 'Amna Khan',
    userEmail: 'amna.khan@gmail.com',
    userPhone: '+92 300 9988776',
    userProfileIdCode: 'VRM-000012',
    planSlug: 'VIP',
    planName: 'VIP Royal Package (300 Connections)',
    connectionsAdded: 300,
    amount: 10000,
    currency: 'PKR',
    paymentMethod: 'BANK_TRANSFER',
    senderBank: 'Meezan Bank Ltd',
    senderName: 'Amna Khan',
    senderMobileNumber: '+92 300 9988776',
    transactionId: 'TRX-MEEZ-883921',
    transactionDate: '2025-02-01',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    status: 'APPROVED',
    submittedAt: '2025-02-01T11:45:00Z',
    reviewedAt: '2025-02-01T12:00:00Z',
    reviewedBy: 'Super Admin Ladi',
  }
];

export const INITIAL_RECEIVING_ACCOUNTS: ReceivingAccount[] = [
  {
    id: 'bank-meezan-1',
    provider: 'BANK_TRANSFER',
    bankName: 'Meezan Bank Ltd (Islamic Banking)',
    accountTitle: 'VIP ROYAL MATCHMAKING PVT LTD',
    accountNumber: '02010108928371',
    iban: 'PK45MEZN0002010108928371',
    branchName: 'Main Boulevard Gulberg Branch, Lahore',
    instructions: 'Please transfer the exact package amount via online banking, ATM, or Raast. Attach transaction ID and proof screenshot for expedited approval.',
    isActive: true,
    isPrimary: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'bank-faysal-2',
    provider: 'BANK_TRANSFER',
    bankName: 'Faysal Bank Islamic',
    accountTitle: 'VIP ROYAL MATCHMAKING SERVICES',
    accountNumber: '30098712345678',
    iban: 'PK89FAYS3009871234567801',
    branchName: 'DHA Phase 5 Branch, Lahore',
    instructions: 'Direct bank transfer or mobile app funds transfer accepted.',
    isActive: true,
    isPrimary: false,
    createdAt: '2025-01-01T00:00:00Z',
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  siteName: 'VIP Royal Matchmaking',
  tagline: 'Pakistan’s Premier Connection-Based Matrimonial Platform',
  contactEmail: 'concierge@viproyalmatchmaking.com',
  supportPhone: '+92 300 1234567',
  profileIdPrefix: 'VRM-',
  minAge: 20,
  requireEmailVerification: true,
  requireWhatsAppVerification: true,
  requireAdminProfileApproval: true,
  freeTierConnectionsLimit: 5,
  whatsappNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  tax: {
    taxEnabled: false,
    taxPercentage: 5,
    taxFixed: 0,
    taxLabel: 'Service Fee / Tax (5%)',
  },
  matchingWeights: {
    ageWeight: 10,
    locationWeight: 10,
    educationWeight: 10,
    professionWeight: 10,
    lifestyleWeight: 10,
    familyWeight: 10,
    maritalWeight: 10,
  },
  maintenanceMode: false,
  allowNewRegistrations: true,
  whatsappSupportNumber: '+92 300 1234567',
  supportEmail: 'support@viproyalmatchmaking.com',
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
  ExtraConnectionPack,
  Consultant,
  ConnectionTransaction,
} from './types';

${usersCode}

${profilesCode}

${remainingData}
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/lib/data-store.ts'), fullContent);
  console.log('✅ src/lib/data-store.ts successfully updated with VIP Royal Matchmaking data structures!');
}

generateDataStore();
