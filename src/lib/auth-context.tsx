'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AbuseReport,
  AdminAuditLog,
  BlockedUser,
  ChatMessage,
  CMSContent,
  ConnectionTransaction,
  Consultant,
  ConsultantNote,
  ConsultantRecommendation,
  Conversation,
  Coupon,
  ExtraConnectionPack,
  FamilyMemberInvitation,
  FavoriteItem,
  InterestRequest,
  Invoice,
  MatrimonialProfile,
  NotificationItem,
  PaymentProof,
  ProfileApprovalStatus,
  ReceivingAccount,
  SubscriptionPlan,
  SubscriptionTier,
  SupportTicket,
  SupportTicketStatus,
  SystemSettings,
  TaxSettings,
  User,
  VerificationRequest,
} from './types';
import { PUBLIC_CMS, PUBLIC_EXTRA_PACKS, PUBLIC_PLANS, PUBLIC_SETTINGS } from './public-config';

type ApiRecord = Record<string, any>;

export interface ConnectionQuotaInfo {
  used: number;
  total: number;
  remaining: number;
  usagePercentage: number;
  isReached: boolean;
  alertLevel: 'NORMAL' | 'WARNING_70' | 'WARNING_80' | 'WARNING_90' | 'LOCKED_100';
  planName: string;
}

async function apiRequest<T = ApiRecord>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'The request could not be completed.');
  }
  return data as T;
}

function camelConversation(row: ApiRecord): Conversation {
  const participantA = Array.isArray(row.participantA) ? row.participantA[0] : row.participantA;
  const participantB = Array.isArray(row.participantB) ? row.participantB[0] : row.participantB;
  return {
    id: row.id,
    participantAId: row.participant_a_id,
    participantAName: participantA?.name ?? 'Member',
    participantAPhoto: participantA?.avatar_url ?? undefined,
    participantBId: row.participant_b_id,
    participantBName: participantB?.name ?? 'Member',
    participantBPhoto: participantB?.avatar_url ?? undefined,
    lastMessageText: row.last_message_text ?? '',
    lastMessageTime: row.last_message_time ?? '',
    unreadCount: 0,
    status: 'ACTIVE',
  };
}

function camelMessage(row: ApiRecord): ChatMessage {
  const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
  return {
    id: row.id,
    conversationId: row.conversationId ?? row.conversation_id,
    senderId: row.senderId ?? row.sender_id,
    senderName: sender?.name ?? 'Member',
    text: row.text,
    timestamp: row.createdAt ?? row.created_at,
    isRead: row.isRead ?? row.is_read ?? false,
  };
}

function useAuthValue() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<MatrimonialProfile | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [interests, setInterests] = useState<InterestRequest[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [plans] = useState<SubscriptionPlan[]>(PUBLIC_PLANS);
  const [extraPacks] = useState<ExtraConnectionPack[]>(PUBLIC_EXTRA_PACKS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons] = useState<Coupon[]>([]);
  const [cms] = useState<CMSContent>(PUBLIC_CMS);
  const [auditLogs] = useState<AdminAuditLog[]>([]);
  const [settings] = useState<SystemSettings>(PUBLIC_SETTINGS);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [receivingAccounts, setReceivingAccounts] = useState<ReceivingAccount[]>([]);
  const [connectionTransactions] = useState<ConnectionTransaction[]>([]);
  const [consultants] = useState<Consultant[]>([]);
  const [consultantRecommendations] = useState<ConsultantRecommendation[]>([]);
  const [consultantNotes] = useState<ConsultantNote[]>([]);
  const [blockedUsers] = useState<BlockedUser[]>([]);
  const [familyInvitations] = useState<FamilyMemberInvitation[]>([]);

  const isAdmin = currentUser ? ['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role) : false;

  const refreshDatabase = useCallback(async () => {
    const endpoints: Array<[string, (value: ApiRecord[]) => void]> = [
      ['/api/receiving-accounts', (value) => setReceivingAccounts(value as ReceivingAccount[])],
    ];
    if (currentUser?.id) {
      endpoints.push(
        ['/api/profiles', (value) => setProfiles(value as MatrimonialProfile[])],
        ['/api/interests', (value) => setInterests(value as InterestRequest[])],
        ['/api/favorites', (value) => setFavorites(value as FavoriteItem[])],
        ['/api/notifications', (value) => setNotifications(value as NotificationItem[])],
        ['/api/support', (value) => setTickets(value as SupportTicket[])],
        ['/api/invoices', (value) => setInvoices(value as Invoice[])],
        ['/api/payments/proofs', (value) => setPaymentProofs(value as PaymentProof[])],
        ['/api/verifications', (value) => setVerifications(value as VerificationRequest[])],
        ['/api/conversations', (value) => setConversations(value.map(camelConversation))],
      );
      if (isAdmin) {
        endpoints.push(
          ['/api/users', (value) => setUsers(value as User[])],
          ['/api/reports', (value) => setReports(value as AbuseReport[])],
        );
      }
    }

    const results = await Promise.allSettled(endpoints.map(async ([url, assign]) => {
      const result = await apiRequest<{ data: ApiRecord[] }>(url);
      assign(Array.isArray(result.data) ? result.data : []);
      return { url, data: result.data };
    }));
    for (const result of results) {
      if (result.status === 'rejected') console.error('Database refresh failed:', result.reason);
    }

    if (currentUser?.id) {
      const session = await apiRequest<{ user: User; profile: MatrimonialProfile | null }>('/api/auth/me');
      setCurrentUser(session.user);
      setCurrentProfile(session.profile);
      const ownProfile = session.profile;
      if (ownProfile) setProfiles((previous) => [ownProfile, ...previous.filter((profile) => profile.id !== ownProfile.id)]);

      const conversationsResult = results.find((result) => result.status === 'fulfilled' && result.value.url === '/api/conversations');
      if (conversationsResult?.status === 'fulfilled') {
        const rows = conversationsResult.value.data ?? [];
        const loaded = await Promise.all(rows.map(async (row) => {
          const result = await apiRequest<{ data: ApiRecord[] }>(`/api/messages?conversationId=${encodeURIComponent(row.id)}`);
          return [row.id, result.data.map(camelMessage)] as const;
        }));
        setMessages(Object.fromEntries(loaded));
      }
    }
  }, [currentUser?.id, isAdmin]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const session = await response.json();
          if (mounted) {
            setCurrentUser(session.user);
            setCurrentProfile(session.profile ?? null);
          }
        }
      } catch (error) {
        console.error('Session load failed:', error);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { void refreshDatabase(); }, [refreshDatabase]);

  const connectionQuota = useMemo<ConnectionQuotaInfo>(() => {
    const privileged = currentUser ? ['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role) : false;
    const total = privileged ? 99_999 : currentUser?.totalConnections ?? 0;
    const used = privileged ? 0 : currentUser?.usedConnections ?? 0;
    const remaining = privileged ? 99_999 : currentUser?.remainingConnections ?? Math.max(0, total - used);
    const usagePercentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const alertLevel = remaining <= 0 ? 'LOCKED_100'
      : usagePercentage >= 90 ? 'WARNING_90'
      : usagePercentage >= 80 ? 'WARNING_80'
      : usagePercentage >= 70 ? 'WARNING_70' : 'NORMAL';
    return {
      used, total, remaining, usagePercentage, alertLevel,
      isReached: !privileged && remaining <= 0,
      planName: currentUser?.subscriptionTier === 'PREMIUM_PLUS' || currentUser?.subscriptionTier === 'VIP'
        ? 'VIP Royal Package' : currentUser?.subscriptionTier === 'PREMIUM' ? 'Premium Package' : 'Basic Package',
    };
  }, [currentUser]);

  const login = async (email: string, password = '') => {
    try {
      const result = await apiRequest<{ user: User; redirectUrl: string }>('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const session = await apiRequest<{ user: User; profile: MatrimonialProfile | null }>('/api/auth/me');
      setCurrentUser(session.user);
      setCurrentProfile(session.profile);
      return { success: true, redirectUrl: result.redirectUrl, user: session.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed.' };
    }
  };

  const register = async (userData: Partial<User> & { password?: string }, profileData: Partial<MatrimonialProfile>) => {
    try {
      const result = await apiRequest<{ user: User; profile: MatrimonialProfile; redirectUrl: string }>('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email, password: userData.password, fullName: userData.name ?? profileData.fullName,
          phone: userData.phone, whatsappNumber: userData.whatsappNumber, displayName: profileData.displayName,
          gender: profileData.gender, dateOfBirth: profileData.dateOfBirth, maritalStatus: profileData.maritalStatus,
          religion: profileData.religion, sectOrCommunity: profileData.sectOrCommunity,
          motherTongue: profileData.motherTongue, city: profileData.city, country: profileData.country,
          stateProvince: profileData.state ?? profileData.province, bioHeadline: profileData.bioHeadline,
          aboutMe: profileData.aboutMe,
          highestDegree: profileData.educationCareer?.highestDegree,
          institution: profileData.educationCareer?.institution,
          profession: profileData.educationCareer?.profession,
          annualIncome: profileData.educationCareer?.annualIncome,
          height: profileData.lifestyle?.height,
        }),
      });
      setCurrentUser(result.user);
      setCurrentProfile(result.profile);
      return { success: true, redirectUrl: result.redirectUrl, user: result.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null); setCurrentProfile(null); setUsers([]); setProfiles([]); setInterests([]);
    setConversations([]); setMessages({}); setInvoices([]); setPaymentProofs([]); setVerifications([]); setReports([]);
  };

  const switchUser = async (userId: string): Promise<boolean> => {
    try {
      const result = await apiRequest<{ user: User }>('/api/auth/switch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
      });
      setCurrentUser(result.user);
      const session = await apiRequest<{ profile: MatrimonialProfile | null }>('/api/auth/me');
      setCurrentProfile(session.profile);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Account switch failed.');
      return false;
    }
  };

  const updateCurrentUserProfile = (data: Partial<MatrimonialProfile>) => {
    if (!currentProfile) return;
    void (async () => {
      try {
        const result = await apiRequest<{ data: MatrimonialProfile }>('/api/profiles', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentProfile.id, ...data }),
        });
        setCurrentProfile(result.data);
        setProfiles((previous) => previous.map((profile) => profile.id === result.data.id ? result.data : profile));
        toast.success('Profile updated.');
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Profile update failed.'); }
    })();
  };

  const sendInterest = async (targetProfileId: string, message?: string) => {
    const target = profiles.find((profile) => profile.id === targetProfileId);
    if (!target) return { success: false, message: 'Candidate profile not found.' };

    const activeGender = currentProfile?.gender || profiles.find((p) => currentUser && p.userId === currentUser.id)?.gender;
    if (activeGender && target.gender && activeGender === target.gender && currentUser?.role === 'USER') {
      return { success: false, message: 'Opposite gender matching only: You cannot connect with profiles of the same gender.' };
    }

    try {
      await apiRequest('/api/interests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: target.userId, message }),
      });
      await refreshDatabase();
      return { success: true, message: 'Interest sent for review by the recipient.' };
    } catch (error) { return { success: false, message: error instanceof Error ? error.message : 'Interest could not be sent.' }; }
  };

  const updateInterest = (id: string, status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED') => {
    void (async () => {
      try {
        await apiRequest('/api/interests', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
        });
        await refreshDatabase();
        toast.success(`Interest ${status.toLowerCase()}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Interest update failed.'); }
    })();
  };

  const startOrGetConversation = async (recipientUserId: string) => {
    try {
      const result = await apiRequest<{ data: ApiRecord }>('/api/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantBId: recipientUserId }),
      });
      await refreshDatabase();
      return result.data.id as string;
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Conversation could not be started.'); return ''; }
  };

  const sendMessage = (conversationId: string, text: string) => {
    void (async () => {
      try {
        await apiRequest('/api/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId, text }),
        });
        const result = await apiRequest<{ data: ApiRecord[] }>(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`);
        setMessages((previous) => ({ ...previous, [conversationId]: result.data.map(camelMessage) }));
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Message could not be sent.'); }
    })();
  };

  const submitVerification = async (
    documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'CNIC',
    docUrl: string,
    selfieUrl: string,
    documentFrontKey?: string,
    selfieKey?: string,
  ) => {
    try {
      await apiRequest('/api/verifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: documentType === 'CNIC' ? 'NATIONAL_ID' : documentType,
          documentFrontUrl: docUrl, selfieUrl, documentFrontKey, selfieKey,
        }),
      });
      await refreshDatabase();
      return { success: true, message: 'Verification submitted for review.' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Verification submission failed.' };
    }
  };

  const reviewVerification = (id: string, status: 'APPROVED' | 'REJECTED', reviewerNotes?: string) => {
    void (async () => {
      try {
        await apiRequest('/api/verifications', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, reviewerNotes }),
        });
        await refreshDatabase(); toast.success(`Verification ${status.toLowerCase()}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Verification review failed.'); }
    })();
  };

  const submitPaymentProof = async (data: Omit<PaymentProof, 'id' | 'status' | 'submittedAt'> & { screenshotKey?: string }) => {
    try {
      await apiRequest('/api/payments/proofs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      await refreshDatabase();
      return { success: true, message: 'Payment proof submitted for manual review.' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Payment proof submission failed.' };
    }
  };

  const reviewPayment = (id: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) => {
    void (async () => {
      try {
        await apiRequest('/api/payments/proofs', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, rejectionReason }),
        });
        await refreshDatabase(); toast.success(`Payment ${status.toLowerCase()}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Payment review failed.'); }
    })();
  };

  const processInstantPayment = async (_params?: unknown): Promise<{ success: boolean; error?: string; invoice?: Invoice }> => ({
    success: false,
    error: 'Card payments are not configured yet. Please use a manual bank or wallet transfer.',
  });

  const mutateReceivingAccount = (method: 'POST' | 'PATCH' | 'DELETE', payload: ApiRecord) => {
    void (async () => {
      try {
        const url = method === 'DELETE' ? `/api/receiving-accounts?id=${encodeURIComponent(payload.id)}` : '/api/receiving-accounts';
        await apiRequest(url, {
          method, headers: method === 'DELETE' ? undefined : { 'Content-Type': 'application/json' },
          body: method === 'DELETE' ? undefined : JSON.stringify(payload),
        });
        await refreshDatabase(); toast.success('Receiving account updated.');
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Receiving account update failed.'); }
    })();
  };

  const updateUserStatus = (userId: string, accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    void (async () => {
      try {
        await apiRequest('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, accountStatus }) });
        await refreshDatabase(); toast.success(`User status changed to ${accountStatus}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'User update failed.'); }
    })();
  };

  const verifyUserBadge = (userId: string, isVerified: boolean) => {
    void (async () => {
      try {
        await apiRequest('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, isVerified }) });
        await refreshDatabase(); toast.success('Verification badge updated.');
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Badge update failed.'); }
    })();
  };

  const updateProfileApproval = (id: string, approvalStatus: ProfileApprovalStatus, notes?: string) => {
    void (async () => {
      try {
        await apiRequest('/api/profiles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approvalStatus, reviewerNotes: notes }) });
        await refreshDatabase(); toast.success(`Profile ${approvalStatus.toLowerCase()}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Profile review failed.'); }
    })();
  };

  const submitReport = async (reportedUserId: string, category: string, description: string) => {
    try {
      await apiRequest('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportedUserId, category, description }) });
      return { success: true, message: 'Report submitted for review.' };
    } catch (error) { return { success: false, message: error instanceof Error ? error.message : 'Report submission failed.' }; }
  };

  const reviewReport = (id: string, status: 'RESOLVED' | 'DISMISSED', adminActionTaken?: string) => {
    void (async () => {
      try {
        await apiRequest('/api/reports', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, adminActionTaken }) });
        await refreshDatabase(); toast.success(`Report ${status.toLowerCase()}.`);
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Report update failed.'); }
    })();
  };

  const unavailable = (feature: string) => toast.error(`${feature} is not connected to the backend yet.`);
  const isContactUnlocked = (targetProfileId: string) => Boolean(currentUser && (
    currentProfile?.id === targetProfileId || isAdmin || interests.some((interest) => interest.status === 'ACCEPTED' &&
      ((interest.senderId === currentUser.id && interest.receiverProfileId === targetProfileId) ||
       (interest.receiverId === currentUser.id && interest.senderProfileId === targetProfileId)))
  ));

  return {
    currentUser, currentProfile, users, profiles, interests, favorites, conversations, messages, notifications,
    plans, extraPacks, invoices, verifications, reports, tickets, coupons, cms, auditLogs, settings,
    paymentProofs, receivingAccounts, connectionTransactions, consultants, consultantRecommendations,
    consultantNotes, blockedUsers, familyInvitations, connectionQuota, refreshDatabase,
    login, register, logout, switchUser, updateCurrentUserProfile,
    updateUserSubscription: (_tier: SubscriptionTier, _days = 365) => unavailable('Direct subscription changes'),
    verifyWhatsAppCode: (_code: string) => ({ success: false, message: 'WhatsApp verification will be available after the provider integration is configured.' }),
    sendInterest,
    acceptInterest: (id: string) => updateInterest(id, 'ACCEPTED'),
    declineInterest: (id: string) => updateInterest(id, 'DECLINED'),
    cancelInterest: (id: string) => updateInterest(id, 'CANCELLED'),
    startOrGetConversation, sendMessage,
    submitVerification,
    approveVerification: (id: string, notes?: string) => reviewVerification(id, 'APPROVED', notes),
    rejectVerification: (id: string, notes?: string) => reviewVerification(id, 'REJECTED', notes),
    submitPaymentProof,
    approvePaymentProof: (id: string) => reviewPayment(id, 'VERIFIED'),
    rejectPaymentProof: (id: string, reason?: string) => reviewPayment(id, 'REJECTED', reason),
    processInstantPayment,
    addReceivingAccount: (account: Omit<ReceivingAccount, 'id' | 'createdAt'>) => mutateReceivingAccount('POST', account),
    updateReceivingAccount: (id: string, data: Partial<ReceivingAccount>) => mutateReceivingAccount('PATCH', { id, ...data }),
    deleteReceivingAccount: (id: string) => mutateReceivingAccount('DELETE', { id }),
    toggleReceivingAccountStatus: (id: string) => {
      const account = receivingAccounts.find((item) => item.id === id);
      if (account) mutateReceivingAccount('PATCH', { id, isActive: !account.isActive });
    },
    updateUserStatus, verifyUserBadge, updateProfileApproval, submitReport,
    resolveReport: (id: string, action: string) => reviewReport(id, 'RESOLVED', action),
    dismissReport: (id: string) => reviewReport(id, 'DISMISSED'),
    unlockContactDetails: (targetProfileId: string) => isContactUnlocked(targetProfileId)
      ? { success: true, message: 'Contact access is available.', alreadyUnlocked: true }
      : { success: false, message: 'Contact details unlock after mutual interest acceptance.' },
    isContactUnlocked,
    canViewContactDetails: isContactUnlocked,
    canAccessProfile: (_id: string) => true,
    refundConnectionCredit: (_userId: string, _profileId: string, _reason: string) => { unavailable('Connection refunds'); return false; },
    addExtraConnections: (_userId: string, _count: number) => unavailable('Connection top-ups'),
    toggleFavorite: async (profileId: string) => {
      const existing = favorites.some((favorite) => favorite.targetProfileId === profileId);
      try {
        await apiRequest(existing ? `/api/favorites?targetProfileId=${encodeURIComponent(profileId)}` : '/api/favorites', {
          method: existing ? 'DELETE' : 'POST',
          headers: existing ? undefined : { 'Content-Type': 'application/json' },
          body: existing ? undefined : JSON.stringify({ targetProfileId: profileId }),
        });
        await refreshDatabase();
        return !existing;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Favorite update failed.');
        return null;
      }
    },
    isFavorited: (profileId: string) => favorites.some((favorite) => favorite.targetProfileId === profileId),
    blockUser: (_profileId: string, _reason?: string) => unavailable('Blocking'),
    unblockUser: (_profileId: string) => unavailable('Blocking'),
    isUserBlocked: (_profileId: string) => false,
    assignConsultant: (_userId: string, _consultantId: string) => unavailable('Consultant assignment'),
    addConsultant: (_consultant: Consultant) => unavailable('Consultant management'),
    deleteConsultant: (_id: string) => unavailable('Consultant management'),
    addConsultantRecommendation: (_userId: string, _profileId: string, _note: string) => unavailable('Consultant recommendations'),
    addConsultantNote: (_userId: string, _consultantId: string, _note: string, _private = true) => unavailable('Consultant notes'),
    markNotificationRead: (id: string) => {
      void apiRequest('/api/notifications', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      }).then(() => {
        setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
      })
        .catch((error) => toast.error(error instanceof Error ? error.message : 'Notification update failed.'));
    },
    markAllNotificationsRead: () => {
      void apiRequest('/api/notifications', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }),
      }).then(() => {
        setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      })
        .catch((error) => toast.error(error instanceof Error ? error.message : 'Notification update failed.'));
    },
    createSupportTicket: (data: Partial<SupportTicket> & { message?: string }) => {
      void apiRequest('/api/support', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      }).then(async () => { await refreshDatabase(); toast.success('Support ticket created.'); })
        .catch((error) => toast.error(error instanceof Error ? error.message : 'Ticket creation failed.'));
      return null;
    },
    replySupportTicket: (id: string, text: string, _sender: 'USER' | 'AGENT' = 'USER', _attachment?: string) => {
      void apiRequest('/api/support', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, text }),
      }).then(async () => { await refreshDatabase(); toast.success('Reply sent.'); })
        .catch((error) => toast.error(error instanceof Error ? error.message : 'Reply failed.'));
    },
    updateTicketStatus: (id: string, status: SupportTicketStatus) => {
      void apiRequest('/api/support', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
      }).then(async () => { await refreshDatabase(); toast.success('Ticket status updated.'); })
        .catch((error) => toast.error(error instanceof Error ? error.message : 'Ticket update failed.'));
    },
    inviteFamilyMember: (_data: Omit<FamilyMemberInvitation, 'id' | 'userId' | 'createdAt' | 'status'>) => unavailable('Family access'),
    updateSettings: (_data: Partial<SystemSettings>) => unavailable('System settings'),
    updateTaxSettings: (_tax: TaxSettings) => unavailable('Tax settings'),
    updatePlan: (_id: string, _data: Partial<SubscriptionPlan>) => unavailable('Plan management'),
    addPlan: (_plan: SubscriptionPlan) => unavailable('Plan management'),
    applyCoupon: (_code: string): { valid: boolean; discountPercent?: number; fixedDiscount?: number; message: string } => ({
      valid: false, discountPercent: undefined, fixedDiscount: undefined, message: 'Coupons are not enabled.',
    }),
    addCoupon: (_coupon: Coupon) => unavailable('Coupons'),
    toggleCouponStatus: (_id: string) => unavailable('Coupons'),
    updateCMS: (_data: Partial<CMSContent>) => unavailable('CMS publishing'),
    logAdminAction: (_action: string, _type: unknown, _id: string, _details: string) => undefined,
  };
}

type AuthContextValue = ReturnType<typeof useAuthValue>;
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthValue();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
