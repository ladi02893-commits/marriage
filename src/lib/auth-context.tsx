'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
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
  SubscriptionTier,
  UserRole,
  PaymentProof,
  ReceivingAccount,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_INTERESTS,
  INITIAL_FAVORITES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLANS,
  INITIAL_INVOICES,
  INITIAL_VERIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_TICKETS,
  INITIAL_COUPONS,
  INITIAL_CMS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_PAYMENT_PROOFS,
  INITIAL_RECEIVING_ACCOUNTS,
} from './data-store';
import { calculateProfileCompletion } from './utils';

interface AuthContextType {
  currentUser: User | null;
  currentProfile: MatrimonialProfile | null;
  users: User[];
  profiles: MatrimonialProfile[];
  interests: InterestRequest[];
  favorites: FavoriteItem[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  notifications: NotificationItem[];
  plans: SubscriptionPlan[];
  invoices: Invoice[];
  verifications: VerificationRequest[];
  reports: AbuseReport[];
  tickets: SupportTicket[];
  coupons: Coupon[];
  cms: CMSContent;
  auditLogs: AdminAuditLog[];
  settings: SystemSettings;
  paymentProofs: PaymentProof[];
  receivingAccounts: ReceivingAccount[];

  // Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (userData: Partial<User>, profileData: Partial<MatrimonialProfile>) => User;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<MatrimonialProfile>) => void;
  updateUserSubscription: (tier: SubscriptionTier) => void;
  canViewContactDetails: (targetProfileId: string) => boolean;
  
  // Payment Proofs & Receiving Accounts
  submitPaymentProof: (data: Omit<PaymentProof, 'id' | 'status' | 'submittedAt'>) => void;
  approvePaymentProof: (proofId: string) => void;
  rejectPaymentProof: (proofId: string, reason?: string) => void;
  processInstantPayment: (params: {
    planSlug: string;
    planName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
    cardLast4?: string;
  }) => Promise<{ success: boolean; invoice: Invoice }>;
  addReceivingAccount: (account: Omit<ReceivingAccount, 'id' | 'createdAt'>) => void;
  updateReceivingAccount: (id: string, data: Partial<ReceivingAccount>) => void;
  deleteReceivingAccount: (id: string) => void;
  toggleReceivingAccountStatus: (id: string) => void;
  
  // Connection Quota & Access
  connectionQuota: {
    used: number;
    total: number;
    remaining: number;
    isReached: boolean;
    planName: string;
  };
  canAccessProfile: (targetProfileId: string) => boolean;

  // Interests
  sendInterest: (targetProfileId: string, message?: string) => { success: boolean; message: string };
  acceptInterest: (interestId: string) => void;
  declineInterest: (interestId: string) => void;
  cancelInterest: (interestId: string) => void;
  
  // Favorites
  toggleFavorite: (targetProfileId: string) => boolean;
  isFavorited: (targetProfileId: string) => boolean;
  
  // Messages
  sendMessage: (conversationId: string, text: string) => void;
  startOrGetConversation: (recipientUserId: string) => string;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Verification
  submitVerification: (documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID', docUrl: string, selfieUrl: string) => void;
  approveVerification: (verifId: string, notes?: string) => void;
  rejectVerification: (verifId: string, notes?: string) => void;
  
  // Moderation & Admin
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => void;
  verifyUserBadge: (userId: string, isVerified: boolean) => void;
  submitReport: (reportedUserId: string, category: any, description: string) => void;
  resolveReport: (reportId: string, actionTaken: string) => void;
  dismissReport: (reportId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  updatePlan: (planId: string, data: Partial<SubscriptionPlan>) => void;
  addPlan: (plan: SubscriptionPlan) => void;
  applyCoupon: (code: string) => { valid: boolean; discountPercent?: number; fixedDiscount?: number; message: string };
  logAdminAction: (action: string, targetType: any, targetId: string, details: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>(INITIAL_PROFILES);
  const [interests, setInterests] = useState<InterestRequest[]>(INITIAL_INTERESTS);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(INITIAL_VERIFICATIONS);
  const [reports, setReports] = useState<AbuseReport[]>(INITIAL_REPORTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [cms, setCms] = useState<CMSContent>(INITIAL_CMS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>(INITIAL_PAYMENT_PROOFS);
  const [receivingAccounts, setReceivingAccounts] = useState<ReceivingAccount[]>(INITIAL_RECEIVING_ACCOUNTS);
  // Active authenticated user state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<MatrimonialProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Sync session on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        // 1. Check local storage for persistent data & active user
        const savedUsersStr = typeof window !== 'undefined' ? localStorage.getItem('truepair_live_users') : null;
        let liveUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;

        // Check and automatically expire plans whose subscriptionExpiresAt is in the past
        const now = new Date();
        let usersExpired = false;
        liveUsers = liveUsers.map((u) => {
          if (u.subscriptionTier !== 'FREE' && u.subscriptionExpiresAt) {
            const expDate = new Date(u.subscriptionExpiresAt);
            if (now > expDate) {
              usersExpired = true;
              return {
                ...u,
                subscriptionTier: 'FREE' as SubscriptionTier,
                subscriptionExpiresAt: undefined,
                billingCycle: undefined,
              };
            }
          }
          return u;
        });

        if (savedUsersStr && isMounted) {
          setUsers(liveUsers);
        }

        const savedInvoicesStr = typeof window !== 'undefined' ? localStorage.getItem('truepair_live_invoices') : null;
        if (savedInvoicesStr && isMounted) {
          setInvoices(JSON.parse(savedInvoicesStr));
        }

        const savedProofsStr = typeof window !== 'undefined' ? localStorage.getItem('truepair_live_payment_proofs') : null;
        if (savedProofsStr && isMounted) {
          setPaymentProofs(JSON.parse(savedProofsStr));
        }

        const savedAccountsStr = typeof window !== 'undefined' ? localStorage.getItem('truepair_live_receiving_accounts') : null;
        if (savedAccountsStr && isMounted) {
          setReceivingAccounts(JSON.parse(savedAccountsStr));
        }

        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('truepair_active_user_id') : null;
        if (savedUserId && isMounted) {
          let matchedUser = liveUsers.find((u) => u.id === savedUserId) || INITIAL_USERS.find((u) => u.id === savedUserId);
          if (matchedUser) {
            // Check if active user plan expired
            if (matchedUser.subscriptionTier !== 'FREE' && matchedUser.subscriptionExpiresAt) {
              if (now > new Date(matchedUser.subscriptionExpiresAt)) {
                matchedUser = {
                  ...matchedUser,
                  subscriptionTier: 'FREE',
                  subscriptionExpiresAt: undefined,
                  billingCycle: undefined,
                };
              }
            }

            const activeUser: User = matchedUser;
            setCurrentUser(activeUser);
            setCurrentUserId(activeUser.id);
            const matchedProfile = INITIAL_PROFILES.find((p) => p.userId === activeUser.id || p.id === activeUser.profileId) || null;
            setCurrentProfile(matchedProfile);
          }
        }

        // 2. Fetch server session from HTTP cookie
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            // Check if local storage had a later subscription update for this user
            const localUser = liveUsers.find((u) => u.id === data.user.id);
            const mergedUser = localUser ? { ...data.user, subscriptionTier: localUser.subscriptionTier } : data.user;

            setCurrentUser(mergedUser);
            setCurrentUserId(mergedUser.id);
            const matchedProf =
              profiles.find((p) => p.userId === mergedUser.id || p.id === mergedUser.profileId) ||
              INITIAL_PROFILES.find((p) => p.userId === mergedUser.id || p.id === mergedUser.profileId) ||
              data.profile ||
              INITIAL_PROFILES[0];
            setCurrentProfile(matchedProf);
            if (typeof window !== 'undefined') {
              localStorage.setItem('truepair_active_user_id', mergedUser.id);
            }
          }
        }

        // 3. Background sync with Prisma Database API endpoints
        try {
          const [profRes, intRes, proofRes, invRes, accRes] = await Promise.allSettled([
            fetch('/api/profiles', { cache: 'no-store' }),
            fetch('/api/interests', { cache: 'no-store' }),
            fetch('/api/payments/proofs', { cache: 'no-store' }),
            fetch('/api/invoices', { cache: 'no-store' }),
            fetch('/api/receiving-accounts', { cache: 'no-store' }),
          ]);

          if (profRes.status === 'fulfilled' && profRes.value.ok && isMounted) {
            const profData = await profRes.value.json();
            if (profData.data?.length) setProfiles(profData.data);
          }
          if (intRes.status === 'fulfilled' && intRes.value.ok && isMounted) {
            const intData = await intRes.value.json();
            if (intData.data?.length) setInterests(intData.data);
          }
          if (proofRes.status === 'fulfilled' && proofRes.value.ok && isMounted) {
            const pData = await proofRes.value.json();
            if (pData.data?.length) setPaymentProofs(pData.data);
          }
          if (invRes.status === 'fulfilled' && invRes.value.ok && isMounted) {
            const invData = await invRes.value.json();
            if (invData.data?.length) setInvoices(invData.data);
          }
          if (accRes.status === 'fulfilled' && accRes.value.ok && isMounted) {
            const accData = await accRes.value.json();
            if (accData.data?.length) setReceivingAccounts(accData.data);
          }
        } catch (apiSyncErr) {
          console.warn('Background database sync notice:', apiSyncErr);
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persistent live synchronization across tabs & user logins
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedInterests = localStorage.getItem('truepair_live_interests');
      if (savedInterests) setInterests(JSON.parse(savedInterests));

      const savedConversations = localStorage.getItem('truepair_live_conversations');
      if (savedConversations) setConversations(JSON.parse(savedConversations));

      const savedMessages = localStorage.getItem('truepair_live_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));

      const savedNotifications = localStorage.getItem('truepair_live_notifications');
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedFavorites = localStorage.getItem('truepair_live_favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedInvoices = localStorage.getItem('truepair_live_invoices');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedProofs = localStorage.getItem('truepair_live_payment_proofs');
      if (savedProofs) setPaymentProofs(JSON.parse(savedProofs));

      const savedAccounts = localStorage.getItem('truepair_live_receiving_accounts');
      if (savedAccounts) setReceivingAccounts(JSON.parse(savedAccounts));
    } catch (e) {
      console.error('Error loading stored live interactions:', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'truepair_live_interests' && e.newValue) {
          setInterests(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_conversations' && e.newValue) {
          setConversations(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_messages' && e.newValue) {
          setMessages(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_notifications' && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_favorites' && e.newValue) {
          setFavorites(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_invoices' && e.newValue) {
          setInvoices(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_payment_proofs' && e.newValue) {
          setPaymentProofs(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_receiving_accounts' && e.newValue) {
          setReceivingAccounts(JSON.parse(e.newValue));
        }
        if (e.key === 'truepair_live_users' && e.newValue) {
          setUsers(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto save state updates to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_interests', JSON.stringify(interests));
    }
  }, [interests]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_payment_proofs', JSON.stringify(paymentProofs));
    }
  }, [paymentProofs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_receiving_accounts', JSON.stringify(receivingAccounts));
    }
  }, [receivingAccounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truepair_live_users', JSON.stringify(users));
    }
  }, [users]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || 'password123' }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setCurrentUserId(data.user.id);
        // Resolve profile: check live profiles state first, then INITIAL_PROFILES
        const prof =
          profiles.find((p) => p.userId === data.user.id || p.id === data.user.profileId) ||
          INITIAL_PROFILES.find((p) => p.userId === data.user.id || p.id === data.user.profileId) ||
          INITIAL_PROFILES[0];
        setCurrentProfile(prof);
        if (typeof window !== 'undefined') {
          localStorage.setItem('truepair_active_user_id', data.user.id);
        }
        return { success: true, redirectUrl: data.redirectUrl || '/dashboard' };
      } else {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }
    } catch (err: any) {
      // Local fallback
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
        INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setCurrentUserId(existing.id);
        setCurrentUser(existing);
        // Always resolve profile — never leave it null for a logged-in user
        const prof =
          profiles.find((p) => p.userId === existing.id || p.id === existing.profileId) ||
          INITIAL_PROFILES.find((p) => p.userId === existing.id || p.id === existing.profileId) ||
          INITIAL_PROFILES[0];
        setCurrentProfile(prof);
        if (typeof window !== 'undefined') {
          localStorage.setItem('truepair_active_user_id', existing.id);
        }
        const isPrivileged =
          existing.role === 'SUPER_ADMIN' ||
          existing.role === 'ADMIN' ||
          existing.role === 'MODERATOR' ||
          existing.email.toLowerCase() === 'ladi02893@gmail.com';
        return { success: true, redirectUrl: isPrivileged ? '/admin' : '/dashboard' };
      }
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setCurrentProfile(null);
    setCurrentUserId('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('truepair_active_user_id');
    }
  };

  const register = (userData: Partial<User>, profileData: Partial<MatrimonialProfile>): User => {
    const newUserId = `user-${Date.now()}`;
    const newProfileId = `profile-${Date.now()}`;

    // Post to real PostgreSQL database API
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: (userData as any).password || 'password123',
        fullName: userData.name || profileData.fullName,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        maritalStatus: profileData.maritalStatus,
        religion: profileData.religion,
        sectOrCommunity: profileData.sectOrCommunity,
        motherTongue: profileData.motherTongue,
        country: profileData.country,
        city: profileData.city,
        profession: profileData.educationCareer?.profession,
        highestDegree: profileData.educationCareer?.highestDegree,
        institution: profileData.educationCareer?.institution,
        annualIncome: profileData.educationCareer?.annualIncome,
        height: profileData.lifestyle?.height,
        bioHeadline: profileData.bioHeadline,
        aboutMe: profileData.aboutMe,
        avatarUrl: profileData.photos?.[0]?.url,
      }),
    }).catch((err) => console.error('Database register error:', err));

    const newUser: User = {
      id: newUserId,
      name: userData.name || 'New Member',
      email: userData.email || `member${Date.now()}@example.com`,
      role: 'USER',
      subscriptionTier: 'FREE',
      accountStatus: 'ACTIVE',
      isVerified: false,
      avatarUrl: profileData.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
      profileId: newProfileId,
    };

    const newProfile: MatrimonialProfile = {
      id: newProfileId,
      userId: newUserId,
      fullName: profileData.fullName || newUser.name,
      displayName: (profileData.fullName || newUser.name).split(' ')[0] + ' ' + ((profileData.fullName || newUser.name).split(' ')[1]?.[0] || '') + '.',
      gender: profileData.gender || 'FEMALE',
      dateOfBirth: profileData.dateOfBirth || '1998-01-01',
      age: profileData.age || 27,
      maritalStatus: profileData.maritalStatus || 'NEVER_MARRIED',
      religion: profileData.religion || 'ISLAM',
      sectOrCommunity: profileData.sectOrCommunity || '',
      motherTongue: profileData.motherTongue || 'Urdu',
      city: profileData.city || 'London',
      state: profileData.state || 'Greater London',
      country: profileData.country || 'United Kingdom',
      citizenship: profileData.citizenship || 'British',
      bioHeadline: profileData.bioHeadline || 'Professional seeking meaningful lifelong marriage',
      aboutMe: profileData.aboutMe || 'I value honesty, integrity, intellectual curiosity, and family harmony.',
      photos: profileData.photos || [
        {
          id: `p-${Date.now()}-1`,
          url: newUser.avatarUrl!,
          isPrimary: true,
          isApproved: true,
          order: 1,
        },
      ],
      educationCareer: profileData.educationCareer || {
        highestDegree: "Bachelor's",
        institution: 'University',
        fieldOfStudy: 'General',
        profession: 'Professional',
        jobTitle: 'Consultant',
        company: 'Enterprise',
        annualIncome: '$60,000 - $80,000',
        employmentSector: 'PRIVATE',
        workingLocation: 'London',
      },
      lifestyle: profileData.lifestyle || {
        height: "5 ft 7 in (170 cm)",
        bodyType: 'AVERAGE',
        diet: 'HALAL_ONLY',
        smoking: 'NO',
        drinking: 'NO',
        motherTongue: 'Urdu',
        languagesSpoken: ['English', 'Urdu'],
        hobbies: ['Reading', 'Travel', 'Cooking'],
        interests: ['Art', 'Community'],
        livingArrangement: 'INDEPENDENT',
      },
      familyInfo: profileData.familyInfo || {
        familyType: 'NUCLEAR',
        familyValues: 'MODERATE',
        fatherOccupation: 'Professional',
        motherOccupation: 'Homemaker',
        brothersCount: 1,
        sistersCount: 1,
        familyLocation: 'London',
        aboutFamily: 'Educated and respectable family with warm values.',
      },
      partnerPreferences: profileData.partnerPreferences || {
        ageRange: { min: 25, max: 35 },
        heightRange: { min: "5 ft 8 in", max: "6 ft 2 in" },
        maritalStatus: ['NEVER_MARRIED'],
        religions: ['ISLAM'],
        educationLevels: ["Bachelor's", "Master's"],
        professions: ['Any Professional'],
        preferredLocations: ['United Kingdom', 'United States', 'Canada'],
        dietaryPreferences: ['HALAL_ONLY'],
        motherTongues: ['Urdu', 'English'],
        expectationsNotes: 'Seeking a kind, educated life partner with shared moral values.',
      },
      privacy: profileData.privacy || {
        photoVisibility: 'ALL',
        contactVisibility: 'ONLY_ACCEPTED_INTERESTS',
        showAge: true,
        showIncome: true,
        showLastSeen: true,
        searchEngineIndex: false,
        hideProfileTemporarily: false,
      },
      completionPercentage: calculateProfileCompletion(profileData),
      isFeatured: false,
      isBoosted: false,
      verificationBadge: 'UNVERIFIED',
      viewCount: 1,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setProfiles((prev) => [newProfile, ...prev]);
    setCurrentUserId(newUserId);
    return newUser;
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId) || INITIAL_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setCurrentUser(found);
      const prof =
        profiles.find((p) => p.userId === found.id || p.id === found.profileId) ||
        INITIAL_PROFILES.find((p) => p.userId === found.id || p.id === found.profileId) ||
        INITIAL_PROFILES[0];
      setCurrentProfile(prof);
      if (typeof window !== 'undefined') {
        localStorage.setItem('truepair_active_user_id', found.id);
      }
      fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: found.id }),
      }).catch(() => {});
    }
  };

  const updateCurrentUserProfile = (data: Partial<MatrimonialProfile>) => {
    if (!currentProfile) return;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === currentProfile.id) {
          const updated = { ...p, ...data, updatedAt: new Date().toISOString() };
          updated.completionPercentage = calculateProfileCompletion(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const updateUserSubscription = (tier: SubscriptionTier, durationDays: number = 30) => {
    if (!currentUser) return;
    const expiresAt = tier === 'FREE' ? undefined : new Date(Date.now() + durationDays * 86400000).toISOString();
    const updated: User = {
      ...currentUser,
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt,
      billingCycle: durationDays > 90 ? 'ANNUAL' : 'MONTHLY',
    };
    setCurrentUser(updated);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
  };

  // Connection / Interest Quota Tracking
  const isPrivilegedUser =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'MODERATOR' ||
    currentUser?.email === 'ladi02893@gmail.com';

  const userSentInterests = interests.filter(
    (i) => i.senderId === currentUser?.id || (currentProfile && i.senderProfileId === currentProfile.id)
  );
  const userSentInterestsCount = userSentInterests.length;

  const currentPlan =
    plans.find((p) => {
      if (currentUser?.subscriptionTier === 'PREMIUM') return p.slug === 'PREMIUM';
      if (currentUser?.subscriptionTier === 'PREMIUM_PLUS') return p.slug === 'VIP';
      return p.slug === 'BASIC';
    }) || plans[0];

  const planLimit = isPrivilegedUser
    ? 99999
    : (currentPlan?.limits?.monthlyInterests ??
      (currentUser?.subscriptionTier === 'FREE' ? (settings?.freeTierMonthlyInterestLimit ?? 2) : 50));

  const isLimitReached = !isPrivilegedUser && userSentInterestsCount >= planLimit;

  const connectionQuota = {
    used: userSentInterestsCount,
    total: planLimit,
    remaining: Math.max(0, planLimit - userSentInterestsCount),
    isReached: isLimitReached,
    planName: currentPlan?.name || 'Basic Matchmaking',
  };

  // Helper to verify if user can browse a candidate profile
  // ALL profiles are discoverable & visible, actions are gated via QuotaLimitModal
  const canAccessProfile = (targetProfileId: string): boolean => {
    return true;
  };

  // Interests
  const sendInterest = (targetProfileId: string, message?: string) => {
    if (!currentUser) return { success: false, message: 'Please log in to send an interest request.' };

    const resolvedCurrentProfile =
      currentProfile ||
      profiles.find((p) => p.userId === currentUser.id || p.id === currentUser.profileId) ||
      INITIAL_PROFILES.find((p) => p.userId === currentUser.id || p.id === currentUser.profileId) ||
      INITIAL_PROFILES[0];

    if (!isPrivilegedUser && connectionQuota.isReached) {
      return {
        success: false,
        message: `Connection limit reached (${connectionQuota.used}/${connectionQuota.total}). Please upgrade your plan to connect with more profiles.`,
      };
    }

    const target =
      profiles.find((p) => p.id === targetProfileId) ||
      INITIAL_PROFILES.find((p) => p.id === targetProfileId);

    if (!target) return { success: false, message: 'Candidate profile not found.' };

    if (resolvedCurrentProfile && resolvedCurrentProfile.id === target.id) {
      return { success: false, message: 'You cannot send an interest request to your own profile.' };
    }

    // Check if already sent
    const existing = interests.find(
      (i) =>
        (i.senderId === currentUser.id && i.receiverProfileId === targetProfileId) ||
        (resolvedCurrentProfile && i.senderProfileId === resolvedCurrentProfile.id && i.receiverProfileId === targetProfileId)
    );
    if (existing) {
      return { success: false, message: 'You have already sent an interest to this member.' };
    }

    const newInterest: InterestRequest = {
      id: `int-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderPhoto: currentUser.avatarUrl || resolvedCurrentProfile?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      senderProfileId: resolvedCurrentProfile?.id || `profile-${currentUser.id}`,
      receiverId: target.userId,
      receiverName: target.fullName,
      receiverPhoto: target.photos?.[0]?.url,
      receiverProfileId: target.id,
      status: 'PENDING',
      message: message || `Hello ${target.displayName}, I would love to connect and introduce our families.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInterests((prev) => [newInterest, ...prev]);

    // Background sync to Prisma Database
    fetch('/api/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInterest),
    }).catch((err) => console.warn('Prisma interest sync notice:', err));

    // Send notification to receiver
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: target.userId,
      type: 'INTEREST',
      title: 'New Matrimonial Interest',
      description: `${currentUser.name} sent you a connection interest.`,
      linkUrl: '/dashboard/interests',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, message: 'Interest sent successfully! You will be notified when they respond.' };
  };

  const acceptInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.map((item) =>
        item.id === interestId
          ? { ...item, status: 'ACCEPTED', updatedAt: new Date().toISOString() }
          : item
      )
    );

    // Sync to Prisma Database
    fetch('/api/interests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: interestId, status: 'ACCEPTED' }),
    }).catch((err) => console.warn('Prisma accept interest sync notice:', err));

    const intReq = interests.find((i) => i.id === interestId);
    if (intReq) {
      // Start or ensure conversation is available
      startOrGetConversation(intReq.senderId);

      // Notification
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: intReq.senderId,
        type: 'INTEREST',
        title: 'Interest Accepted! 🎉',
        description: `${intReq.receiverName} accepted your connection interest. You can now chat!`,
        linkUrl: '/dashboard/messages',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const declineInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.map((item) =>
        item.id === interestId
          ? { ...item, status: 'DECLINED', updatedAt: new Date().toISOString() }
          : item
      )
    );

    // Sync to Prisma Database
    fetch('/api/interests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: interestId, status: 'DECLINED' }),
    }).catch((err) => console.warn('Prisma decline interest sync notice:', err));
  };

  const cancelInterest = (interestId: string) => {
    setInterests((prev) => prev.filter((item) => item.id !== interestId));
  };

  // Favorites
  const toggleFavorite = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    const existing = favorites.find(
      (f) => f.userId === currentUser.id && f.targetProfileId === targetProfileId
    );

    if (existing) {
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      return false;
    } else {
      const target = profiles.find((p) => p.id === targetProfileId);
      if (!target) return false;
      const newFav: FavoriteItem = {
        id: `fav-${Date.now()}`,
        userId: currentUser.id,
        targetProfileId,
        targetProfile: target,
        createdAt: new Date().toISOString(),
      };
      setFavorites((prev) => [newFav, ...prev]);
      return true;
    }
  };

  const isFavorited = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    return favorites.some(
      (f) => f.userId === currentUser.id && f.targetProfileId === targetProfileId
    );
  };

  // Messages
  const sendMessage = (conversationId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: text.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessageText: text.trim(),
              lastMessageTime: 'Just now',
            }
          : c
      )
    );
  };

  const startOrGetConversation = (recipientUserId: string): string => {
    if (!currentUser) return '';

    const otherUser =
      users.find((u) => u.id === recipientUserId || u.profileId === recipientUserId) ||
      INITIAL_USERS.find((u) => u.id === recipientUserId || u.profileId === recipientUserId);
    const targetUserId = otherUser?.id || recipientUserId;
    const targetProfile =
      profiles.find((p) => p.userId === targetUserId || p.id === recipientUserId) ||
      INITIAL_PROFILES.find((p) => p.userId === targetUserId || p.id === recipientUserId);

    const existing = conversations.find(
      (c) =>
        (c.participantAId === currentUser.id && (c.participantBId === targetUserId || c.participantBId === recipientUserId)) ||
        ((c.participantAId === targetUserId || c.participantAId === recipientUserId) && c.participantBId === currentUser.id)
    );

    if (existing) return existing.id;

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantAId: currentUser.id,
      participantAName: currentUser.name,
      participantAPhoto: currentUser.avatarUrl || currentProfile?.photos?.[0]?.url,
      participantBId: targetUserId,
      participantBName: otherUser?.name || targetProfile?.fullName || targetProfile?.displayName || 'Match',
      participantBPhoto: otherUser?.avatarUrl || targetProfile?.photos?.[0]?.url,
      lastMessageText: 'Conversation opened',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      status: 'ACTIVE',
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newConvId]: [
        {
          id: `msg-${Date.now()}`,
          conversationId: newConvId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: `Assalam-o-Alaikum ${otherUser?.name || targetProfile?.displayName || ''}! Delighted to connect with you.`,
          timestamp: 'Just now',
          isRead: true,
        },
      ],
    }));

    return newConvId;
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Verifications
  const submitVerification = (
    documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID',
    docUrl: string,
    selfieUrl: string
  ) => {
    if (!currentUser) return;
    const newReq: VerificationRequest = {
      id: `verif-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      documentType,
      documentFrontUrl: docUrl,
      selfieUrl,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      reviewerNotes: 'Under review by our compliance team.',
    };

    setVerifications((prev) => [newReq, ...prev]);
  };

  const approveVerification = (verifId: string, notes?: string) => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === verifId
          ? {
              ...v,
              status: 'APPROVED',
              reviewedAt: new Date().toISOString(),
              reviewerNotes: notes || 'Approved by administrator.',
            }
          : v
      )
    );

    const verif = verifications.find((v) => v.id === verifId);
    if (verif) {
      verifyUserBadge(verif.userId, true);
      logAdminAction(
        'APPROVED_VERIFICATION',
        'VERIFICATION',
        verifId,
        `Approved identity document for user ${verif.userName}`
      );
    }
  };

  const rejectVerification = (verifId: string, notes?: string) => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === verifId
          ? {
              ...v,
              status: 'REJECTED',
              reviewedAt: new Date().toISOString(),
              reviewerNotes: notes || 'Document was unreadable or mismatched.',
            }
          : v
      )
    );

    const verif = verifications.find((v) => v.id === verifId);
    if (verif) {
      verifyUserBadge(verif.userId, false);
      logAdminAction(
        'REJECTED_VERIFICATION',
        'VERIFICATION',
        verifId,
        `Rejected verification for user ${verif.userName}: ${notes}`
      );
    }
  };

  // Moderation & Admin
  const updateUserStatus = (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u))
    );
    logAdminAction('UPDATED_USER_STATUS', 'USER', userId, `Changed account status to ${status}`);
  };

  const verifyUserBadge = (userId: string, isVerified: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified } : u))
    );
    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === userId
          ? { ...p, verificationBadge: isVerified ? 'VERIFIED' : 'UNVERIFIED' }
          : p
      )
    );
  };

  const submitReport = (reportedUserId: string, category: any, description: string) => {
    if (!currentUser) return;
    const target = users.find((u) => u.id === reportedUserId);
    const targetProfile = profiles.find((p) => p.userId === reportedUserId);
    const newReport: AbuseReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportedUserId,
      reportedUserName: target?.name || 'User',
      reportedProfileId: targetProfile?.id || '',
      category,
      description,
      status: 'OPEN',
      timestamp: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, actionTaken: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'RESOLVED', adminActionTaken: actionTaken }
          : r
      )
    );
    logAdminAction('RESOLVED_REPORT', 'REPORT', reportId, `Resolved report: ${actionTaken}`);
  };

  const dismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'DISMISSED' } : r))
    );
    logAdminAction('DISMISSED_REPORT', 'REPORT', reportId, 'Dismissed abuse report');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAdminAction('UPDATED_SYSTEM_SETTINGS', 'SETTING', 'settings', 'Updated system configurations');
  };

  const updatePlan = (planId: string, data: Partial<SubscriptionPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...data } : p))
    );
    logAdminAction('UPDATED_SUBSCRIPTION_PLAN', 'SUBSCRIPTION', planId, 'Updated plan pricing/limits');
  };

  const addPlan = (plan: SubscriptionPlan) => {
    setPlans((prev) => [...prev, plan]);
    logAdminAction('CREATED_SUBSCRIPTION_PLAN', 'SUBSCRIPTION', plan.id, `Created plan ${plan.name}`);
  };

  const applyCoupon = (code: string) => {
    const c = coupons.find(
      (cp) => cp.code.toUpperCase() === code.trim().toUpperCase() && cp.isActive
    );
    if (!c) {
      return { valid: false, message: 'Invalid or expired coupon code.' };
    }
    return {
      valid: true,
      discountPercent: c.discountPercent,
      fixedDiscount: c.fixedDiscount,
      message: `Coupon applied: ${c.discountPercent ? `${c.discountPercent}% OFF` : `$${c.fixedDiscount} OFF`}`,
    };
  };

  const canViewContactDetails = (targetProfileId: string): boolean => {
    if (!currentUser || !currentProfile) return false;
    // Admin / Super Admin can view all
    if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MODERATOR') {
      return true;
    }
    // Own profile
    if (currentProfile.id === targetProfileId) return true;

    // Check if mutual accepted interest request exists
    const hasAcceptedInterest = interests.some(
      (i) =>
        i.status === 'ACCEPTED' &&
        ((i.senderProfileId === currentProfile.id && i.receiverProfileId === targetProfileId) ||
          (i.senderProfileId === targetProfileId && i.receiverProfileId === currentProfile.id))
    );
    if (hasAcceptedInterest) return true;

    // VIP Plan with direct contact access
    const userPlan = plans.find((p) => p.slug === currentUser.subscriptionTier);
    if (userPlan?.limits?.directContactAccess) {
      return true;
    }

    return false;
  };

  const submitPaymentProof = (data: Omit<PaymentProof, 'id' | 'status' | 'submittedAt'>) => {
    const now = new Date().toISOString();
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newProof: PaymentProof = {
      ...data,
      id: `pay-proof-${Date.now()}`,
      status: 'PENDING',
      submittedAt: now,
    };

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      userId: data.userId || currentUser?.id || `user-${Date.now()}`,
      planName: data.planName,
      amount: data.amount,
      currency: data.currency || 'PKR',
      status: 'PENDING',
      date: now,
      paymentMethod: data.paymentMethod,
      invoiceNumber: invoiceNum,
    };

    setPaymentProofs((prev) => [newProof, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    // Background sync to Prisma Database
    fetch('/api/payments/proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => console.warn('Prisma payment proof sync notice:', err));

    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoice),
    }).catch((err) => console.warn('Prisma invoice sync notice:', err));

    // Send user confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: data.userId || currentUser?.id || '',
      title: '📋 Payment Proof Submitted',
      description: `Your payment proof (TRX: ${data.transactionId}) for ${data.planName} has been submitted for admin verification. Turnaround is typically 1-2 hours.`,
      type: 'SUBSCRIPTION',
      isRead: false,
      createdAt: now,
      linkUrl: '/dashboard/subscription',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAdminAction(
      'PAYMENT_PROOF_SUBMITTED',
      'SUBSCRIPTION',
      newProof.id,
      `Payment proof submitted by ${data.userName} for ${data.planName} (${data.currency} ${data.amount}) via ${data.paymentMethod}`
    );
  };

  const processInstantPayment = async (params: {
    planSlug: string;
    planName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
    cardLast4?: string;
  }): Promise<{ success: boolean; invoice: Invoice }> => {
    const tierMap: Record<string, SubscriptionTier> = {
      BASIC: 'FREE',
      PREMIUM: 'PREMIUM',
      VIP: 'PREMIUM_PLUS',
    };
    const targetTier = tierMap[params.planSlug.toUpperCase()] || 'PREMIUM';
    const now = new Date().toISOString();
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const billingCycle = params.billingCycle || 'MONTHLY';
    const durationDays = billingCycle === 'ANNUAL' ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      userId: currentUser?.id || `user-${Date.now()}`,
      planName: params.planName,
      amount: params.amount,
      currency: params.currency || 'PKR',
      status: 'PAID',
      date: now,
      paymentMethod: params.paymentMethod || 'Credit / Debit Card (Online)',
      invoiceNumber: invoiceNum,
    };

    const newProof: PaymentProof = {
      id: `pay-proof-${Date.now()}`,
      userId: currentUser?.id || `user-${Date.now()}`,
      userName: currentUser?.name || 'Valued Member',
      userEmail: currentUser?.email || '',
      userPhone: currentProfile?.phone || '',
      planSlug: params.planSlug.toUpperCase(),
      planName: params.planName,
      amount: params.amount,
      currency: params.currency || 'PKR',
      paymentMethod: params.paymentMethod,
      transactionId: `TXN-ONL-${Date.now().toString().slice(-8)}`,
      screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      status: 'VERIFIED',
      submittedAt: now,
      reviewedAt: now,
      reviewedBy: 'Instant SSL Gateway',
    };

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        subscriptionTier: targetTier,
        subscriptionExpiresAt: expiresAt,
        billingCycle,
        isVerified: true,
        accountStatus: 'ACTIVE',
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    setPaymentProofs((prev) => [newProof, ...prev]);

    // Background sync to Prisma Database
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoice),
    }).catch((err) => console.warn('Prisma invoice sync notice:', err));

    fetch('/api/payments/proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProof),
    }).catch((err) => console.warn('Prisma proof sync notice:', err));

    // Send instant success notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || '',
      title: '🎉 Membership Upgraded Successfully!',
      description: `Your account is now activated on the ${params.planName} tier with immediate full access. Invoice #${invoiceNum} generated.`,
      type: 'SUBSCRIPTION',
      isRead: false,
      createdAt: now,
      linkUrl: '/dashboard/subscription',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAdminAction(
      'INSTANT_PAYMENT_SUCCESS',
      'SUBSCRIPTION',
      newProof.id,
      `Instant payment of ${params.currency} ${params.amount} processed for user ${currentUser?.name || currentUser?.email} (${targetTier})`
    );

    return { success: true, invoice: newInvoice };
  };

  const approvePaymentProof = (proofId: string) => {
    const proof = paymentProofs.find((p) => p.id === proofId);
    if (!proof) return;

    const now = new Date().toISOString();

    setPaymentProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: 'VERIFIED' as const,
              reviewedAt: now,
              reviewedBy: currentUser?.name || 'Administrator',
            }
          : p
      )
    );

    // Sync to Prisma Database
    fetch('/api/payments/proofs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: proofId,
        status: 'VERIFIED',
        reviewerName: currentUser?.name || 'Administrator',
      }),
    }).catch((err) => console.warn('Prisma approve proof sync notice:', err));

    const targetTier = (proof.planSlug.toUpperCase() as SubscriptionTier) || 'PREMIUM';
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

    // Upgrade target user subscription & verify badge
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === proof.userId) {
          const updated: User = {
            ...u,
            subscriptionTier: targetTier,
            subscriptionExpiresAt: expiresAt,
            billingCycle: 'MONTHLY',
            accountStatus: 'ACTIVE' as const,
            isVerified: true,
          };
          return updated;
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === proof.userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              subscriptionTier: targetTier,
              subscriptionExpiresAt: expiresAt,
              billingCycle: 'MONTHLY',
              isVerified: true,
              accountStatus: 'ACTIVE',
            }
          : null
      );
    }

    // Mark user's matching pending invoice as PAID
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.userId === proof.userId && inv.status === 'PENDING'
          ? { ...inv, status: 'PAID' as const }
          : inv
      )
    );

    // Send confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: proof.userId,
      title: '🎉 Payment Verified & Membership Activated!',
      description: `Your payment of ${proof.currency} ${proof.amount} has been verified by the administration. You now have full ${proof.planName} privileges!`,
      type: 'SUBSCRIPTION',
      isRead: false,
      createdAt: now,
      linkUrl: '/dashboard/subscription',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAdminAction(
      'APPROVED_PAYMENT_PROOF',
      'SUBSCRIPTION',
      proofId,
      `Approved payment proof of ${proof.currency} ${proof.amount} for user ${proof.userName} via ${proof.paymentMethod}`
    );
  };

  const rejectPaymentProof = (proofId: string, reason?: string) => {
    setPaymentProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: 'REJECTED' as const,
              rejectionReason: reason || 'Payment screenshot unclear or transaction not found.',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || 'Administrator',
            }
          : p
      )
    );

    // Sync to Prisma Database
    fetch('/api/payments/proofs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: proofId,
        status: 'REJECTED',
        rejectionReason: reason || 'Payment screenshot unclear or transaction not found.',
        reviewerName: currentUser?.name || 'Administrator',
      }),
    }).catch((err) => console.warn('Prisma reject proof sync notice:', err));

    logAdminAction('REJECTED_PAYMENT_PROOF', 'SUBSCRIPTION', proofId, `Rejected payment proof: ${reason || 'Unverified'}`);
  };

  const addReceivingAccount = (accountData: Omit<ReceivingAccount, 'id' | 'createdAt'>) => {
    const newAcc: ReceivingAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReceivingAccounts((prev) => [newAcc, ...prev]);

    // Sync to Prisma Database
    fetch('/api/receiving-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAcc),
    }).catch((err) => console.warn('Prisma add account sync notice:', err));

    logAdminAction('ADD_RECEIVING_ACCOUNT', 'SYSTEM', newAcc.id, `Added receiving account: ${newAcc.bankName} - ${newAcc.accountNumber}`);
  };

  const updateReceivingAccount = (id: string, data: Partial<ReceivingAccount>) => {
    setReceivingAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc))
    );
    logAdminAction('UPDATE_RECEIVING_ACCOUNT', 'SYSTEM', id, `Updated receiving account details: ${id}`);
  };

  const deleteReceivingAccount = (id: string) => {
    setReceivingAccounts((prev) => prev.filter((acc) => acc.id !== id));

    // Sync to Prisma Database
    fetch(`/api/receiving-accounts?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Prisma delete account sync notice:', err));

    logAdminAction('DELETE_RECEIVING_ACCOUNT', 'SYSTEM', id, `Deleted receiving account: ${id}`);
  };

  const toggleReceivingAccountStatus = (id: string) => {
    setReceivingAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, isActive: !acc.isActive, updatedAt: new Date().toISOString() } : acc
      )
    );
  };

  const logAdminAction = (action: string, targetType: any, targetId: string, details: string) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Administrator',
      action,
      targetType,
      targetId,
      ipAddress: '192.168.1.100',
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        users,
        profiles,
        interests,
        favorites,
        conversations,
        messages,
        notifications,
        plans,
        invoices,
        verifications,
        reports,
        tickets,
        coupons,
        cms,
        auditLogs,
        settings,
        paymentProofs,
        receivingAccounts,
        login,
        register,
        logout,
        switchUser,
        updateCurrentUserProfile,
        updateUserSubscription,
        canViewContactDetails,
        submitPaymentProof,
        approvePaymentProof,
        rejectPaymentProof,
        processInstantPayment,
        addReceivingAccount,
        updateReceivingAccount,
        deleteReceivingAccount,
        toggleReceivingAccountStatus,
        connectionQuota,
        canAccessProfile,
        sendInterest,
        acceptInterest,
        declineInterest,
        cancelInterest,
        toggleFavorite,
        isFavorited,
        sendMessage,
        startOrGetConversation,
        markNotificationRead,
        markAllNotificationsRead,
        submitVerification,
        approveVerification,
        rejectVerification,
        updateUserStatus,
        verifyUserBadge,
        submitReport,
        resolveReport,
        dismissReport,
        updateSettings,
        updatePlan,
        addPlan,
        applyCoupon,
        logAdminAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
