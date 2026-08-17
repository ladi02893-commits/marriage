export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';

export type AccountStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'BANNED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';

export type Religion = 'ISLAM' | 'HINDUISM' | 'SIKHISM' | 'CHRISTIANITY' | 'BUDDHISM' | 'JAINISM' | 'SPIRITUAL' | 'OTHER';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  accountStatus: AccountStatus;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  profileId?: string;
  subscriptionExpiresAt?: string;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
}

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  isApproved: boolean;
  order: number;
}

export interface EducationCareer {
  highestDegree: string;
  institution?: string;
  fieldOfStudy?: string;
  profession: string;
  jobTitle?: string;
  company?: string;
  annualIncome?: string;
  monthlyIncome?: string;
  employmentSector?: 'PRIVATE' | 'GOVERNMENT' | 'BUSINESS' | 'SELF_EMPLOYED' | 'NOT_WORKING';
  workingLocation?: string;
}

export interface Lifestyle {
  height: string; // e.g. "5 ft 10 in (178 cm)"
  weight?: string; // e.g. "68 kg"
  bodyType?: 'SLIM' | 'ATHLETIC' | 'AVERAGE' | 'HEAVY';
  diet?: 'VEGETARIAN' | 'NON_VEGETARIAN' | 'HALAL_ONLY' | 'EGGETARIAN' | 'VEGAN';
  smoking?: 'NO' | 'OCCASIONALLY' | 'REGULARLY';
  drinking?: 'NO' | 'OCCASIONALLY' | 'SOCIALLY' | 'REGULARLY';
  motherTongue?: string;
  languagesSpoken?: string[];
  hobbies?: string[];
  interests?: string[];
  livingArrangement?: 'LIVING_WITH_PARENTS' | 'INDEPENDENT' | 'OPEN_TO_RELOCATION';
  livingStatus?: string;
}

export interface FamilyInfo {
  familyType?: 'NUCLEAR' | 'JOINT' | 'EXTENDED';
  familyValues?: 'TRADITIONAL' | 'MODERATE' | 'LIBERAL';
  fatherOccupation?: string;
  motherOccupation?: string;
  brothersCount?: number;
  sistersCount?: number;
  familyLocation?: string;
  livingStatus?: string;
  aboutFamily?: string;
}

export interface PartnerPreferences {
  ageRange?: { min: number; max: number };
  heightRange?: { min: string; max: string };
  maritalStatus?: MaritalStatus[];
  religions?: Religion[];
  sects?: string[];
  caste?: string[];
  educationLevels?: string[];
  professions?: string[];
  preferredLocations?: string[];
  dietaryPreferences?: string[];
  motherTongues?: string[];
  monthlyIncome?: string;
  expectationsNotes?: string;
}

export interface PrivacySettings {
  photoVisibility?: 'ALL' | 'MEMBERS_ONLY' | 'APPROVED_INTERESTS_ONLY';
  contactVisibility?: 'ONLY_ACCEPTED_INTERESTS' | 'PREMIUM_ONLY' | 'HIDDEN';
  showAge?: boolean;
  showIncome?: boolean;
  showLastSeen?: boolean;
  searchEngineIndex?: boolean;
  hideProfileTemporarily?: boolean;
}

export interface MatrimonialProfile {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  maritalStatus: MaritalStatus;
  religion: Religion;
  sectOrCommunity?: string;
  caste?: string;
  subClan?: string;
  motherTongue: string;
  phone?: string;
  city: string;
  state: string;
  province?: string;
  area?: string;
  country: string;
  citizenship: string;
  aboutMe: string;
  bioHeadline: string;
  photos: ProfilePhoto[];
  educationCareer: EducationCareer;
  lifestyle: Lifestyle;
  familyInfo: FamilyInfo;
  partnerPreferences: PartnerPreferences;
  privacy: PrivacySettings;
  completionPercentage: number;
  isFeatured: boolean;
  isBoosted: boolean;
  verificationBadge: VerificationStatus;
  viewCount: number;
  likeCount: number;
  fraudScore?: number;
  profileQualityScore?: number;
  aiSummary?: string;
  personalityInsights?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProof {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  planSlug: 'BASIC' | 'PREMIUM' | 'VIP' | string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'RAAST' | string;
  transactionId: string;
  senderAccountNumber?: string;
  screenshotUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ReceivingAccount {
  id: string;
  provider: 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'RAAST' | 'SADAPAY' | 'NAYAPAY' | 'OTHER';
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  instructions?: string;
  isActive: boolean;
  isPrimary?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CompatibilityBreakdown {
  overallScore: number;
  ageScore: number;
  locationScore: number;
  educationScore: number;
  professionScore: number;
  lifestyleScore: number;
  familyScore: number;
  maritalScore: number;
  matchReasons: string[];
  improvementTips: string[];
}

export interface InterestRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderProfileId: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  receiverProfileId: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  targetProfileId: string;
  targetProfile: MatrimonialProfile;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantAId: string;
  participantAName: string;
  participantAPhoto?: string;
  participantBId: string;
  participantBName: string;
  participantBPhoto?: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'INTEREST' | 'MESSAGE' | 'MATCH' | 'SYSTEM' | 'SUBSCRIPTION' | 'VERIFICATION';
  title: string;
  description: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  limits: {
    monthlyInterests: number;
    dailyDirectMessages: number;
    canViewVisitors: boolean;
    hasPriorityMatching: boolean;
    hasFeaturedBadge: boolean;
    directContactAccess: boolean;
  };
  isActive: boolean;
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  date: string;
  paymentMethod: string;
  invoiceNumber: string;
  downloadUrl?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID';
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface AbuseReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedProfileId: string;
  category: 'FAKE_PROFILE' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'SCAM' | 'MISREPRESENTATION' | 'OTHER';
  description: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
  adminActionTaken?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'BILLING' | 'PROFILE' | 'VERIFICATION' | 'TECHNICAL' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED';
  createdAt: string;
  messages: {
    id: string;
    sender: 'USER' | 'AGENT';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface CMSContent {
  announcementBanner: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  successStories: {
    id: string;
    coupleName: string;
    weddingDate: string;
    story: string;
    photoUrl: string;
    city: string;
  }[];
  faqs: {
    question: string;
    answer: string;
    category: string;
  }[];
  testimonials: {
    name: string;
    role: string;
    location: string;
    rating: number;
    quote: string;
    photoUrl: string;
  }[];
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'USER' | 'PROFILE' | 'SUBSCRIPTION' | 'SETTING' | 'VERIFICATION' | 'REPORT';
  targetId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface SystemSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  supportPhone: string;
  minAge: number;
  requireEmailVerification: boolean;
  requireAdminProfileApproval: boolean;
  freeTierMonthlyInterestLimit: number;
  matchingWeights: {
    ageWeight: number;
    locationWeight: number;
    educationWeight: number;
    professionWeight: number;
    lifestyleWeight: number;
    familyWeight: number;
    maritalWeight: number;
  };
}
