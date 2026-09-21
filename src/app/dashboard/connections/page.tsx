'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Eye,
  UserX,
  Bookmark,
  ShieldAlert,
  Phone,
  Mail,
  Lock,
  Unlock,
  Sparkles,
  Crown,
  Trash2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function ConnectionsHubPage() {
  const {
    currentUser,
    currentProfile,
    profiles,
    interests,
    favorites,
    blockedUsers,
    connectionQuota,
    acceptInterest,
    declineInterest,
    cancelInterest,
    toggleFavorite,
    unblockUser,
    unlockContactDetails,
    isContactUnlocked,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'accepted' | 'favorites' | 'blocked'>('received');

  // 1. Received Interests
  const receivedInterests = interests.filter(
    (i) =>
      (currentProfile && (i.receiverProfileId === currentProfile.id || i.receiverId === currentProfile.userId)) ||
      (currentUser && (i.receiverId === currentUser.id || (currentUser.profileId && i.receiverProfileId === currentUser.profileId)))
  );

  // 2. Sent Interests
  const sentInterests = interests.filter(
    (i) =>
      (currentProfile && (i.senderProfileId === currentProfile.id || i.senderId === currentProfile.userId)) ||
      (currentUser && (i.senderId === currentUser.id || (currentUser.profileId && i.senderProfileId === currentUser.profileId)))
  );

  // 3. Accepted Connections
  const acceptedInterests = interests.filter((i) => {
    const isUserParticipant =
      (currentProfile && (i.receiverProfileId === currentProfile.id || i.senderProfileId === currentProfile.id || i.receiverId === currentProfile.userId || i.senderId === currentProfile.userId)) ||
      (currentUser && (i.receiverId === currentUser.id || i.senderId === currentUser.id));
    return isUserParticipant && i.status === 'ACCEPTED';
  });

  // 4. Favorite Connections (Section 19: Replaces Shortlist Completely)
  const userFavorites = favorites.filter((f) => f.userId === currentUser?.id);
  const favoriteProfiles = profiles.filter((p) => userFavorites.some((f) => f.targetProfileId === p.id));

  // 5. Blocked Users (Section 22)
  const myBlocked = blockedUsers.filter((b) => b.userId === currentUser?.id);

  const handleUnlockContact = (targetProfileId: string, name: string) => {
    const res = unlockContactDetails(targetProfileId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-foreground">Connections</h1>
            <span className="rounded-full bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300 px-2.5 py-0.5 text-xs font-bold font-mono">
              {connectionQuota.remaining} Credits
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your mutual interests, unlocked contacts, favorite connections, and privacy list.
          </p>
        </div>

        {/* 5-Tab Navigation (Section 18) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === 'received'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Received ({receivedInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === 'sent'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Sent ({sentInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === 'accepted'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Accepted ({acceptedInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === 'favorites'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Favorite Connections ({favoriteProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === 'blocked'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserX className="h-3.5 w-3.5" />
            <span>Blocked ({myBlocked.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECEIVED INTERESTS */}
      {activeTab === 'received' && (
        <div className="space-y-4 animate-in fade-in">
          {receivedInterests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No received connection interests yet</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Completed profiles with verified badges receive 4x more inbound inquiries.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Browse Compatible Profiles
              </Link>
            </div>
          ) : (
            receivedInterests.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={
                      item.senderPhoto ||
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={item.senderName}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{item.senderName}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        "{item.message}"
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Received on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/profile/${item.senderProfileId}`}
                    className="rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" /> View Dossier
                  </Link>

                  {item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          declineInterest(item.id);
                          toast.info('Connection interest declined politely.');
                        }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          acceptInterest(item.id);
                          toast.success('Interest accepted! Contact details are now unlocked.');
                        }}
                        className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-md"
                      >
                        Accept Interest
                      </button>
                    </>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <Link
                      href="/dashboard/messages"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SENT INTERESTS */}
      {activeTab === 'sent' && (
        <div className="space-y-4 animate-in fade-in">
          {sentInterests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Send className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No sent connection interests</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Explore verified profiles in our directory and express interest with personalized family notes.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Find Matches
              </Link>
            </div>
          ) : (
            sentInterests.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={
                      item.receiverPhoto ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={item.receiverName}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{item.receiverName}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        "{item.message}"
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Sent on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/profile/${item.receiverProfileId}`}
                    className="rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" /> View Dossier
                  </Link>

                  {item.status === 'ACCEPTED' && (
                    <Link
                      href="/dashboard/messages"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  )}

                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        cancelInterest(item.id);
                        toast.info('Interest request withdrawn.');
                      }}
                      className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ACCEPTED CONNECTIONS */}
      {activeTab === 'accepted' && (
        <div className="space-y-4 animate-in fade-in">
          {acceptedInterests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No accepted connections yet</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                When you or another member accept a connection interest, verified direct contact details will be unlocked here.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Find Matches
              </Link>
            </div>
          ) : (
            acceptedInterests.map((item) => {
              const isMeSender =
                item.senderId === currentUser?.id ||
                (currentProfile && item.senderProfileId === currentProfile.id);

              const otherProfileId = isMeSender ? item.receiverProfileId : item.senderProfileId;
              const otherName = isMeSender ? item.receiverName : item.senderName;
              const otherPhoto = isMeSender ? item.receiverPhoto : item.senderPhoto;
              const targetProfile = profiles.find((p) => p.id === otherProfileId);
              const unlocked = isContactUnlocked(otherProfileId) || item.status === 'ACCEPTED';

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <img
                        src={
                          otherPhoto ||
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={otherName}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{otherName}</h4>
                          <span className="font-mono text-[10px] font-bold bg-white/80 dark:bg-card px-2 py-0.5 rounded border border-border">
                            {targetProfile?.profileIdCode || 'VRM-000002'}
                          </span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            Accepted Connection
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {targetProfile?.educationCareer?.profession || 'Professional'} • {targetProfile?.city || 'Lahore'}, Pakistan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/profile/${otherProfileId}`}
                        className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" /> Dossier
                      </Link>

                      <Link
                        href="/dashboard/messages"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Direct Chat
                      </Link>
                    </div>
                  </div>

                  {/* Contact Information Revealed (Section 20: Contact Details Privacy Unlocked) */}
                  <div className="rounded-2xl bg-card border border-border p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Mobile / WhatsApp</span>
                        <strong className="font-mono text-foreground font-bold">
                          {targetProfile?.phone || '+92 300 8492019'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Email Contact</span>
                        <strong className="text-foreground truncate block font-mono">
                          {targetProfile?.userId ? `${targetProfile.userId}@viproyalmatch.pk` : 'confidential@viproyal.pk'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gold-100 dark:bg-gold-950/60 text-gold-600 flex items-center justify-center shrink-0">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Family Guardian</span>
                        <strong className="text-foreground block">
                          {targetProfile?.familyInfo?.fatherOccupation || 'Family Representative'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: FAVORITE CONNECTIONS (Section 19: Shortlist Removed) */}
      {activeTab === 'favorites' && (
        <div className="space-y-4 animate-in fade-in">
          {favoriteProfiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No favorite connections saved</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Click "Add to Favorite Connections" on any prospective profile to bookmark them for easy family review.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProfiles.map((p) => {
                const unlocked = isContactUnlocked(p.id);

                return (
                  <div
                    key={p.id}
                    className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 w-full">
                        <img
                          src={p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
                          alt={p.fullName}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-white font-mono text-[10px] font-bold">
                          {p.profileIdCode || 'VRM-000001'}
                        </div>
                        <button
                          onClick={() => {
                            toggleFavorite(p.id);
                            toast.info(`Removed ${p.fullName} from Favorite Connections.`);
                          }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-md hover:bg-white transition"
                          title="Remove from Favorite Connections"
                        >
                          <Bookmark className="h-4 w-4 fill-rose-600" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold font-serif text-foreground truncate">{p.fullName}, {p.age}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.educationCareer?.highestDegree} • {p.educationCareer?.profession}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.city}, {p.country} • {p.caste}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${p.id}`}
                          className="flex-1 text-center rounded-xl border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                        >
                          View Dossier
                        </Link>

                        {unlocked ? (
                          <span className="flex-1 text-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 py-2 text-xs font-bold flex items-center justify-center gap-1">
                            <Unlock className="h-3 w-3" /> Unlocked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUnlockContact(p.id, p.fullName)}
                            className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 py-2 text-xs font-bold text-white shadow-sm transition flex items-center justify-center gap-1"
                          >
                            <Lock className="h-3 w-3" /> Unlock (1 Cr)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BLOCKED USERS (Section 22) */}
      {activeTab === 'blocked' && (
        <div className="space-y-4 animate-in fade-in">
          {myBlocked.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <UserX className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No blocked members</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Blocked profiles cannot send interest requests, direct messages, or view your private contact details.
              </p>
            </div>
          ) : (
            myBlocked.map((block) => {
              const blockedProfile = profiles.find((p) => p.id === block.blockedProfileId);

              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                      <UserX className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {blockedProfile?.fullName || 'Blocked Member'}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Reason: {block.reason} • Blocked on {new Date(block.blockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      unblockUser(block.blockedProfileId);
                      toast.success('User unblocked successfully.');
                    }}
                    className="rounded-xl border border-border hover:bg-muted px-4 py-1.5 text-xs font-semibold text-foreground transition"
                  >
                    Unblock User
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
