'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Heart,
  User,
  ShieldCheck,
  Crown,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Receipt,
  UserCheck,
  ShieldAlert,
  Home,
  Users,
  Utensils,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { User as UserType, MatrimonialProfile, InterestRequest } from '@/lib/types';
import { toast } from 'sonner';

interface AdminUserDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  profile?: MatrimonialProfile | null;
}

type DossierTab = 'CONNECTIONS' | 'DOSSIER' | 'CHATS' | 'PAYMENTS';
type ConnectionFilter = 'ALL' | 'SENT' | 'RECEIVED' | 'CONNECTED';

// Safe helper to extract photo URL regardless of whether photo is a string or ProfilePhoto object
function getPhotoUrl(photo?: any): string {
  if (!photo) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
  if (typeof photo === 'string') return photo;
  return photo.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
}

export function AdminUserDossierModal({
  isOpen,
  onClose,
  user,
  profile: initialProfile,
}: AdminUserDossierModalProps) {
  const {
    profiles,
    interests,
    conversations,
    messages,
    invoices,
    paymentProofs,
    switchUser,
    verifyUserBadge,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<DossierTab>('CONNECTIONS');
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>('ALL');

  if (!isOpen || !user) return null;

  // Resolve user's matrimonial profile
  const profile =
    initialProfile ||
    profiles.find((p) => p.userId === user.id || p.id === user.profileId) ||
    profiles.find((p) => p.id === user.id.replace('user-', 'profile-')) ||
    null;

  const targetProfileId = profile?.id || user.profileId || user.id.replace('user-', 'profile-');

  // Filter all interests sent by this user
  const sentInterests = interests.filter(
    (i) => i.senderId === user.id || (profile && i.senderProfileId === profile.id) || i.senderProfileId === targetProfileId
  );

  // Filter all interests received by this user
  const receivedInterests = interests.filter(
    (i) =>
      i.receiverId === user.id ||
      (profile && i.receiverProfileId === profile.id) ||
      i.receiverProfileId === targetProfileId
  );

  // Mutual / Connected interests
  const connectedInterests = [...sentInterests, ...receivedInterests].filter(
    (i, idx, arr) => i.status === 'ACCEPTED' && arr.findIndex((x) => x.id === i.id) === idx
  );

  // Filtered list based on sub-filter
  const displayInterests = (
    connectionFilter === 'SENT'
      ? sentInterests
      : connectionFilter === 'RECEIVED'
      ? receivedInterests
      : connectionFilter === 'CONNECTED'
      ? connectedInterests
      : [...sentInterests, ...receivedInterests].filter(
          (i, idx, arr) => arr.findIndex((x) => x.id === i.id) === idx
        )
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Conversations involving this user
  const userConversations = conversations.filter(
    (c) =>
      c.participantAId === user.id ||
      c.participantBId === user.id ||
      (profile && (c.participantAId === profile.id || c.participantBId === profile.id))
  );

  // Invoices & Proofs
  const userInvoices = invoices.filter(
    (inv) => inv.userId === user.id || inv.userId === `user-${user.id}`
  );
  const userProofs = paymentProofs.filter(
    (p) => p.userId === user.id || p.userEmail === user.email
  );

  const cleanPhone = (profile?.phone || user.email).replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone || '923001234567'}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${user.name}, this is the Administrator from Compatible Matrimonials regarding your account.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <img
              src={getPhotoUrl(profile?.photos?.[0] || user.avatarUrl)}
              alt={user.name}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold font-serif text-white">{user.name}</h2>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/80 border border-blue-800 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    <ShieldCheck className="h-3 w-3" /> Blue Shield
                  </span>
                )}
                <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {user.subscriptionTier.replace('_', ' ')}
                </span>
                {user.subscriptionTier !== 'FREE' && user.subscriptionExpiresAt && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                  </span>
                )}
                {user.subscriptionTier === 'FREE' && (
                  <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    Free (2 Limits)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                <span>{user.email}</span>
                <span>•</span>
                <span>ID: {user.id}</span>
                {profile?.city && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-300">
                      {profile.city}, {profile.country}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Header Quick Controls */}
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
              title="Message on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                switchUser(user.id);
                toast.success(`Switched session to ${user.name}`);
                window.location.href = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? '/admin' : '/dashboard';
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-300 hover:bg-brand-500/20 transition cursor-pointer"
              title="Login As This User"
            >
              <UserCheck className="h-3.5 w-3.5 text-brand-400" />
              <span className="hidden sm:inline">Login As</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-900/50 px-6 pt-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('CONNECTIONS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'CONNECTIONS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Connections & Interests</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
              {sentInterests.length + receivedInterests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOSSIER')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'DOSSIER'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Matrimonial Dossier & Bio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHATS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'CHATS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages & Chats</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
              {userConversations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAYMENTS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'PAYMENTS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Invoices & Proofs</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
              {userInvoices.length + userProofs.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= TAB 1: CONNECTIONS & INTERESTS HISTORY ================= */}
          {activeTab === 'CONNECTIONS' && (
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Sent</span>
                  <div className="text-xl font-black font-serif text-white">{sentInterests.length}</div>
                  <p className="text-[10px] text-zinc-500">Outbound proposals</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Received</span>
                  <div className="text-xl font-black font-serif text-white">{receivedInterests.length}</div>
                  <p className="text-[10px] text-zinc-500">Inbound inquiries</p>
                </div>

                <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Mutual Connected</span>
                  <div className="text-xl font-black font-serif text-emerald-300">{connectedInterests.length}</div>
                  <p className="text-[10px] text-emerald-400/70">Accepted matches</p>
                </div>

                <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Awaiting</span>
                  <div className="text-xl font-black font-serif text-amber-300">
                    {[...sentInterests, ...receivedInterests].filter((i) => i.status === 'PENDING').length}
                  </div>
                  <p className="text-[10px] text-amber-400/70">In negotiation</p>
                </div>
              </div>

              {/* Sub-Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(
                    [
                      { key: 'ALL', label: 'All Interactions', count: sentInterests.length + receivedInterests.length },
                      { key: 'SENT', label: 'Sent by User', count: sentInterests.length },
                      { key: 'RECEIVED', label: 'Received Inbound', count: receivedInterests.length },
                      { key: 'CONNECTED', label: 'Connected / Accepted', count: connectedInterests.length },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setConnectionFilter(f.key)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        connectionFilter === f.key
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>

                <span className="text-xs text-zinc-400 font-medium">
                  Showing {displayInterests.length} interaction records
                </span>
              </div>

              {/* Interest / Connection Records List */}
              {displayInterests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
                  <Heart className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">No connection or interest history found for this filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayInterests.map((item) => {
                    const isSender = item.senderId === user.id || item.senderProfileId === targetProfileId;
                    const counterpartProfileId = isSender ? item.receiverProfileId : item.senderProfileId;
                    const counterpartProfile = profiles.find(
                      (p) => p.id === counterpartProfileId || p.userId === (isSender ? item.receiverId : item.senderId)
                    );
                    const counterpartName = isSender ? item.receiverName : item.senderName;
                    const counterpartPhoto = getPhotoUrl(
                      counterpartProfile?.photos?.[0] || (isSender ? item.receiverPhoto : item.senderPhoto)
                    );

                    const isAccepted = item.status === 'ACCEPTED';
                    const isDeclined = item.status === 'DECLINED';

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isAccepted
                            ? 'border-emerald-800/70 bg-emerald-950/20'
                            : isDeclined
                            ? 'border-zinc-800 bg-zinc-900/40 opacity-75'
                            : 'border-zinc-800 bg-zinc-900/80'
                        }`}
                      >
                        {/* Target Partner Info */}
                        <div className="flex items-start gap-3.5">
                          <img
                            src={counterpartPhoto}
                            alt={counterpartName}
                            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-zinc-700 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-white text-sm">{counterpartName}</h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isSender
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                    : 'bg-purple-950 text-purple-300 border border-purple-800'
                                }`}
                              >
                                {isSender ? 'Sent by User' : 'Received Inbound'}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isAccepted
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : isDeclined
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {isAccepted ? 'Connected (Mutual Match)' : item.status}
                              </span>
                            </div>

                            {/* Counterpart Quick Bio */}
                            <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                              {counterpartProfile?.age && <span>{counterpartProfile.age} yrs</span>}
                              {counterpartProfile?.city && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {counterpartProfile.city}, {counterpartProfile.country}
                                  </span>
                                </>
                              )}
                              {counterpartProfile?.educationCareer?.profession && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-zinc-300">
                                    <Briefcase className="h-3 w-3" /> {counterpartProfile.educationCareer.profession}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Message Bubble if present */}
                            {item.message && (
                              <div className="mt-2 rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-zinc-200 italic max-w-xl">
                                "{item.message}"
                              </div>
                            )}

                            <div className="text-[10px] text-zinc-500 flex items-center gap-2 pt-1">
                              <span>Sent: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {isAccepted && item.updatedAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-semibold">Accepted on: {new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons for this Connection */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Link
                            href={`/profile/${counterpartProfileId || counterpartProfile?.id || 'profile-1'}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-amber-400" /> View Candidate Dossier
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: FULL PROFILE DOSSIER & BIO ================= */}
          {activeTab === 'DOSSIER' && (
            <div className="space-y-6">
              {!profile ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-xs text-zinc-400">
                  No matrimonial profile dossier created yet for this account.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Photo Gallery Strip */}
                  {profile.photos && profile.photos.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Candidate Photographs ({profile.photos.length})
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {profile.photos.map((ph, i) => (
                          <img
                            key={i}
                            src={getPhotoUrl(ph)}
                            alt={`Photo ${i + 1}`}
                            className="h-28 w-28 rounded-2xl object-cover ring-1 ring-zinc-700 shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio & Headline */}
                  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white">About & Biography</h3>
                    <p className="text-xs text-amber-300 font-medium">"{profile.bioHeadline}"</p>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{profile.aboutMe}</p>
                  </div>

                  {/* 2-Column Specs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic & Religious Details */}
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 text-xs">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-500" /> Basic & Religious Identity
                      </h4>
                      <div className="divide-y divide-zinc-800 text-zinc-300">
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Gender:</span>
                          <span className="font-semibold text-white">{profile.gender}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Age:</span>
                          <span className="font-semibold text-white">{profile.age} years</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Marital Status:</span>
                          <span className="font-semibold text-white">{profile.maritalStatus}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Height:</span>
                          <span className="font-semibold text-white">{profile.lifestyle?.height || '5 ft 9 in'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Religion & Sect:</span>
                          <span className="font-semibold text-white">
                            {profile.religion} ({profile.sectOrCommunity || 'Sunni'})
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Mother Tongue:</span>
                          <span className="font-semibold text-white">{profile.motherTongue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Education & Career */}
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 text-xs">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-amber-500" /> Education & Career
                      </h4>
                      <div className="divide-y divide-zinc-800 text-zinc-300">
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Highest Degree:</span>
                          <span className="font-semibold text-white">{profile.educationCareer?.highestDegree}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Institution:</span>
                          <span className="font-semibold text-white">{profile.educationCareer?.institution}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Profession:</span>
                          <span className="font-semibold text-white">{profile.educationCareer?.profession}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Designation / Role:</span>
                          <span className="font-semibold text-white">{profile.educationCareer?.designation || profile.educationCareer?.jobTitle || 'Executive'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Monthly Income:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {profile.educationCareer?.monthlyIncome ? `PKR ${profile.educationCareer.monthlyIncome.toLocaleString()}` : 'PKR 250,000+'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Family Background */}
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 text-xs">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Home className="h-4 w-4 text-amber-500" /> Family Background
                      </h4>
                      <div className="divide-y divide-zinc-800 text-zinc-300">
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Father Profession:</span>
                          <span className="font-semibold text-white">{profile.familyInfo?.fatherOccupation || 'Business / Retired'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Mother Profession:</span>
                          <span className="font-semibold text-white">{profile.familyInfo?.motherOccupation || 'Homemaker'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Siblings:</span>
                          <span className="font-semibold text-white">
                            {profile.familyInfo?.brothersCount || 1} Brothers, {profile.familyInfo?.sistersCount || 1} Sisters
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Family Values:</span>
                          <span className="font-semibold text-white">{profile.familyInfo?.familyValues || 'Moderate Religious'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Residential Coordinates */}
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 text-xs">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-amber-500" /> Direct Contact & Address
                      </h4>
                      <div className="divide-y divide-zinc-800 text-zinc-300">
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Primary Mobile:</span>
                          <span className="font-mono font-bold text-white">{profile.phone || '+92 300 1234567'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Email Address:</span>
                          <span className="font-mono text-white">{user.email}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">City & Country:</span>
                          <span className="font-semibold text-white">{profile.city}, {profile.country}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-500">Citizenship:</span>
                          <span className="font-semibold text-white">{profile.citizenship || 'Pakistani'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: CHATS & CONVERSATIONS ================= */}
          {activeTab === 'CHATS' && (
            <div className="space-y-4">
              {userConversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">No chat conversation threads active for this user.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden">
                  {userConversations.map((conv) => {
                    const isPartA = conv.participantAId === user.id || (profile && conv.participantAId === profile.id);
                    const otherParticipantId = isPartA ? conv.participantBId : conv.participantAId;
                    const otherUserName = isPartA ? conv.participantBName : conv.participantAName;
                    const otherUserPhoto = isPartA ? conv.participantBPhoto : conv.participantAPhoto;
                    const otherProfile = profiles.find((p) => p.userId === otherParticipantId || p.id === otherParticipantId);
                    const convMessages = messages[conv.id] || [];

                    return (
                      <div key={conv.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/40 transition">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPhotoUrl(otherProfile?.photos?.[0] || otherUserPhoto)}
                            alt={otherUserName}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{otherUserName}</div>
                            <p className="text-[11px] text-zinc-400 truncate max-w-sm">
                              {conv.lastMessageText || 'Conversation active'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-[10px] text-zinc-500 block">
                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                          </span>
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                            {convMessages.length} Messages
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: INVOICES & PAYMENTS ================= */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-4">
              {/* Membership Status & Expiration Box */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Membership Plan</span>
                      <h4 className="text-sm font-bold font-serif text-amber-300">
                        {user.subscriptionTier === 'PREMIUM_PLUS'
                          ? 'VIP Bespoke Matchmaking'
                          : user.subscriptionTier === 'PREMIUM'
                          ? 'Elite Executive Plan (PREMIUM)'
                          : 'Basic Standard Plan (FREE)'}
                      </h4>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase">Plan Expiry Date</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime / Free (2 Connects Limit)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                    <span className="text-zinc-400 block">Connection Limit</span>
                    <span className="font-bold text-white font-mono">
                      {user.subscriptionTier === 'PREMIUM_PLUS' ? 'Unlimited' : user.subscriptionTier === 'PREMIUM' ? '50 / month' : '2 / month (Free)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                    <span className="text-zinc-400 block">Direct WhatsApp</span>
                    <span className="font-bold text-emerald-400">
                      {user.subscriptionTier !== 'FREE' ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 col-span-2 sm:col-span-1">
                    <span className="text-zinc-400 block">Auto-Downgrade</span>
                    <span className="font-bold text-zinc-300">
                      {user.subscriptionExpiresAt ? 'Reverts to Free on expiry' : 'Active Free Tier'}
                    </span>
                  </div>
                </div>
              </div>

              {userInvoices.length === 0 && userProofs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
                  <Receipt className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">No payment proofs or invoices recorded for this member.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{inv.planName}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Invoice #{inv.invoiceNumber} • {new Date(inv.date).toLocaleDateString()} via {inv.paymentMethod}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-serif font-bold text-amber-400 text-sm">
                          {inv.currency} {inv.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-zinc-800 bg-zinc-900/90 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Account Status:</span>
            <span
              className={`font-bold ${
                user.accountStatus === 'ACTIVE'
                  ? 'text-emerald-400'
                  : user.accountStatus === 'SUSPENDED'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {user.accountStatus}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                verifyUserBadge(user.id, !user.isVerified);
                toast.success(`Verification badge ${!user.isVerified ? 'granted' : 'revoked'} for ${user.name}`);
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              {user.isVerified ? 'Revoke Shield Badge' : 'Grant Verified Shield'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
