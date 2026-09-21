'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  ExtraConnectionPack,
  Consultant,
  ConsultantRecommendation,
  ConsultantNote,
  BlockedUser,
  FamilyMemberInvitation,
  TaxSettings,
  SupportCategory,
  SupportTicketStatus,
  ProfileApprovalStatus,
  ConnectionTransaction,
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
  EXTRA_CONNECTION_PACKS,
  INITIAL_CONSULTANTS,
  INITIAL_CONNECTION_TRANSACTIONS,
} from './data-store';
import { calculateProfileCompletion } from './utils';
import { toast } from 'sonner';

export interface ConnectionQuotaInfo {
  used: number;
  total: number;
  remaining: number;
  usagePercentage: number;
  isReached: boolean;
  alertLevel: 'NORMAL' | 'WARNING_70' | 'WARNING_80' | 'WARNING_90' | 'LOCKED_100';
  planName: string;
}

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
  extraPacks: ExtraConnectionPack[];
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
  connectionTransactions: ConnectionTransaction[];
  consultants: Consultant[];
  consultantRecommendations: ConsultantRecommendation[];
  consultantNotes: ConsultantNote[];
  blockedUsers: BlockedUser[];
  familyInvitations: FamilyMemberInvitation[];

  // Connection Credits & Contact Unlock (Sections 2, 3, 4, 82, 83)
  connectionQuota: ConnectionQuotaInfo;
  unlockContactDetails: (targetProfileId: string) => { success: boolean; message: string; alreadyUnlocked?: boolean };
  isContactUnlocked: (targetProfileId: string) => boolean;
  refundConnectionCredit: (userId: string, targetProfileId: string, reason: string) => boolean;
  addExtraConnections: (userId: string, count: number) => void;
  canViewContactDetails: (targetProfileId: string) => boolean;
  canAccessProfile: (targetProfileId: string) => boolean;

  // Authentication & Session
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (userData: Partial<User> & { password?: string }, profileData: Partial<MatrimonialProfile>) => Promise<{ success: boolean; error?: string; redirectUrl?: string; user?: User }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<MatrimonialProfile>) => void;
  updateUserSubscription: (tier: SubscriptionTier, durationDays?: number) => void;
  verifyWhatsAppCode: (code: string) => { success: boolean; message: string };

  // Connections (Interests & Requests)
  sendInterest: (targetProfileId: string, message?: string) => { success: boolean; message: string };
  acceptInterest: (interestId: string) => void;
  declineInterest: (interestId: string) => void;
  cancelInterest: (interestId: string) => void;

  // Favorites (Favorite Connections)
  toggleFavorite: (targetProfileId: string) => boolean;
  isFavorited: (targetProfileId: string) => boolean;

  // Blocks
  blockUser: (targetProfileId: string, reason?: string) => void;
  unblockUser: (targetProfileId: string) => void;
  isUserBlocked: (targetProfileId: string) => boolean;

  // Consultant Concierge (Sections 24-27)
  assignConsultant: (userId: string, consultantId: string) => void;
  addConsultant: (consultant: Consultant) => void;
  deleteConsultant: (consultantId: string) => void;
  addConsultantRecommendation: (userId: string, targetProfileId: string, note: string) => void;
  addConsultantNote: (userId: string, consultantId: string, note: string, isPrivate?: boolean) => void;

  // Messages
  sendMessage: (conversationId: string, text: string) => void;
  startOrGetConversation: (recipientUserId: string) => string;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ID Verification
  submitVerification: (documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'CNIC', docUrl: string, selfieUrl: string) => void;
  approveVerification: (verifId: string, notes?: string) => void;
  rejectVerification: (verifId: string, notes?: string) => void;

  // Payment Proofs & Accounts
  submitPaymentProof: (data: Omit<PaymentProof, 'id' | 'status' | 'submittedAt'>) => void;
  approvePaymentProof: (proofId: string) => void;
  rejectPaymentProof: (proofId: string, reason?: string) => void;
  processInstantPayment: (params: {
    planSlug: string;
    planName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    connectionsCount?: number;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
    cardLast4?: string;
  }) => Promise<{ success: boolean; invoice: Invoice }>;
  addReceivingAccount: (account: Omit<ReceivingAccount, 'id' | 'createdAt'>) => void;
  updateReceivingAccount: (id: string, data: Partial<ReceivingAccount>) => void;
  deleteReceivingAccount: (id: string) => void;
  toggleReceivingAccountStatus: (id: string) => void;
  refreshDatabase: () => Promise<void>;

  // Helpdesk & Tickets (Sections 46-49)
  createSupportTicket: (ticketData: Partial<SupportTicket> & { message?: string }) => SupportTicket;
  replySupportTicket: (ticketId: string, text: string, sender?: 'USER' | 'AGENT', attachmentUrl?: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicketStatus) => void;

  // Family Member Access (Section 28)
  inviteFamilyMember: (data: Omit<FamilyMemberInvitation, 'id' | 'userId' | 'createdAt' | 'status'>) => void;

  // Moderation & Admin
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => void;
  updateProfileApproval: (profileId: string, status: ProfileApprovalStatus, notes?: string) => void;
  verifyUserBadge: (userId: string, isVerified: boolean) => void;
  submitReport: (reportedUserId: string, category: any, description: string) => void;
  resolveReport: (reportId: string, actionTaken: string) => void;
  dismissReport: (reportId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  updateTaxSettings: (tax: TaxSettings) => void;
  updatePlan: (planId: string, data: Partial<SubscriptionPlan>) => void;
  addPlan: (plan: SubscriptionPlan) => void;
  applyCoupon: (code: string) => { valid: boolean; discountPercent?: number; fixedDiscount?: number; message: string };
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (couponId: string) => void;
  updateCMS: (data: Partial<CMSContent>) => void;
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
  const [extraPacks, setExtraPacks] = useState<ExtraConnectionPack[]>(EXTRA_CONNECTION_PACKS);
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
  const [connectionTransactions, setConnectionTransactions] = useState<ConnectionTransaction[]>(INITIAL_CONNECTION_TRANSACTIONS);
  const [consultants, setConsultants] = useState<Consultant[]>(INITIAL_CONSULTANTS);
  const [consultantRecommendations, setConsultantRecommendations] = useState<ConsultantRecommendation[]>([]);
  const [consultantNotes, setConsultantNotes] = useState<ConsultantNote[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [familyInvitations, setFamilyInvitations] = useState<FamilyMemberInvitation[]>([]);

  // Active authenticated user state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<MatrimonialProfile | null>(null);

  const refreshDatabase = useCallback(async () => {
    try {
      const [userRes, profRes, intRes, proofRes, invRes, accRes, verifRes, repRes] = await Promise.allSettled([
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/profiles', { cache: 'no-store' }),
        fetch('/api/interests', { cache: 'no-store' }),
        fetch('/api/payments/proofs', { cache: 'no-store' }),
        fetch('/api/invoices', { cache: 'no-store' }),
        fetch('/api/receiving-accounts', { cache: 'no-store' }),
        fetch('/api/verifications', { cache: 'no-store' }),
        fetch('/api/reports', { cache: 'no-store' }),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value.ok) {
        const uData = await userRes.value.json();
        if (Array.isArray(uData.data)) {
          setUsers(uData.data);
          setCurrentUser((prev) => {
            if (!prev) return prev;
            const fresh = uData.data.find((u: any) => u.id === prev.id || u.email?.toLowerCase() === prev.email?.toLowerCase());
            return fresh ? { ...prev, ...fresh } : prev;
          });
        }
      }
      if (profRes.status === 'fulfilled' && profRes.value.ok) {
        const profData = await profRes.value.json();
        if (Array.isArray(profData.data)) setProfiles(profData.data);
      }
      if (intRes.status === 'fulfilled' && intRes.value.ok) {
        const intData = await intRes.value.json();
        if (Array.isArray(intData.data)) setInterests(intData.data);
      }
      if (proofRes.status === 'fulfilled' && proofRes.value.ok) {
        const pData = await proofRes.value.json();
        if (Array.isArray(pData.data)) setPaymentProofs(pData.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value.ok) {
        const invData = await invRes.value.json();
        if (Array.isArray(invData.data)) setInvoices(invData.data);
      }
      if (accRes.status === 'fulfilled' && accRes.value.ok) {
        const accData = await accRes.value.json();
        if (Array.isArray(accData.data)) setReceivingAccounts(accData.data);
      }
      if (verifRes.status === 'fulfilled' && verifRes.value.ok) {
        const vData = await verifRes.value.json();
        if (Array.isArray(vData.data)) setVerifications(vData.data);
      }
      if (repRes.status === 'fulfilled' && repRes.value.ok) {
        const rData = await repRes.value.json();
        if (Array.isArray(rData.data)) setReports(rData.data);
      }
    } catch (apiSyncErr) {
      console.warn('Live database sync notice:', apiSyncErr);
    }
  }, []);

  // Sync session on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        const savedUsersStr = typeof window !== 'undefined' ? localStorage.getItem('vrm_live_users') : null;
        let liveUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;

        if (typeof window !== 'undefined') {
          const savedTx = localStorage.getItem('vrm_live_transactions');
          if (savedTx) setConnectionTransactions(JSON.parse(savedTx));

          const savedBlocks = localStorage.getItem('vrm_live_blocked_users');
          if (savedBlocks) setBlockedUsers(JSON.parse(savedBlocks));

          const savedTickets = localStorage.getItem('vrm_live_tickets');
          if (savedTickets) setTickets(JSON.parse(savedTickets));

          const savedConsultants = localStorage.getItem('vrm_live_consultants');
          if (savedConsultants) setConsultants(JSON.parse(savedConsultants));

          const savedProofs = localStorage.getItem('vrm_live_payment_proofs');
          if (savedProofs) setPaymentProofs(JSON.parse(savedProofs));
        }

        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            setCurrentUser(data.user);
            setCurrentUserId(data.user.id);
            if (data.user.profile) {
              setCurrentProfile(data.user.profile);
            } else {
              const prof = INITIAL_PROFILES.find((p) => p.userId === data.user.id || p.id === data.user.profileId) || INITIAL_PROFILES[0];
              setCurrentProfile(prof);
            }
            return;
          }
        }

        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('vrm_active_user_id') : null;
        if (storedUserId && isMounted) {
          const matched = liveUsers.find((u) => u.id === storedUserId);
          if (matched) {
            setCurrentUserId(matched.id);
            setCurrentUser(matched);
            const prof = INITIAL_PROFILES.find((p) => p.userId === matched.id || p.id === matched.profileId) || INITIAL_PROFILES[0];
            setCurrentProfile(prof);
            return;
          }
        }

        // Fallback default: Amna Khan (VIP User)
        if (isMounted) {
          const defaultUser = liveUsers.find((u) => u.email === 'amna.khan@gmail.com') || liveUsers[0];
          setCurrentUserId(defaultUser.id);
          setCurrentUser(defaultUser);
          const prof = INITIAL_PROFILES.find((p) => p.userId === defaultUser.id || p.id === defaultUser.profileId) || INITIAL_PROFILES[0];
          setCurrentProfile(prof);
        }
      } catch (err) {
        console.warn('Session load notice:', err);
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to localStorage for offline / quick reload continuity
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_transactions', JSON.stringify(connectionTransactions));
    }
  }, [connectionTransactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_blocked_users', JSON.stringify(blockedUsers));
    }
  }, [blockedUsers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_consultants', JSON.stringify(consultants));
    }
  }, [consultants]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vrm_live_payment_proofs', JSON.stringify(paymentProofs));
    }
  }, [paymentProofs]);

  // Privileged check
  const isPrivilegedUser =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'MODERATOR' ||
    currentUser?.email === 'ladi02893@gmail.com';

  // Connection Quota Engine (Sections 2, 3, 4, 89)
  const totalConn = isPrivilegedUser
    ? 99999
    : currentUser?.totalConnections !== undefined
    ? currentUser.totalConnections
    : currentUser?.subscriptionTier === 'PREMIUM_PLUS' || currentUser?.subscriptionTier === 'VIP'
    ? 300
    : currentUser?.subscriptionTier === 'PREMIUM'
    ? 100
    : 30;

  const usedConn = isPrivilegedUser ? 0 : currentUser?.usedConnections ?? 0;
  const remainingConn = isPrivilegedUser
    ? 99999
    : currentUser?.remainingConnections !== undefined
    ? currentUser.remainingConnections
    : Math.max(0, totalConn - usedConn);

  const usagePercentage = totalConn > 0 ? Math.min(100, Math.round((usedConn / totalConn) * 100)) : 0;
  const isLimitReached = !isPrivilegedUser && remainingConn <= 0;

  let alertLevel: 'NORMAL' | 'WARNING_70' | 'WARNING_80' | 'WARNING_90' | 'LOCKED_100' = 'NORMAL';
  if (usagePercentage >= 100 || remainingConn <= 0) {
    alertLevel = 'LOCKED_100';
  } else if (usagePercentage >= 90) {
    alertLevel = 'WARNING_90';
  } else if (usagePercentage >= 80) {
    alertLevel = 'WARNING_80';
  } else if (usagePercentage >= 70) {
    alertLevel = 'WARNING_70';
  }

  const connectionQuota: ConnectionQuotaInfo = {
    used: usedConn,
    total: totalConn,
    remaining: remainingConn,
    usagePercentage,
    alertLevel,
    isReached: isLimitReached,
    planName:
      currentUser?.subscriptionTier === 'PREMIUM_PLUS' || currentUser?.subscriptionTier === 'VIP'
        ? 'VIP Royal Package (300 Connections)'
        : currentUser?.subscriptionTier === 'PREMIUM'
        ? 'Premium Package (100 Connections)'
        : 'Basic Package (30 Connections)',
  };

  // Check if contact details for target profile are already unlocked
  const isContactUnlocked = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    if (isPrivilegedUser) return true;
    if (currentProfile?.id === targetProfileId) return true;

    // Check mutual accepted interest
    const hasAccepted = interests.some(
      (i) =>
        i.status === 'ACCEPTED' &&
        ((i.senderId === currentUser.id && (i.receiverProfileId === targetProfileId || i.receiverId === targetProfileId)) ||
          (i.receiverId === currentUser.id && (i.senderProfileId === targetProfileId || i.senderId === targetProfileId)))
    );
    if (hasAccepted) return true;

    // Check unique connection transaction
    return connectionTransactions.some(
      (tx) =>
        tx.userId === currentUser.id &&
        (tx.connectedProfileId === targetProfileId || tx.connectedUserId === targetProfileId)
    );
  };

  const canViewContactDetails = (targetProfileId: string): boolean => {
    return isContactUnlocked(targetProfileId);
  };

  const canAccessProfile = (targetProfileId: string): boolean => {
    return true; // Profiles are always browsable without deduction (Section 4)
  };

  // Connection Deduction Logic (Section 4 & Section 82)
  const unlockContactDetails = (targetProfileId: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to unlock candidate contact details.' };
    }
    if (isPrivilegedUser) {
      return { success: true, message: 'Administrative access active.', alreadyUnlocked: true };
    }
    if (currentProfile?.id === targetProfileId) {
      return { success: true, message: 'This is your own profile.', alreadyUnlocked: true };
    }
    if (isContactUnlocked(targetProfileId)) {
      return { success: true, message: 'Contact details already unlocked.', alreadyUnlocked: true };
    }
    if (connectionQuota.remaining <= 0) {
      return {
        success: false,
        message: 'Connection limit reached (0 remaining). Please purchase additional connections or upgrade your package to continue.',
      };
    }

    const target = profiles.find((p) => p.id === targetProfileId) || INITIAL_PROFILES.find((p) => p.id === targetProfileId);
    if (!target) {
      return { success: false, message: 'Candidate dossier not found.' };
    }

    const newUsed = connectionQuota.used + 1;
    const newRemaining = Math.max(0, connectionQuota.remaining - 1);

    const updatedUser: User = {
      ...currentUser,
      usedConnections: newUsed,
      remainingConnections: newRemaining,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Background DB sync to InsForge
    try {
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          usedConnections: newUsed,
          remainingConnections: newRemaining,
        }),
      }).catch(() => {});
    } catch (e) {}

    const newTx: ConnectionTransaction = {
      id: `ctx-${Date.now()}`,
      userId: currentUser.id,
      userProfileIdCode: currentUser.profileIdCode || currentProfile?.profileIdCode || 'VRM-000000',
      connectedUserId: target.userId,
      connectedProfileId: target.id,
      connectedProfileIdCode: target.profileIdCode || 'VRM-TARGET',
      creditsUsed: 1,
      reason: 'Contact Details Unlocked',
      date: new Date().toISOString(),
    };
    setConnectionTransactions((prev) => [newTx, ...prev]);

    // Toast warnings based on usage milestones (Section 3 & 45)
    if (newRemaining === 0) {
      toast.error('You have reached your connection limit (100% used). New contact unlocks are now locked.');
    } else if (newRemaining <= Math.round(totalConn * 0.1)) {
      toast.warning(`Strong Warning: Only ${newRemaining} connections remaining.`);
    } else if (newRemaining <= Math.round(totalConn * 0.2)) {
      toast.warning(`Warning: You have used ${newUsed} of your ${totalConn} connections.`);
    } else if (newRemaining <= Math.round(totalConn * 0.3)) {
      toast.info(`70% Connection Usage: ${newRemaining} connections remaining.`);
    } else {
      toast.success('Contact details unlocked successfully. 1 connection credit deducted.');
    }

    return { success: true, message: 'Contact details unlocked successfully!' };
  };

  // Connection Refund (Section 83)
  const refundConnectionCredit = (userId: string, targetProfileId: string, reason: string) => {
    let refundedRemaining = 0;
    let refundedUsed = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRemaining = (u.remainingConnections || 0) + 1;
          const newUsed = Math.max(0, (u.usedConnections || 1) - 1);
          refundedRemaining = newRemaining;
          refundedUsed = newUsed;
          return { ...u, remainingConnections: newRemaining, usedConnections: newUsed };
        }
        return u;
      })
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              remainingConnections: (prev.remainingConnections || 0) + 1,
              usedConnections: Math.max(0, (prev.usedConnections || 1) - 1),
            }
          : null
      );
    }
    setConnectionTransactions((prev) =>
      prev.filter((tx) => !(tx.userId === userId && tx.connectedProfileId === targetProfileId))
    );

    // Sync to DB
    try {
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          remainingConnections: refundedRemaining,
          usedConnections: refundedUsed,
        }),
      }).catch(() => {});
    } catch (e) {}

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      type: 'SYSTEM',
      title: 'Connection Credit Refunded',
      description: `1 Connection credit has been restored to your account. Reason: ${reason}`,
      linkUrl: '/dashboard/connections',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    logAdminAction('REFUND_CONNECTION_CREDIT', 'USER', userId, `Refunded 1 connection credit for profile ${targetProfileId}. Reason: ${reason}`);
    toast.success('Connection credit refunded successfully.');
    return true;
  };

  // Buy Additional Connections (Section 38)
  const addExtraConnections = (userId: string, count: number) => {
    let finalTotal = 0;
    let finalRemaining = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newTotal = (u.totalConnections || 0) + count;
          const newRemaining = (u.remainingConnections || 0) + count;
          finalTotal = newTotal;
          finalRemaining = newRemaining;
          return { ...u, totalConnections: newTotal, remainingConnections: newRemaining };
        }
        return u;
      })
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              totalConnections: (prev.totalConnections || 0) + count,
              remainingConnections: (prev.remainingConnections || 0) + count,
            }
          : null
      );
    }

    // Sync to DB
    try {
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          totalConnections: finalTotal,
          remainingConnections: finalRemaining,
        }),
      }).catch(() => {});
    } catch (e) {}

    toast.success(`Added ${count} connection credits to account!`);
    logAdminAction('ADD_EXTRA_CONNECTIONS', 'USER', userId, `Added ${count} connection credits to user balance.`);
  };

  // WhatsApp OTP Verification (Section 5)
  const verifyWhatsAppCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) {
      return { success: false, message: 'Invalid verification code. Please enter the complete code sent to your WhatsApp.' };
    }
    if (currentUser) {
      const updated = { ...currentUser, isWhatsappVerified: true };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
    if (currentProfile) {
      const updatedProf = { ...currentProfile, isWhatsappVerified: true };
      setCurrentProfile(updatedProf);
      setProfiles((prev) => prev.map((p) => (p.id === currentProfile.id ? updatedProf : p)));
    }
    return { success: true, message: 'Your WhatsApp number has been verified successfully.' };
  };

  // Block & Unblock User (Section 22)
  const blockUser = (targetProfileId: string, reason?: string) => {
    if (!currentUser) return;
    const target = profiles.find((p) => p.id === targetProfileId) || INITIAL_PROFILES.find((p) => p.id === targetProfileId);
    const newBlock: BlockedUser = {
      id: `block-${Date.now()}`,
      userId: currentUser.id,
      blockedUserId: target?.userId || targetProfileId,
      blockedProfileId: targetProfileId,
      blockedAt: new Date().toISOString(),
      reason: reason || 'User blocked by member',
    };
    setBlockedUsers((prev) => [newBlock, ...prev.filter((b) => b.blockedProfileId !== targetProfileId)]);
    toast.info('User has been blocked.');
  };

  const unblockUser = (targetProfileId: string) => {
    if (!currentUser) return;
    setBlockedUsers((prev) => prev.filter((b) => !(b.userId === currentUser.id && b.blockedProfileId === targetProfileId)));
    toast.success('User unblocked.');
  };

  const isUserBlocked = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    return blockedUsers.some((b) => b.userId === currentUser.id && b.blockedProfileId === targetProfileId);
  };

  // Dedicated Senior Consultant (Sections 24-27)
  const assignConsultant = (userId: string, consultantId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, assignedConsultantId: consultantId } : u)));
    setProfiles((prev) => prev.map((p) => (p.userId === userId ? { ...p, assignedConsultantId: consultantId } : p)));
    setConsultants((prev) =>
      prev.map((c) => {
        if (c.id === consultantId) {
          return { ...c, assignedClientIds: Array.from(new Set([...c.assignedClientIds, userId])) };
        }
        return { ...c, assignedClientIds: c.assignedClientIds.filter((id) => id !== userId) };
      })
    );
    toast.success('Senior Consultant assigned successfully!');
    logAdminAction('ASSIGN_CONSULTANT', 'CONSULTANT', consultantId, `Assigned consultant ${consultantId} to client ${userId}`);
  };

  const addConsultant = (consultantData: Consultant) => {
    setConsultants((prev) => [consultantData, ...prev]);
    toast.success(`Senior Consultant ${consultantData.name} registered.`);
    logAdminAction('CREATE_CONSULTANT', 'CONSULTANT', consultantData.id, `Created consultant ${consultantData.name}`);
  };

  const deleteConsultant = (consultantId: string) => {
    setConsultants((prev) => prev.filter((c) => c.id !== consultantId));
    toast.info('Consultant removed from registry.');
    logAdminAction('DELETE_CONSULTANT', 'CONSULTANT', consultantId, `Deleted consultant ${consultantId}`);
  };

  const addConsultantRecommendation = (userId: string, targetProfileId: string, note: string) => {
    const consultant = consultants.find((c) => c.assignedClientIds.includes(userId)) || consultants[0];
    const newRec: ConsultantRecommendation = {
      id: `crec-${Date.now()}`,
      consultantId: consultant?.id || 'consultant-1',
      consultantName: consultant?.name || 'Senior Family Consultant',
      userId,
      targetProfileId,
      note: note || 'Recommended based on family background and preferences.',
      recommendedAt: new Date().toISOString(),
    };
    setConsultantRecommendations((prev) => [newRec, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      type: 'CONSULTANT_RECOMMENDATION',
      title: 'New Consultant Recommendation',
      description: `${consultant?.name || 'Senior Consultant'} handpicked a matching candidate for your family.`,
      linkUrl: '/dashboard/connections',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    toast.success('Recommendation sent to client.');
  };

  const addConsultantNote = (userId: string, consultantId: string, note: string, isPrivate: boolean = true) => {
    const newNote: ConsultantNote = {
      id: `cnote-${Date.now()}`,
      consultantId,
      consultantName: consultants.find((c) => c.id === consultantId)?.name || 'Consultant',
      userId,
      note,
      isPrivate,
      createdAt: new Date().toISOString(),
    };
    setConsultantNotes((prev) => [newNote, ...prev]);
    toast.success('Internal consultant note saved.');
  };

  // Support Helpdesk (Sections 46-49)
  const createSupportTicket = (data: Partial<SupportTicket> & { message?: string }): SupportTicket => {
    const ticketCode = `SUP-${String(tickets.length + 124).padStart(6, '0')}`;
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketCode,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Member',
      userEmail: currentUser?.email || 'member@example.com',
      userProfileIdCode: currentUser?.profileIdCode || currentProfile?.profileIdCode || 'VRM-000000',
      subject: data.subject || 'General Matrimonial Inquiry',
      category: data.category || 'GENERAL',
      relatedProfileId: data.relatedProfileId,
      priority: data.priority || 'NORMAL',
      status: 'OPEN',
      attachmentUrl: data.attachmentUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-t-${Date.now()}`,
          sender: 'USER',
          senderName: currentUser?.name || 'Member',
          text: data.message || data.subject || 'Ticket created',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
    toast.success(`Support ticket ${ticketCode} created successfully.`);
    return newTicket;
  };

  const replySupportTicket = (ticketId: string, text: string, sender: 'USER' | 'AGENT' = 'USER', attachmentUrl?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg-reply-${Date.now()}`,
            sender,
            senderName: sender === 'AGENT' ? (currentUser?.name || 'VIP Support Desk') : (currentUser?.name || 'Member'),
            text,
            attachmentUrl,
            timestamp: new Date().toISOString(),
          };
          return {
            ...t,
            status: sender === 'AGENT' ? ('WAITING_FOR_USER' as const) : ('IN_PROGRESS' as const),
            updatedAt: new Date().toISOString(),
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );
    toast.success('Message sent to ticket.');
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    toast.success(`Ticket status set to ${status}`);
  };

  // Profile Approval Workflow (Section 12)
  const updateProfileApproval = (profileId: string, status: ProfileApprovalStatus, notes?: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, approvalStatus: status } : p))
    );
    const prof = profiles.find((p) => p.id === profileId);
    if (prof) {
      setUsers((prev) =>
        prev.map((u) => (u.id === prof.userId ? { ...u, profileApprovalStatus: status } : u))
      );
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: prof.userId,
        type: status === 'APPROVED' ? 'PROFILE_APPROVED' : 'PROFILE_CHANGES_REQUESTED',
        title: status === 'APPROVED' ? 'Profile Approved! 🎉' : 'Profile Status Update',
        description:
          status === 'APPROVED'
            ? 'Your profile is now live in the VIP Royal Matchmaking directory.'
            : `Status changed to ${status}. ${notes || ''}`,
        linkUrl: '/dashboard/profile',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
    toast.success(`Profile approval updated: ${status}`);
    logAdminAction('UPDATE_PROFILE_APPROVAL', 'PROFILE', profileId, `Status: ${status}. Notes: ${notes || ''}`);
  };

  // Family Member Access (Section 28)
  const inviteFamilyMember = (data: Omit<FamilyMemberInvitation, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;
    const newInv: FamilyMemberInvitation = {
      ...data,
      id: `finv-${Date.now()}`,
      userId: currentUser.id,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setFamilyInvitations((prev) => [newInv, ...prev]);
    toast.success(`Invitation sent to ${data.familyMemberName} (${data.relationship})!`);
  };

  // Tax Settings (Section 35)
  const updateTaxSettings = (tax: TaxSettings) => {
    setSettings((prev) => ({ ...prev, tax }));
    toast.success('Tax configuration saved.');
    logAdminAction('UPDATE_TAX_SETTINGS', 'SETTING', 'TAX', `Tax enabled: ${tax.taxEnabled}, ${tax.taxPercentage}%`);
  };

  // Auth Operations
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
        const prof =
          profiles.find((p) => p.userId === data.user.id || p.id === data.user.profileId) ||
          INITIAL_PROFILES.find((p) => p.userId === data.user.id || p.id === data.user.profileId) ||
          INITIAL_PROFILES[0];
        setCurrentProfile(prof);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vrm_active_user_id', data.user.id);
        }
        return { success: true, redirectUrl: data.redirectUrl || '/dashboard' };
      }
    } catch (err) {
      console.warn('Network login fallback:', err);
    }

    // Local in-memory fallback
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      setCurrentUserId(existing.id);
      setCurrentUser(existing);
      const prof =
        profiles.find((p) => p.userId === existing.id || p.id === existing.profileId) ||
        INITIAL_PROFILES.find((p) => p.userId === existing.id || p.id === existing.profileId) ||
        INITIAL_PROFILES[0];
      setCurrentProfile(prof);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vrm_active_user_id', existing.id);
      }
      const isPrivileged =
        existing.role === 'SUPER_ADMIN' ||
        existing.role === 'ADMIN' ||
        existing.role === 'MODERATOR' ||
        existing.email.toLowerCase() === 'ladi02893@gmail.com';
      return { success: true, redirectUrl: isPrivileged ? '/admin' : '/dashboard' };
    }

    return { success: false, error: 'Invalid email or password.' };
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
      localStorage.removeItem('vrm_active_user_id');
    }
  };

  const register = async (
    userData: Partial<User> & { password?: string },
    profileData: Partial<MatrimonialProfile>
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string; user?: User }> => {
    try {
      const codeNum = String(users.length + 22).padStart(6, '0');
      const profileIdCode = `VRM-${codeNum}`;

      const tier = userData.subscriptionTier || 'BASIC';
      const initialTotal = userData.totalConnections ?? (tier === 'VIP' || tier === 'PREMIUM_PLUS' ? 300 : tier === 'PREMIUM' ? 100 : 30);

      const newUser: User = {
        id: userData.id || `user-${Date.now()}`,
        name: userData.name || profileData.fullName || 'Member',
        email: userData.email || '',
        phone: userData.phone || '',
        whatsappNumber: userData.whatsappNumber || userData.phone || '',
        profileIdCode,
        role: 'USER',
        subscriptionTier: tier,
        accountStatus: 'ACTIVE',
        profileApprovalStatus: settings.requireAdminProfileApproval ? 'PENDING_APPROVAL' : 'APPROVED',
        isVerified: false,
        isWhatsappVerified: userData.isWhatsappVerified || false,
        isEmailVerified: true,
        totalConnections: initialTotal,
        usedConnections: 0,
        remainingConnections: userData.remainingConnections ?? initialTotal,
        assignedConsultantId: tier === 'VIP' || tier === 'PREMIUM_PLUS' ? 'consultant-1' : undefined,
        createdAt: new Date().toISOString(),
        lastActive: 'Online',
      };

      const newProfile: MatrimonialProfile = {
        id: `profile-${Date.now()}`,
        userId: newUser.id,
        profileIdCode,
        fullName: newUser.name,
        displayName: newUser.name.split(' ')[0],
        gender: profileData.gender || 'FEMALE',
        dateOfBirth: profileData.dateOfBirth || '1998-01-01',
        age: profileData.age || 26,
        maritalStatus: profileData.maritalStatus || 'NEVER_MARRIED',
        religion: profileData.religion || 'ISLAM',
        motherTongue: profileData.motherTongue || 'Urdu',
        city: profileData.city || 'Lahore',
        state: profileData.state || 'Punjab',
        country: profileData.country || 'Pakistan',
        citizenship: profileData.citizenship || 'Pakistani',
        bioHeadline: profileData.bioHeadline || '',
        aboutMe: profileData.aboutMe || '',
        photos: profileData.photos || [],
        educationCareer: profileData.educationCareer as any,
        lifestyle: profileData.lifestyle as any,
        familyInfo: profileData.familyInfo as any,
        partnerPreferences: profileData.partnerPreferences as any,
        privacy: profileData.privacy || { photoVisibility: 'ALL', contactVisibility: 'ONLY_ACCEPTED_INTERESTS', profileVisibility: 'PUBLIC' },
        completionPercentage: 85,
        isFeatured: false,
        isBoosted: false,
        approvalStatus: settings.requireAdminProfileApproval ? 'PENDING_APPROVAL' : 'APPROVED',
        verificationBadge: 'UNVERIFIED',
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
      setProfiles((prev) => [newProfile, ...prev]);
      setCurrentUser(newUser);
      setCurrentProfile(newProfile);
      setCurrentUserId(newUser.id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('vrm_active_user_id', newUser.id);
      }

      return { success: true, redirectUrl: '/dashboard', user: newUser };
    } catch (err: any) {
      return { success: false, error: 'Registration failed.' };
    }
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
        localStorage.setItem('vrm_active_user_id', found.id);
      }
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
    toast.success('Profile dossier updated.');
  };

  const updateUserSubscription = (tier: SubscriptionTier, durationDays: number = 365) => {
    if (!currentUser) return;
    const connectionsToAdd = tier === 'PREMIUM_PLUS' || tier === 'VIP' ? 300 : tier === 'PREMIUM' ? 100 : 30;
    const updated: User = {
      ...currentUser,
      subscriptionTier: tier,
      totalConnections: connectionsToAdd,
      remainingConnections: connectionsToAdd,
      usedConnections: 0,
      accountStatus: 'ACTIVE',
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    toast.success(`Subscription updated to ${tier}. ${connectionsToAdd} connections available.`);
  };

  // Interests
  const sendInterest = (targetProfileId: string, message?: string) => {
    if (!currentUser) return { success: false, message: 'Please log in to express interest.' };

    const resolvedCurrentProfile =
      currentProfile ||
      profiles.find((p) => p.userId === currentUser.id || p.id === currentUser.profileId) ||
      INITIAL_PROFILES[0];

    const target = profiles.find((p) => p.id === targetProfileId) || INITIAL_PROFILES.find((p) => p.id === targetProfileId);
    if (!target) return { success: false, message: 'Candidate profile not found.' };

    if (resolvedCurrentProfile && resolvedCurrentProfile.id === target.id) {
      return { success: false, message: 'You cannot send interest to your own profile.' };
    }

    const existing = interests.find(
      (i) =>
        (i.senderId === currentUser.id && i.receiverProfileId === targetProfileId) ||
        (resolvedCurrentProfile && i.senderProfileId === resolvedCurrentProfile.id && i.receiverProfileId === targetProfileId)
    );
    if (existing) {
      return { success: false, message: 'You have already sent an interest request to this member.' };
    }

    const newInterest: InterestRequest = {
      id: `int-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderPhoto: currentUser.avatarUrl || resolvedCurrentProfile?.photos?.[0]?.url,
      senderProfileId: resolvedCurrentProfile?.id || `profile-${currentUser.id}`,
      senderProfileIdCode: currentUser.profileIdCode || resolvedCurrentProfile?.profileIdCode,
      receiverId: target.userId,
      receiverName: target.fullName,
      receiverPhoto: target.photos?.[0]?.url,
      receiverProfileId: target.id,
      receiverProfileIdCode: target.profileIdCode,
      status: 'PENDING',
      message: message || `Assalam-o-Alaikum ${target.displayName}, our family would be honored to connect with you.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInterests((prev) => [newInterest, ...prev]);

    // Background sync to InsForge API
    try {
      fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderProfileId: resolvedCurrentProfile?.id || `profile-${currentUser.id}`,
          receiverId: target.userId,
          receiverProfileId: target.id,
          message: newInterest.message,
        }),
      }).catch(() => {});
    } catch (e) {}

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: target.userId,
      type: 'INTEREST',
      title: 'New Matrimonial Interest Received',
      description: `${currentUser.name} expressed interest in your profile dossier.`,
      linkUrl: '/dashboard/connections',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, message: 'Interest sent successfully! You will be notified once accepted.' };
  };

  const acceptInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.map((item) => (item.id === interestId ? { ...item, status: 'ACCEPTED', updatedAt: new Date().toISOString() } : item))
    );

    // Background sync to InsForge API
    try {
      fetch('/api/interests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: interestId,
          status: 'ACCEPTED',
        }),
      }).catch(() => {});
    } catch (e) {}

    const intReq = interests.find((i) => i.id === interestId);
    if (intReq) {
      startOrGetConversation(intReq.senderId);
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: intReq.senderId,
        type: 'INTEREST_ACCEPTED',
        title: 'Interest Accepted! 🎉',
        description: `${intReq.receiverName} accepted your connection interest. Direct contact details are now unlocked.`,
        linkUrl: '/dashboard/connections',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
    toast.success('Connection interest accepted! Mutual contacts unlocked.');
  };

  const declineInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.map((item) => (item.id === interestId ? { ...item, status: 'DECLINED', updatedAt: new Date().toISOString() } : item))
    );
    try {
      fetch('/api/interests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: interestId,
          status: 'DECLINED',
        }),
      }).catch(() => {});
    } catch (e) {}
    toast.info('Interest request declined.');
  };

  const cancelInterest = (interestId: string) => {
    setInterests((prev) => prev.filter((item) => item.id !== interestId));
    toast.info('Interest request cancelled.');
  };

  // Favorites (Favorite Connections - Section 19)
  const toggleFavorite = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    const existing = favorites.find((f) => f.userId === currentUser.id && f.targetProfileId === targetProfileId);
    if (existing) {
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      toast.info('Removed from Favorite Connections.');
      return false;
    } else {
      const target = profiles.find((p) => p.id === targetProfileId) || INITIAL_PROFILES.find((p) => p.id === targetProfileId);
      if (!target) return false;
      const newFav: FavoriteItem = {
        id: `fav-${Date.now()}`,
        userId: currentUser.id,
        targetProfileId,
        targetProfile: target,
        createdAt: new Date().toISOString(),
      };
      setFavorites((prev) => [newFav, ...prev]);
      toast.success('Added to Favorite Connections!');
      return true;
    }
  };

  const isFavorited = (targetProfileId: string): boolean => {
    if (!currentUser) return false;
    return favorites.some((f) => f.userId === currentUser.id && f.targetProfileId === targetProfileId);
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
      prev.map((c) => (c.id === conversationId ? { ...c, lastMessageText: text.trim(), lastMessageTime: 'Just now' } : c))
    );

    // Background sync to InsForge API
    try {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: currentUser.id,
          text: text.trim(),
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  const startOrGetConversation = (recipientUserId: string): string => {
    if (!currentUser) return '';
    const otherUser = users.find((u) => u.id === recipientUserId) || INITIAL_USERS.find((u) => u.id === recipientUserId);
    const existing = conversations.find(
      (c) =>
        (c.participantAId === currentUser.id && c.participantBId === recipientUserId) ||
        (c.participantAId === recipientUserId && c.participantBId === currentUser.id)
    );
    if (existing) return existing.id;

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantAId: currentUser.id,
      participantAName: currentUser.name,
      participantAPhoto: currentUser.avatarUrl,
      participantBId: recipientUserId,
      participantBName: otherUser?.name || 'Candidate',
      participantBPhoto: otherUser?.avatarUrl,
      lastMessageText: 'Conversation initiated',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      status: 'ACTIVE',
    };
    setConversations((prev) => [newConv, ...prev]);
    return newConvId;
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Identity Verification (Section 10)
  const submitVerification = (
    documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'CNIC',
    docUrl: string,
    selfieUrl: string
  ) => {
    if (!currentUser) return;
    const newReq: VerificationRequest = {
      id: `verif-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userProfileIdCode: currentUser.profileIdCode,
      documentType,
      documentFrontUrl: docUrl,
      selfieUrl,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      reviewerNotes: 'Submitted for Admin Identity Verification',
    };
    setVerifications((prev) => [newReq, ...prev]);
    toast.success('Identity documents submitted securely for Admin verification.');
  };

  const approveVerification = (verifId: string, notes?: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === verifId ? { ...v, status: 'APPROVED', reviewedAt: new Date().toISOString() } : v))
    );
    const verif = verifications.find((v) => v.id === verifId);
    if (verif) {
      verifyUserBadge(verif.userId, true);
    }
    toast.success('Document verified and verified badge issued.');
  };

  const rejectVerification = (verifId: string, notes?: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === verifId ? { ...v, status: 'REJECTED', reviewerNotes: notes, reviewedAt: new Date().toISOString() } : v))
    );
    toast.info('Verification rejected.');
  };

  // Payment Proof Flow (Sections 29-34)
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
      userId: data.userId || currentUser?.id || 'guest',
      userProfileIdCode: currentUser?.profileIdCode,
      userName: currentUser?.name || data.userName,
      planName: data.planName,
      amount: data.amount,
      currency: data.currency || 'PKR',
      status: 'PENDING',
      date: now,
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
      transactionId: data.transactionId,
      invoiceNumber: invoiceNum,
    };

    setPaymentProofs((prev) => [newProof, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: data.userId || currentUser?.id || '',
      title: 'Payment Proof Submitted',
      description: `Payment proof for ${data.planName} (TRX: ${data.transactionId}) submitted for admin approval.`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: now,
      linkUrl: '/dashboard/subscription',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const approvePaymentProof = (proofId: string) => {
    const proof = paymentProofs.find((p) => p.id === proofId);
    if (!proof) return;
    const now = new Date().toISOString();

    setPaymentProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? { ...p, status: 'VERIFIED', reviewedAt: now, reviewedBy: currentUser?.name || 'Super Admin' }
          : p
      )
    );

    const rawSlug = (proof.planSlug || '').toUpperCase();
    const rawName = (proof.planName || '').toUpperCase();
    const isExtraPack =
      rawSlug.startsWith('PACK') ||
      rawSlug.startsWith('EXTRA') ||
      rawSlug.includes('PACK_') ||
      rawSlug.includes('PACK-') ||
      rawName.includes('EXTRA') ||
      rawName.includes('BOOSTER') ||
      rawName.includes('TOP-UP');

    let connectionsToAdd = 30;
    let targetTier: SubscriptionTier = 'BASIC';

    if (isExtraPack) {
      if (rawSlug.includes('100') || rawName.includes('100')) connectionsToAdd = 100;
      else if (rawSlug.includes('50') || rawName.includes('50')) connectionsToAdd = 50;
      else if (rawSlug.includes('30') || rawName.includes('30')) connectionsToAdd = 30;
      else if (rawSlug.includes('10') || rawName.includes('10')) connectionsToAdd = 10;
      else connectionsToAdd = 10;
    } else if (rawSlug.includes('VIP') || rawSlug.includes('ROYAL') || rawSlug.includes('PLUS')) {
      targetTier = 'PREMIUM_PLUS';
      connectionsToAdd = 300;
    } else if (rawSlug.includes('PREMIUM')) {
      targetTier = 'PREMIUM';
      connectionsToAdd = 100;
    } else {
      targetTier = 'BASIC';
      connectionsToAdd = 30;
    }

    let updatedTotal = 0;
    let updatedRemaining = 0;
    let updatedTier: SubscriptionTier = targetTier;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === proof.userId || (proof.userEmail && u.email.toLowerCase() === proof.userEmail.toLowerCase())) {
          const currentTotal = u.totalConnections || 0;
          const currentRemaining = u.remainingConnections || 0;
          updatedTotal = currentTotal + connectionsToAdd;
          updatedRemaining = currentRemaining + connectionsToAdd;
          updatedTier = isExtraPack ? u.subscriptionTier : targetTier;

          return {
            ...u,
            subscriptionTier: updatedTier,
            totalConnections: updatedTotal,
            remainingConnections: updatedRemaining,
            isVerified: true,
            accountStatus: 'ACTIVE',
          };
        }
        return u;
      })
    );

    if (currentUser && (currentUser.id === proof.userId || (proof.userEmail && currentUser.email.toLowerCase() === proof.userEmail.toLowerCase()))) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              subscriptionTier: isExtraPack ? prev.subscriptionTier : targetTier,
              totalConnections: (prev.totalConnections || 0) + connectionsToAdd,
              remainingConnections: (prev.remainingConnections || 0) + connectionsToAdd,
              isVerified: true,
              accountStatus: 'ACTIVE',
            }
          : null
      );
    }

    // Sync user upgrade to InsForge DB
    try {
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: proof.userId,
          total_connections: updatedTotal,
          remaining_connections: updatedRemaining,
          subscription_tier: updatedTier,
        }),
      }).catch(() => {});
    } catch (e) {}

    // Mark invoice PAID
    setInvoices((prev) =>
      prev.map((inv) => (inv.userId === proof.userId && inv.status === 'PENDING' ? { ...inv, status: 'PAID' } : inv))
    );

    // Notification to user
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: proof.userId,
      title: '🎉 Payment Approved & Package Active!',
      description: `Your payment of ${proof.currency} ${proof.amount} has been approved. ${connectionsToAdd} Connections have been credited to your balance.`,
      type: 'PAYMENT_APPROVED',
      isRead: false,
      createdAt: now,
      linkUrl: '/dashboard/subscription',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAdminAction('APPROVE_PAYMENT', 'PAYMENT', proofId, `Approved payment of ${proof.amount} for ${proof.userName}. Added ${connectionsToAdd} connections.`);
    toast.success(`Payment approved! ${connectionsToAdd} connections credited to ${proof.userName}.`);
  };

  const rejectPaymentProof = (proofId: string, reason?: string) => {
    setPaymentProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: 'REJECTED',
              rejectionReason: reason || 'Receipt unreadable or funds not received.',
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || 'Administrator',
            }
          : p
      )
    );
    const proof = paymentProofs.find((p) => p.id === proofId);
    if (proof) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: proof.userId,
        type: 'PAYMENT_REJECTED',
        title: 'Payment Verification Unsuccessful',
        description: `Reason: ${reason || 'Receipt unreadable or transaction ID not found.'}`,
        linkUrl: '/dashboard/subscription',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
    toast.info('Payment proof marked as rejected.');
    logAdminAction('REJECT_PAYMENT', 'PAYMENT', proofId, `Rejected proof: ${reason || 'Unverified'}`);
  };

  const processInstantPayment = async (params: {
    planSlug: string;
    planName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    connectionsCount?: number;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
    cardLast4?: string;
  }): Promise<{ success: boolean; invoice: Invoice }> => {
    const rawSlug = (params.planSlug || '').toUpperCase();
    const rawName = (params.planName || '').toUpperCase();
    const isExtraPack =
      rawSlug.startsWith('PACK') ||
      rawSlug.startsWith('EXTRA') ||
      rawSlug.includes('PACK_') ||
      rawSlug.includes('PACK-') ||
      rawName.includes('EXTRA') ||
      rawName.includes('BOOSTER') ||
      rawName.includes('TOP-UP');

    let connectionsToAdd = params.connectionsCount || 30;
    if (isExtraPack) {
      if (!params.connectionsCount) {
        if (rawSlug.includes('100') || rawName.includes('100')) connectionsToAdd = 100;
        else if (rawSlug.includes('50') || rawName.includes('50')) connectionsToAdd = 50;
        else if (rawSlug.includes('30') || rawName.includes('30')) connectionsToAdd = 30;
        else if (rawSlug.includes('10') || rawName.includes('10')) connectionsToAdd = 10;
        else connectionsToAdd = 10;
      }
    } else {
      connectionsToAdd = rawSlug.includes('VIP') ? 300 : rawSlug.includes('PREMIUM') ? 100 : 30;
    }

    const targetTier: SubscriptionTier = isExtraPack
      ? (currentUser?.subscriptionTier || 'BASIC')
      : rawSlug.includes('VIP')
      ? 'PREMIUM_PLUS'
      : rawSlug.includes('PREMIUM')
      ? 'PREMIUM'
      : 'BASIC';

    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      userProfileIdCode: currentUser?.profileIdCode,
      userName: currentUser?.name || 'Member',
      planName: params.planName,
      amount: params.amount,
      currency: params.currency,
      status: 'PAID',
      date: new Date().toISOString(),
      paymentMethod: params.paymentMethod,
      invoiceNumber: invoiceNum,
    };

    if (currentUser) {
      const newTotal = (currentUser.totalConnections || 0) + connectionsToAdd;
      const newRemaining = (currentUser.remainingConnections || 0) + connectionsToAdd;

      const updated: User = {
        ...currentUser,
        subscriptionTier: targetTier,
        totalConnections: newTotal,
        remainingConnections: newRemaining,
        isVerified: true,
        accountStatus: 'ACTIVE',
      };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

      // Sync to InsForge DB
      try {
        fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentUser.id,
            total_connections: newTotal,
            remaining_connections: newRemaining,
            subscription_tier: targetTier,
          }),
        }).catch(() => {});
      } catch (e) {}
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    return { success: true, invoice: newInvoice };
  };

  const addReceivingAccount = (accountData: Omit<ReceivingAccount, 'id' | 'createdAt'>) => {
    const newAcc: ReceivingAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReceivingAccounts((prev) => [newAcc, ...prev]);
    toast.success('Bank receiving account added.');
  };

  const updateReceivingAccount = (id: string, data: Partial<ReceivingAccount>) => {
    setReceivingAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc)));
    toast.success('Receiving account updated.');
  };

  const deleteReceivingAccount = (id: string) => {
    setReceivingAccounts((prev) => prev.filter((acc) => acc.id !== id));
    toast.info('Receiving account removed.');
  };

  const toggleReceivingAccountStatus = (id: string) => {
    setReceivingAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isActive: !acc.isActive, updatedAt: new Date().toISOString() } : acc))
    );
  };

  // Moderation
  const updateUserStatus = (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u)));
    toast.info(`User status changed to ${status}`);
    logAdminAction('UPDATE_USER_STATUS', 'USER', userId, `Status set to ${status}`);
  };

  const verifyUserBadge = (userId: string, isVerified: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isVerified, isIdentityVerified: isVerified } : u)));
    setProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, verificationBadge: isVerified ? 'APPROVED' : 'UNVERIFIED', isIdentityVerified: isVerified } : p))
    );
    toast.success(isVerified ? 'Verification badge granted.' : 'Verification badge revoked.');
  };

  const submitReport = (reportedUserId: string, category: any, description: string) => {
    if (!currentUser) return;
    const target = users.find((u) => u.id === reportedUserId);
    const targetProfile = profiles.find((p) => p.userId === reportedUserId);
    const newReport: AbuseReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterProfileIdCode: currentUser.profileIdCode,
      reportedUserId,
      reportedUserName: target?.name || 'Member',
      reportedProfileId: targetProfile?.id || '',
      reportedProfileIdCode: targetProfile?.profileIdCode,
      category,
      description,
      status: 'OPEN',
      timestamp: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    toast.success('Report submitted confidentially to administration.');
  };

  const resolveReport = (reportId: string, actionTaken: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED', adminActionTaken: actionTaken } : r))
    );
    toast.success('Report marked as resolved.');
  };

  const dismissReport = (reportId: string) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'DISMISSED' } : r)));
    toast.info('Report dismissed.');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    toast.success('System settings updated.');
    logAdminAction('UPDATE_SETTINGS', 'SETTING', 'SYSTEM', 'Updated system configurations');
  };

  const updatePlan = (planId: string, data: Partial<SubscriptionPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...data } : p)));
    toast.success('Package updated.');
  };

  const addPlan = (plan: SubscriptionPlan) => {
    setPlans((prev) => [...prev, plan]);
    toast.success('Package created.');
  };

  const applyCoupon = (code: string) => {
    const c = coupons.find((cp) => cp.code.toUpperCase() === code.trim().toUpperCase() && cp.isActive);
    if (!c) return { valid: false, message: 'Invalid or expired promo code.' };
    return {
      valid: true,
      discountPercent: c.discountPercent,
      fixedDiscount: c.fixedDiscount,
      message: `Promo Code applied: ${c.discountPercent ? `${c.discountPercent}% OFF` : `Rs. ${c.fixedDiscount} OFF`}`,
    };
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    toast.success('Promo code created.');
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c)));
  };

  const updateCMS = (data: Partial<CMSContent>) => {
    setCms((prev) => ({ ...prev, ...data }));
    toast.success('Website CMS content updated and published!');
    logAdminAction('UPDATE_CMS', 'CMS', 'HOMEPAGE', 'Updated marketing & FAQ content');
  };

  const logAdminAction = (action: string, targetType: any, targetId: string, details: string) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Administrator',
      action,
      targetType,
      targetId,
      ipAddress: '127.0.0.1',
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
        extraPacks,
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
        connectionTransactions,
        consultants,
        consultantRecommendations,
        consultantNotes,
        blockedUsers,
        familyInvitations,
        connectionQuota,
        unlockContactDetails,
        isContactUnlocked,
        refundConnectionCredit,
        addExtraConnections,
        canViewContactDetails,
        canAccessProfile,
        login,
        register,
        logout,
        switchUser,
        updateCurrentUserProfile,
        updateUserSubscription,
        verifyWhatsAppCode,
        sendInterest,
        acceptInterest,
        declineInterest,
        cancelInterest,
        toggleFavorite,
        isFavorited,
        blockUser,
        unblockUser,
        isUserBlocked,
        assignConsultant,
        addConsultant,
        deleteConsultant,
        addConsultantRecommendation,
        addConsultantNote,
        sendMessage,
        startOrGetConversation,
        markNotificationRead,
        markAllNotificationsRead,
        submitVerification,
        approveVerification,
        rejectVerification,
        submitPaymentProof,
        approvePaymentProof,
        rejectPaymentProof,
        processInstantPayment,
        addReceivingAccount,
        updateReceivingAccount,
        deleteReceivingAccount,
        toggleReceivingAccountStatus,
        refreshDatabase,
        createSupportTicket,
        replySupportTicket,
        updateTicketStatus,
        updateProfileApproval,
        inviteFamilyMember,
        updateUserStatus,
        verifyUserBadge,
        submitReport,
        resolveReport,
        dismissReport,
        updateSettings,
        updateTaxSettings,
        updatePlan,
        addPlan,
        applyCoupon,
        addCoupon,
        toggleCouponStatus,
        updateCMS,
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
