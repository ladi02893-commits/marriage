export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | 'CONSULTANT' | 'FAMILY_MEMBER';

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS' | 'BASIC' | 'VIP';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

export type ProfileApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SUSPENDED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';

export type Religion = 'ISLAM' | 'HINDUISM' | 'SIKHISM' | 'CHRISTIANITY' | 'BUDDHISM' | 'JAINISM' | 'SPIRITUAL' | 'OTHER';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNVERIFIED';

export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  profileIdCode?: string; // e.g. "VRM-000001"
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  accountStatus: AccountStatus;
  profileApprovalStatus?: ProfileApprovalStatus;
  isVerified: boolean;
  isWhatsappVerified?: boolean;
  isEmailVerified?: boolean;
  isIdentityVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  profileId?: string;
  subscriptionExpiresAt?: string;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  // Connection Credits
  totalConnections?: number;
  usedConnections?: number;
  remainingConnections?: number;
  assignedConsultantId?: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  isApproved: boolean;
  order?: number;
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
  isIncomePrivate?: boolean;
  currency?: string;
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
  familyValues?: 'TRADITIONAL' | 'MODERATE' | 'LIBERAL' | 'MODERATE_TRADITIONAL' | 'MODERATE_RELIGIOUS' | 'RELIGIOUS_EDUCATED' | 'RELIGIOUS_MODERN' | 'MODERATE_EDUCATED' | string;
  fatherOccupation?: string;
  motherOccupation?: string;
  brothersCount?: number;
  sistersCount?: number;
  familyLocation?: string;
  familyCity?: string;
  livingStatus?: string;
  aboutFamily?: string;
}

export interface PartnerPreferences {
  ageRange?: { min: number; max: number };
  minAge?: number;
  maxAge?: number;
  heightRange?: { min: string; max: string };
  maritalStatus?: MaritalStatus[];
  maritalStatuses?: MaritalStatus[];
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
  photoVisibility?: 'ALL' | 'MEMBERS_ONLY' | 'CONNECTIONS_ONLY' | 'PRIVATE' | 'BLURRED_UNTIL_APPROVED';
  contactVisibility?: 'ONLY_ACCEPTED_INTERESTS' | 'ONLY_UNLOCKED' | 'PREMIUM_ONLY' | 'HIDDEN';
  showPhone?: boolean;
  showWhatsapp?: boolean;
  showEmail?: boolean;
  showAge?: boolean;
  showIncome?: boolean;
  showLastSeen?: boolean;
  searchEngineIndex?: boolean;
  hideProfileTemporarily?: boolean;
  profileVisibility?: 'PUBLIC' | 'VERIFIED_ONLY' | 'CONNECTIONS_ONLY' | 'HIDDEN';
}

export interface MatrimonialProfile {
  id: string;
  userId: string;
  profileIdCode?: string; // e.g. "VRM-000001"
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
  whatsappNumber?: string;
  city: string;
  state: string;
  province?: string;
  area?: string;
  country: string;
  citizenship: string;
  nationality?: string;
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
  isVerified?: boolean;
  isWhatsappVerified?: boolean;
  isEmailVerified?: boolean;
  isIdentityVerified?: boolean;
  isVIPVerified?: boolean;
  approvalStatus: ProfileApprovalStatus;
  isApproved?: boolean;
  viewCount: number;
  likeCount: number;
  fraudScore?: number;
  profileQualityScore?: number;
  aiSummary?: string;
  personalityInsights?: string[];
  assignedConsultantId?: string;
  consultantRecommended?: boolean;
  consultantNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Connection Transactions Log (Section 81 & 82)
export interface ConnectionTransaction {
  id: string;
  userId: string;
  userProfileIdCode: string;
  connectedUserId: string;
  connectedProfileId: string;
  connectedProfileIdCode: string;
  creditsUsed: number;
  reason: string; // "Contact Details Unlocked" or "Connection Interest Accepted"
  date: string;
}

export interface ExtraConnectionPack {
  id: string;
  name: string;
  connectionsCount: number;
  connections?: number;
  pricePKR: number;
  popular?: boolean;
  description?: string;
}

// Dedicated Senior Family Consultant (Sections 24-27)
export interface Consultant {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  avatarUrl: string;
  photoUrl?: string;
  bio: string;
  specialization: string;
  assignedClientIds: string[];
  isActive: boolean;
  rating?: number;
  experienceYears?: number;
  consultationsCompleted?: number;
  availableDays?: string[];
  workingHours?: string;
}

export interface ConsultantRecommendation {
  id: string;
  consultantId: string;
  consultantName: string;
  userId: string;
  targetProfileId: string;
  note: string;
  recommendedAt: string;
}

export interface ConsultantNote {
  id: string;
  consultantId: string;
  consultantName: string;
  userId: string;
  note: string;
  isPrivate: boolean; // Only visible to consultant and admin
  createdAt: string;
}

export interface ConsultantAppointment {
  id: string;
  consultantId: string;
  userId: string;
  userName: string;
  requestedDate: string;
  requestedTime: string;
  topic: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedProfileId: string;
  blockedAt: string;
  reason?: string;
}

export interface FamilyMemberInvitation {
  id: string;
  userId: string;
  familyMemberName: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'SIBLING' | string;
  email: string;
  phone?: string;
  accessCode: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED';
  permissions: {
    canViewMatches: boolean;
    canViewConnections: boolean;
    canFavoriteProfiles: boolean;
    canChatConsultant: boolean;
  };
  createdAt: string;
}

export interface PaymentProof {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userProfileIdCode?: string;
  planSlug: 'BASIC' | 'PREMIUM' | 'VIP' | 'PACK_10' | 'PACK_30' | 'PACK_50' | 'PACK_100' | string;
  planName: string;
  connectionsAdded?: number;
  amount: number;
  currency: string;
  paymentMethod: 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'RAAST' | string;
  senderBank?: string;
  senderName?: string;
  senderMobileNumber?: string;
  senderAccountNumber?: string;
  transactionId: string;
  transactionDate?: string;
  screenshotUrl: string;
  status: 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ReceivingAccount {
  id: string;
  provider: 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'RAAST' | 'SADAPAY' | 'NAYAPAY' | 'OTHER';
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
  senderProfileIdCode?: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  receiverProfileId: string;
  receiverProfileIdCode?: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  relationshipStatus?: 'TALKING' | 'FAMILY_CONTACTED' | 'MATCH_IN_PROGRESS' | 'SUCCESSFUL_MATCH';
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
  type:
    | 'INTEREST'
    | 'INTEREST_ACCEPTED'
    | 'INTEREST_DECLINED'
    | 'MESSAGE'
    | 'MATCH'
    | 'CONSULTANT'
    | 'CONSULTANT_RECOMMENDATION'
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_REJECTED'
    | 'PROFILE_APPROVED'
    | 'PROFILE_CHANGES_REQUESTED'
    | 'CONNECTION_WARNING'
    | 'SUPPORT_REPLY'
    | 'SUBSCRIPTION'
    | 'SYSTEM';
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
  price?: number;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  durationMonths?: number;
  connectionsLimit?: number; // Primary connection quota (e.g. 30, 100, 300)
  connectionLimit?: number;
  hasConsultant?: boolean;
  features: string[];
  limits: {
    monthlyInterests?: number;
    connectionsCount?: number;
    directContactAccess: boolean;
    canChat?: boolean;
    isFeatured?: boolean;
    dedicatedConsultant?: boolean;
    dailyDirectMessages?: number;
    canViewVisitors?: boolean;
    hasPriorityMatching?: boolean;
    hasFeaturedBadge?: boolean;
    viewProfileLimit?: number;
  };
  discountType?: 'FIXED' | 'PERCENT';
  discountValue?: number;
  isActive?: boolean;
  isPopular?: boolean;
  popular?: boolean;
  order?: number;
}

export interface Invoice {
  id: string;
  userId: string;
  userProfileIdCode?: string;
  userName?: string;
  planName: string;
  amount: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  date: string;
  paymentMethod: string;
  transactionId?: string;
  invoiceNumber: string;
  downloadUrl?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileIdCode?: string;
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'CNIC';
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
  reporterProfileIdCode?: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedProfileId: string;
  reportedProfileIdCode?: string;
  category:
    | 'FAKE_PROFILE'
    | 'INCORRECT_INFORMATION'
    | 'HARASSMENT'
    | 'FRAUD'
    | 'INAPPROPRIATE_BEHAVIOUR'
    | 'ALREADY_MARRIED'
    | 'SPAM'
    | 'OTHER';
  description: string;
  comments?: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
  adminActionTaken?: string;
}

export type SupportCategory =
  | 'PAYMENT'
  | 'PROFILE'
  | 'VERIFICATION'
  | 'CONNECTION_ISSUE'
  | 'CONSULTANT'
  | 'TECHNICAL'
  | 'REPORT_USER'
  | 'ACCOUNT'
  | 'OTHER'
  | 'GENERAL';

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  ticketCode: string; // e.g. "SUP-000123"
  userId: string;
  userName: string;
  userEmail: string;
  userProfileIdCode?: string;
  subject: string;
  category: SupportCategory;
  relatedProfileId?: string; // Optional linked Profile ID (e.g. "VRM-000153")
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: SupportTicketStatus;
  attachmentUrl?: string;
  assignedStaff?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'USER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    text: string;
    timestamp: string;
    attachmentUrl?: string;
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
  applicablePackages?: string[];
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
    isApproved?: boolean;
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
  targetType: 'USER' | 'PROFILE' | 'SUBSCRIPTION' | 'PAYMENT' | 'SETTING' | 'VERIFICATION' | 'REPORT' | 'CONSULTANT';
  targetId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface TaxSettings {
  taxEnabled: boolean;
  taxPercentage: number;
  taxFixed: number;
  taxLabel: string; // e.g. "Service Fee (5%)"
}

export interface SystemSettings {
  siteName: string;
  tagline?: string;
  contactEmail?: string;
  supportPhone?: string;
  profileIdPrefix: string; // "VRM-" or "VIP-"
  minAge: number;
  requireEmailVerification: boolean;
  requireWhatsAppVerification: boolean;
  requireAdminProfileApproval: boolean;
  tax: TaxSettings;
  whatsappNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  freeTierConnectionsLimit: number;
  freeTierMonthlyInterestLimit?: number;
  matchingWeights: {
    ageWeight: number;
    locationWeight: number;
    educationWeight: number;
    professionWeight: number;
    lifestyleWeight: number;
    familyWeight: number;
    maritalWeight: number;
  };
  maintenanceMode?: boolean;
  allowNewRegistrations?: boolean;
  whatsappSupportNumber?: string;
  supportEmail?: string;
  currency?: string;
}
