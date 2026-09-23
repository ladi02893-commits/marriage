import { CMSContent, ExtraConnectionPack, SubscriptionPlan, SystemSettings } from './types';

export const PUBLIC_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-basic', name: 'Basic Package', slug: 'BASIC', description: 'Essential matchmaking membership.',
    price: 2000, monthlyPrice: 2000, yearlyPrice: 2000, currency: 'PKR', connectionsLimit: 30,
    features: ['30 connection credits', 'Profile review', 'Advanced profile filters', 'Messaging after mutual acceptance'],
    limits: { connectionsCount: 30, directContactAccess: false, canChat: true },
  },
  {
    id: 'plan-premium', name: 'Premium Package', slug: 'PREMIUM', description: 'Expanded matchmaking membership.',
    price: 5000, monthlyPrice: 5000, yearlyPrice: 5000, currency: 'PKR', connectionsLimit: 100, popular: true,
    features: ['100 connection credits', 'Priority profile review', 'Featured search placement', 'Messaging after mutual acceptance'],
    limits: { connectionsCount: 100, directContactAccess: false, canChat: true, isFeatured: true },
  },
  {
    id: 'plan-vip', name: 'VIP Royal Package', slug: 'VIP', description: 'High-volume matchmaking membership.',
    price: 10000, monthlyPrice: 10000, yearlyPrice: 10000, currency: 'PKR', connectionsLimit: 300,
    features: ['300 connection credits', 'Priority profile review', 'Featured search placement', 'Messaging after mutual acceptance'],
    limits: { connectionsCount: 300, directContactAccess: false, canChat: true, isFeatured: true },
  },
];

// Top-up purchases are intentionally unavailable until they have their own
// server-side catalogue and payment fulfilment transaction.
export const PUBLIC_EXTRA_PACKS: ExtraConnectionPack[] = [];

export const PUBLIC_CMS: CMSContent = {
  announcementBanner: { enabled: true, text: 'Private, consent-based matchmaking with manual profile review.', link: '/safety' },
  successStories: [],
  faqs: [
    {
      question: 'When can members message each other?',
      answer: 'A conversation can start only after an interest request is accepted by the recipient.',
      category: 'Connections',
    },
    {
      question: 'How are payments activated?',
      answer: 'Upload a receipt from your signed-in dashboard. An administrator verifies the amount and transaction before activating the plan.',
      category: 'Billing',
    },
    {
      question: 'Are email and WhatsApp alerts enabled?',
      answer: 'Not yet. These alerts remain disabled until their delivery providers are configured.',
      category: 'Notifications',
    },
  ],
  testimonials: [],
};

export const PUBLIC_SETTINGS: SystemSettings = {
  siteName: 'TRUEPAIR Matchmaking',
  tagline: 'Private, consent-based matchmaking',
  profileIdPrefix: 'TP-',
  minAge: 18,
  requireEmailVerification: false,
  requireWhatsAppVerification: false,
  requireAdminProfileApproval: true,
  whatsappNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  freeTierConnectionsLimit: 30,
  tax: { taxEnabled: false, taxPercentage: 0, taxFixed: 0, taxLabel: 'Tax' },
  matchingWeights: {
    ageWeight: 10, locationWeight: 10, educationWeight: 10, professionWeight: 10,
    lifestyleWeight: 10, familyWeight: 10, maritalWeight: 10,
  },
  maintenanceMode: false,
  allowNewRegistrations: true,
  currency: 'PKR',
};
