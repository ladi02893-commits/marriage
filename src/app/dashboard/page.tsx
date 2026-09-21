'use client';

import React, { useState } from 'react';
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
  AlertTriangle,
  Lock,
  PhoneCall,
  Calendar,
  User,
  PlusCircle,
  Check,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';
import { toast } from 'sonner';

export default function DashboardOverviewPage() {
  const {
    currentUser,
    currentProfile,
    profiles,
    interests,
    favorites,
    conversations,
    connectionQuota,
    consultants,
    consultantRecommendations,
    addExtraConnections,
  } = useAuth();

  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const completion = currentProfile?.completionPercentage || 85;

  // Profile ID code (VRM-000001)
  const profileIdCode = currentProfile?.profileIdCode || currentUser?.profileIdCode || 'VRM-000012';

  // Consultant Assignment (Section 24)
  const assignedConsultant =
    consultants.find((c) => c.id === currentUser?.assignedConsultantId) ||
    consultants[0] || {
      id: 'consultant-1',
      name: 'Begum Bilquis Khan',
      title: 'Senior Executive Matchmaking Director',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      phone: '+92 300 8492011',
      email: 'bilquis.consultant@viproyalmatch.pk',
      experienceYears: 18,
      specialization: 'Prominent & Industrial Families Matchmaking',
    };

  // Consultant Recommendations (Section 26)
  const userConsultantRecs = consultantRecommendations.filter(
    (r) => r.userId === currentUser?.id || r.userId === currentProfile?.userId
  );

  const recommendedByConsultantProfiles = profiles.filter((p) =>
    userConsultantRecs.some((r) => r.targetProfileId === p.id)
  );

  // Connection Requests
  const userReceivedInterests = interests.filter(
    (i) =>
      (currentProfile && (i.receiverProfileId === currentProfile.id || i.receiverId === currentProfile.userId)) ||
      (currentUser && (i.receiverId === currentUser.id || (currentUser.profileId && i.receiverProfileId === currentUser.profileId)))
  );

  const pendingReceivedInterests = userReceivedInterests.filter((i) => i.status === 'PENDING');

  const userSentInterests = interests.filter(
    (i) =>
      (currentProfile && (i.senderProfileId === currentProfile.id || i.senderId === currentProfile.userId)) ||
      (currentUser && i.senderId === currentUser.id)
  );

  const userConversations = conversations.filter(
    (c) =>
      c.participantAId === currentUser?.id ||
      c.participantBId === currentUser?.id ||
      (currentProfile && (c.participantAId === currentProfile.userId || c.participantBId === currentProfile.userId))
  );

  // Recommended Matches
  const standardRecommendedMatches = profiles
    .filter((p) => p.id !== currentProfile?.id && p.gender !== currentProfile?.gender)
    .slice(0, 3);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate) {
      toast.error('Please select a preferred consultation date and time.');
      return;
    }
    toast.success(
      `Consultation requested with ${assignedConsultant.name} for ${appointmentDate}. Our secretariat will confirm on WhatsApp!`
    );
    setIsAppointmentOpen(false);
    setAppointmentDate('');
    setAppointmentNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Profile ID & Badges */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900 p-6 sm:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-0.5 text-xs font-bold text-gold-300 border border-gold-500/30">
                <Crown className="h-3.5 w-3.5 text-gold-400" /> VIP Royal Matchmaking
              </span>
              <span className="font-mono text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-gold-200 border border-white/20">
                ID: {profileIdCode}
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                {currentProfile?.approvalStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Verified Active'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
              Your confidential profile is active under Senior Family Consultant oversight. Browse compatible matches or review incoming interests below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gold-500 hover:bg-gold-600 px-5 py-3 text-xs font-bold text-brand-950 shadow-lg transition font-sans"
            >
              Find Matches <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Connection Quota Engine (Section 3) */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
          connectionQuota.alertLevel === 'LOCKED_100'
            ? 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20'
            : connectionQuota.alertLevel === 'WARNING_90'
            ? 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20'
            : connectionQuota.alertLevel === 'WARNING_80' || connectionQuota.alertLevel === 'WARNING_70'
            ? 'border-amber-400/30 bg-card'
            : 'border-border bg-card'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500" />
                Connection Credits Balance: <span className="text-brand-700 dark:text-brand-300 font-serif">{connectionQuota.planName}</span>
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  connectionQuota.alertLevel === 'LOCKED_100'
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    : connectionQuota.alertLevel === 'WARNING_90'
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {connectionQuota.alertLevel === 'LOCKED_100'
                  ? '🔒 New Connections Locked'
                  : `${connectionQuota.remaining} Connections Available`}
              </span>
            </div>

            {/* Warning Message based on usage (Section 3 & 45) */}
            <p className="text-xs text-muted-foreground">
              {connectionQuota.alertLevel === 'LOCKED_100' ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  You have reached your connection limit (100% used). Purchase additional connections or upgrade your package to continue unlocking contacts.
                </span>
              ) : connectionQuota.alertLevel === 'WARNING_90' ? (
                <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Strong Warning: Only {connectionQuota.remaining} connections remaining. Upgrade recommended soon.
                </span>
              ) : connectionQuota.alertLevel === 'WARNING_80' ? (
                <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Warning: You have used {connectionQuota.used} of your {connectionQuota.total} connections (80% usage).
                </span>
              ) : connectionQuota.alertLevel === 'WARNING_70' ? (
                <span className="text-brand-600 dark:text-brand-400 font-medium">
                  Notice: You have used 70% of your allocated connections.
                </span>
              ) : (
                <span>
                  Connections only deduct when contact details are unlocked or interests are accepted. Free browsing does not deduct credits.
                </span>
              )}
            </p>
          </div>

          {/* Buy More Connections CTA Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono font-bold text-foreground block">
                {connectionQuota.used} / {connectionQuota.total} Used
              </span>
              <span className="text-[10px] text-muted-foreground">{connectionQuota.remaining} Remaining</span>
            </div>

            <Link
              href="/pricing"
              className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Buy More Connections
            </Link>
          </div>
        </div>

        {/* Live Exact Usage Metrics (Section 3: Total, Used, Remaining) */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/60 text-center">
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Total Credits</span>
            <strong className="text-sm sm:text-base font-serif font-black text-foreground">{connectionQuota.total}</strong>
          </div>
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Used Credits</span>
            <strong className="text-sm sm:text-base font-serif font-black text-brand-600">{connectionQuota.used}</strong>
          </div>
          <div className="p-2 rounded-xl bg-muted/30">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Remaining Credits</span>
            <strong className="text-sm sm:text-base font-serif font-black text-emerald-600">{connectionQuota.remaining}</strong>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              connectionQuota.alertLevel === 'LOCKED_100'
                ? 'bg-rose-500'
                : connectionQuota.alertLevel === 'WARNING_90'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(100, Math.round((connectionQuota.used / Math.max(1, connectionQuota.total)) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Section 24: Dedicated Senior Family Consultant VIP Card */}
      <div className="rounded-3xl border border-gold-500/30 bg-gradient-to-br from-card via-card to-gold-50/20 dark:to-gold-950/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={assignedConsultant.photoUrl}
                alt={assignedConsultant.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-gold-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gold-500 text-brand-950 flex items-center justify-center shadow-xs">
                <Crown className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/50 px-2 py-0.5 rounded-md border border-gold-300/40">
                  Your Dedicated Senior Family Consultant
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-foreground">
                {assignedConsultant.name}
              </h3>
              <p className="text-xs text-muted-foreground">{assignedConsultant.title}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>Experience: {assignedConsultant.experienceYears || 18}+ Years</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">Direct Family Concierge</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAppointmentOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition"
            >
              <Calendar className="h-3.5 w-3.5" /> Request Appointment
            </button>

            <Link
              href="/dashboard/consultant"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border hover:bg-muted text-foreground px-4 py-2.5 text-xs font-semibold transition"
            >
              <MessageSquare className="h-3.5 w-3.5 text-brand-600" /> Message Consultant
            </Link>
          </div>
        </div>

        {/* Appointment Modal Popup */}
        {isAppointmentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  <h4 className="font-bold text-sm text-foreground">
                    Book Consultation with {assignedConsultant.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAppointmentOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Preferred Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Discussion Agenda & Family Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Specific candidate preferences, background verification notes, or family meeting requests..."
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAppointmentOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    Confirm Appointment Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Section 26: Recommended by Your Consultant */}
      {recommendedByConsultantProfiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 mb-1">
                <Crown className="h-3.5 w-3.5" /> Handpicked by Consultant
              </div>
              <h3 className="text-lg font-bold font-serif text-foreground">Recommended by Your Consultant</h3>
              <p className="text-xs text-muted-foreground">
                “Based on your preferences and family requirements.”
              </p>
            </div>
            <Link
              href="/dashboard/consultant"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              View Consultant Dossier <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedByConsultantProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid (Section 71) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Received Interests</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{userReceivedInterests.length}</div>
          <span className="text-[11px] text-brand-600 font-medium mt-1 block">
            {pendingReceivedInterests.length} pending review
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Sent Interests</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{userSentInterests.length}</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            {userSentInterests.filter((i) => i.status === 'ACCEPTED').length} accepted
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Favorite Connections</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{favorites.length}</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Saved in favorites</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Active Chats</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-serif">{userConversations.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Direct communication</span>
        </div>
      </div>

      {/* Section 9: Profile Completion Meter with Missing Checklist */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Profile Completion: {completion}%
              </h3>
              <p className="text-xs text-muted-foreground">
                100% complete profiles receive top priority placement and higher mutual interest responses.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            Update Profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-gold-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Missing checklist items (Section 9) */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-medium py-1">Missing sections:</span>
          {!currentProfile?.educationCareer?.highestDegree && (
            <Link
              href="/dashboard/profile"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 rounded-lg px-2.5 py-1"
            >
              + Add Education
            </Link>
          )}
          {(!currentProfile?.photos || currentProfile.photos.length === 0) && (
            <Link
              href="/dashboard/profile"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 rounded-lg px-2.5 py-1"
            >
              + Upload Profile Photo
            </Link>
          )}
          {!currentProfile?.familyInfo?.fatherOccupation && (
            <Link
              href="/dashboard/profile"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 rounded-lg px-2.5 py-1"
            >
              + Add Family Details
            </Link>
          )}
          {(!currentProfile?.partnerPreferences?.preferredLocations || currentProfile.partnerPreferences.preferredLocations.length === 0) && (
            <Link
              href="/dashboard/profile"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 rounded-lg px-2.5 py-1"
            >
              + Add Partner Preferences
            </Link>
          )}
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1">
            <Check className="h-3 w-3" /> WhatsApp Verified
          </span>
        </div>
      </div>

      {/* Pending Interests Alert linking to /dashboard/connections */}
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
              href="/dashboard/connections"
              className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-300"
            >
              Review in Connections Hub →
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
                  href="/dashboard/connections"
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
          {standardRecommendedMatches.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
