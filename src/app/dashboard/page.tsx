'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Eye,
  Bookmark,
  MessageSquare,
  ShieldCheck,
  Crown,
  ArrowRight,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';
import { MatchingService } from '@/lib/matching-service';

export default function DashboardOverviewPage() {
  const { currentUser, currentProfile, profiles, interests, favorites, conversations, connectionQuota } = useAuth();

  const completion = currentProfile?.completionPercentage || 85;

  const userReceivedInterests = interests.filter(
    (i) =>
      (currentProfile && (i.receiverProfileId === currentProfile.id || i.receiverId === currentProfile.userId)) ||
      (currentUser && (i.receiverId === currentUser.id || (currentUser.profileId && i.receiverProfileId === currentUser.profileId)))
  );

  const pendingReceivedInterests = userReceivedInterests.filter(
    (i) => i.status === 'PENDING'
  );

  const userConversations = conversations.filter(
    (c) =>
      c.participantAId === currentUser?.id ||
      c.participantBId === currentUser?.id ||
      (currentProfile && (c.participantAId === currentProfile.userId || c.participantBId === currentProfile.userId))
  );

  const recommendedMatches = profiles
    .filter((p) => p.id !== currentProfile?.id && p.gender !== currentProfile?.gender)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-rose-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold text-gold-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Matrimonial Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Your profile is active and receiving inquiries. Check your latest compatibility matches and interest requests below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-brand-950 shadow-lg hover:bg-gold-50 transition"
            >
              Browse Matches
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20"
            >
              Edit Dossier
            </Link>
          </div>
        </div>
      </div>

      {/* Connection / Interest Quota Bar */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
        connectionQuota.isReached
          ? 'border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border-border bg-card'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              connectionQuota.isReached
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Connection & Interest Quota ({connectionQuota.planName})
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  connectionQuota.isReached
                    ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {connectionQuota.isReached ? '🔒 Quota Limit Reached' : `${connectionQuota.remaining} Connections Left`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {connectionQuota.isReached
                  ? 'You have used all connection requests on your tier. Candidate profiles are currently locked.'
                  : `You have used ${connectionQuota.used} of ${connectionQuota.total} allocated connections for this billing period.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono font-bold text-foreground block">
                {connectionQuota.used} / {connectionQuota.total}
              </span>
              <span className="text-[10px] text-muted-foreground">Connections Used</span>
            </div>
            <Link
              href="/pricing"
              className="rounded-xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-brand-700 transition"
            >
              {connectionQuota.isReached ? '⚡ Upgrade Plan to Unlock' : 'Upgrade Quota'}
            </Link>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              connectionQuota.isReached ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(100, Math.round((connectionQuota.used / connectionQuota.total) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Profile Views</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{currentProfile?.viewCount || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> Live dossier active
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Received Interests</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">
            {userReceivedInterests.length}
          </div>
          <span className="text-[11px] text-brand-600 font-medium mt-1 block">
            {pendingReceivedInterests.length} pending review
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Shortlisted By</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">
            {favorites.filter((f) => (currentProfile && f.targetProfileId === currentProfile.id) || (currentUser && f.targetProfileId === currentUser.id)).length || currentProfile?.likeCount || 0}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Members shortlisted you</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Active Conversations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{userConversations.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Direct chat enabled</span>
        </div>
      </div>

      {/* Profile Completion Gauge Bar */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Your Matrimonial Profile is {completion}% Complete
              </h3>
              <p className="text-xs text-muted-foreground">
                Profiles over 90% complete receive 4x more connection interests and visitor engagement.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            Complete Profile <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-rose-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Pending Received Interests Alert */}
      {pendingReceivedInterests.length > 0 && (
        <div className="rounded-3xl border border-brand-200 bg-brand-50/60 p-6 dark:border-brand-900 dark:bg-brand-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-600 fill-brand-600" />
              <h3 className="text-sm font-bold text-brand-950 dark:text-brand-100">
                Pending Connection Interests ({pendingReceivedInterests.length})
              </h3>
            </div>
            <Link
              href="/dashboard/interests"
              className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-300"
            >
              Review All Interests →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingReceivedInterests.slice(0, 2).map((intReq) => (
              <div
                key={intReq.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-brand-100 dark:bg-card dark:border-border"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={intReq.senderPhoto || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'}
                    alt={intReq.senderName}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{intReq.senderName}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">"{intReq.message}"</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/interests"
                  className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Respond
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-foreground">Top Recommended Matches</h3>
            <p className="text-xs text-muted-foreground">Computed by weighted partner compatibility algorithm</p>
          </div>
          <Link
            href="/dashboard/discover"
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            Explore All Matches <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedMatches.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return <ArrowRight {...props} />;
}
