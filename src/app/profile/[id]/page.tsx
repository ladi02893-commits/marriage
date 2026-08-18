'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  ShieldCheck,
  Crown,
  MapPin,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Send,
  MessageSquare,
  Share2,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Home,
  Utensils,
  Languages,
  BookOpen,
  Calendar,
  Eye,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CompatibilityMeter } from '@/components/matching/compatibility-meter';
import { RecommendationScroller } from '@/components/matching/recommendation-scroller';
import { SendInterestModal } from '@/components/profile/send-interest-modal';
import { ReportModal } from '@/components/profile/report-modal';
import { useAuth } from '@/lib/auth-context';
import { MatchingService } from '@/lib/matching-service';
import { toast } from 'sonner';
import { formatIncomeByCountry } from '@/lib/currency';
import { QuotaLimitModal } from '@/components/ui/quota-limit-modal';
import { AdminUserDossierModal } from '@/components/admin/admin-user-dossier-modal';
import { User } from '@/lib/types';

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const {
    profiles,
    users,
    currentProfile,
    currentUser,
    toggleFavorite,
    isFavorited,
    interests,
    startOrGetConversation,
    canViewContactDetails,
    connectionQuota,
  } = useAuth();

  const profile = profiles.find((p) => p.id === profileId) || profiles[1] || profiles[0];
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isAdminDossierOpen, setIsAdminDossierOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaAction, setQuotaAction] = useState<'INTEREST' | 'MESSAGE' | 'CONTACT'>('INTEREST');

  const favorited = isFavorited(profile.id);

  const hasSentInterest = interests.some(
    (i) =>
      (i.senderId === currentUser?.id || (currentProfile && i.senderProfileId === currentProfile.id)) &&
      i.receiverProfileId === profile.id
  );

  const interestReq = interests.find(
    (i) =>
      ((i.senderId === currentUser?.id || (currentProfile && i.senderProfileId === currentProfile.id)) &&
        i.receiverProfileId === profile.id) ||
      (i.senderProfileId === profile.id && (i.receiverId === currentUser?.id || (currentProfile && i.receiverProfileId === currentProfile.id)))
  );

  const isMutual = interestReq?.status === 'ACCEPTED';

  // Compute Compatibility
  const compatibility = currentProfile
    ? MatchingService.calculateCompatibility(currentProfile, profile)
    : {
        overallScore: 92,
        ageScore: 95,
        locationScore: 90,
        educationScore: 95,
        professionScore: 90,
        lifestyleScore: 90,
        familyScore: 90,
        maritalScore: 95,
        matchReasons: ['Shared professional goals and family values'],
        improvementTips: [],
      };

  const handleFavoriteClick = () => {
    const added = toggleFavorite(profile.id);
    if (added) {
      toast.success(`Shortlisted ${profile.displayName} to favorites.`);
    } else {
      toast.info(`Removed ${profile.displayName} from favorites.`);
    }
  };

  const handleStartChat = () => {
    if (!currentUser) {
      toast.info('Please sign in to message this member.');
      return;
    }
    if (!isMutual && connectionQuota.isReached && currentUser.role === 'USER') {
      setQuotaAction('MESSAGE');
      setQuotaModalOpen(true);
      return;
    }
    const convId = startOrGetConversation(profile.userId);
    router.push('/dashboard/messages');
  };

  const handleExpressInterest = () => {
    if (hasSentInterest) {
      toast.info('Interest already sent to this profile.');
      return;
    }
    if (connectionQuota.isReached) {
      setQuotaAction('INTEREST');
      setQuotaModalOpen(true);
      return;
    }
    setInterestModalOpen(true);
  };

  const handleRequestContact = () => {
    if (connectionQuota.isReached) {
      setQuotaAction('CONTACT');
      setQuotaModalOpen(true);
      return;
    }
    setInterestModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile URL copied to clipboard!');
    }
  };

  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800', isPrimary: true, isApproved: true, order: 1 }];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Admin Inspection Quick Bar */}
      {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
        <div className="bg-zinc-950 border-b border-amber-500/30 px-4 py-2.5 text-xs text-zinc-300">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 font-bold text-[10px] uppercase">
                Admin Control Room
              </span>
              <span>
                Auditing candidate dossier for <strong>{profile.fullName}</strong>. Inspect outbound & inbound connections.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminDossierOpen(true)}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1 text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5" /> Inspect Connections & Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Quota Notice Bar */}
      {connectionQuota.isReached && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2.5 text-xs font-semibold shadow-md">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                <strong>Connection Limit Reached ({connectionQuota.used}/{connectionQuota.total} Used):</strong> Upgrade plan to connect with {profile.displayName} and unlock direct WhatsApp contact.
              </span>
            </div>
            <button
              onClick={() => {
                setQuotaAction('INTEREST');
                setQuotaModalOpen(true);
              }}
              className="rounded-xl bg-white px-4 py-1 text-xs font-bold text-amber-800 hover:bg-zinc-100 shadow-sm shrink-0 cursor-pointer"
            >
              ⚡ Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="border-b border-border bg-card py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Match Directory
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" /> Share Dossier
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Photos & Highlights & Sticky Action Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Photo Card */}
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
              <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-muted">
                <img
                  src={photos[selectedPhotoIdx]?.url || photos[0].url}
                  alt={profile.fullName}
                  className="h-full w-full object-cover object-center"
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {profile.verificationBadge === 'APPROVED' && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 border-[3px] border-zinc-900 shadow-xl" title="Verified Member">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {profile.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md">
                      <Crown className="h-4 w-4" /> Featured
                    </span>
                  )}
                </div>

                <button
                  onClick={handleFavoriteClick}
                  className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md shadow-md transition ${
                    favorited
                      ? 'bg-rose-600 text-white'
                      : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${favorited ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 1 && (
                <div className="flex items-center gap-3 p-4 bg-muted/20 border-t border-border overflow-x-auto">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhotoIdx(idx)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                        selectedPhotoIdx === idx
                          ? 'border-brand-600 ring-2 ring-brand-500/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <button
                type="button"
                onClick={handleExpressInterest}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition shadow-md cursor-pointer ${
                  hasSentInterest
                    ? 'bg-emerald-600 text-white'
                    : connectionQuota.isReached
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                    : 'bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 text-white shadow-brand-600/25 hover:from-brand-700'
                }`}
              >
                {hasSentInterest ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Connection Interest Sent
                  </>
                ) : connectionQuota.isReached ? (
                  <>
                    <Lock className="h-4 w-4" /> Express Matrimonial Interest (Limit Reached)
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Express Matrimonial Interest
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStartChat}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                <MessageSquare className="h-4 w-4 text-brand-600" />
                {isMutual ? 'Open Active Chat' : 'Send Message / Chat'}
              </button>

              <div className="pt-2 text-center text-[11px] text-muted-foreground">
                🔒 Protected by Consent-Based Privacy Protocol
              </div>
            </div>

            {/* Consent-Based Contact Details Card (Workflow Version 1.0) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified Contact Details
                </h4>
                {canViewContactDetails(profile.id) ? (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    Unlocked
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Locked
                  </span>
                )}
              </div>

              {canViewContactDetails(profile.id) ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Direct Mobile:</span>
                      <span className="font-bold text-foreground font-mono">
                        {profile.phone || '+92 300 1234567'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Primary Location:</span>
                      <span className="font-medium text-foreground">{profile.city}, {profile.country}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://wa.me/${(profile.phone || '923001234567').replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(profile.displayName)},%20I%20reviewed%20your%20matrimonial%20profile%20on%20Compatible%20Matrimonials.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 font-bold text-white shadow-sm hover:bg-emerald-700 text-center"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${profile.phone || '+923001234567'}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 py-2 font-bold text-foreground hover:bg-muted text-center"
                    >
                      Call Direct
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-center py-2">
                  <div className="rounded-2xl bg-muted/40 p-3 text-muted-foreground leading-relaxed text-[11px]">
                    <Lock className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                    <strong>Privacy Vault Protocol:</strong> Direct phone and WhatsApp contact details remain confidential until both members mutually accept an interest request.
                  </div>
                  {!hasSentInterest && (
                    <button
                      onClick={handleRequestContact}
                      className="w-full rounded-xl bg-brand-600/90 hover:bg-brand-600 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                    >
                      Request Contact Access
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Compatibility Breakdown Card */}
            <CompatibilityMeter breakdown={compatibility as any} />
          </div>

          {/* Right Column: In-Depth Matrimonial Dossier */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Bio Box */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                    {profile.fullName}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile.displayName} • Profile ID: {profile.id} • Active Member
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {profile.verificationBadge === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                      <ShieldCheck className="h-4 w-4" /> Identity Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                      <AlertTriangle className="h-4 w-4" /> Unverified Member
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Headline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Candidate</h4>
                <p className="text-sm font-medium italic text-foreground leading-relaxed">
                  "{profile.bioHeadline}"
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1 whitespace-pre-line">
                  {profile.aboutMe}
                </p>
              </div>

              {/* Summary Attributes Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-border mt-6 text-xs">
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Age</span>
                  <span className="font-semibold text-foreground">{profile.age} Years</span>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Marital Status</span>
                  <span className="font-semibold text-foreground">{profile.maritalStatus?.replace('_', ' ')}</span>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Location</span>
                  <span className="font-semibold text-foreground">{profile.city}, {profile.country}</span>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Religion & Sect</span>
                  <span className="font-semibold text-foreground">{profile.religion} {profile.sectOrCommunity ? `(${profile.sectOrCommunity})` : ''}</span>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Mother Tongue</span>
                  <span className="font-semibold text-foreground">{profile.motherTongue}</span>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <span className="text-[11px] text-muted-foreground block">Height</span>
                  <span className="font-semibold text-foreground">{profile.lifestyle?.height || "5' 9\""}</span>
                </div>
              </div>
            </div>

            {/* Education & Career Dossier */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <GraduationCap className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-bold font-serif text-foreground">Education & Profession</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Highest Qualification</span>
                  <span className="font-bold text-foreground text-sm">{profile.educationCareer?.highestDegree}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">University / College</span>
                  <span className="font-bold text-foreground text-sm">{profile.educationCareer?.institution}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Profession Sector</span>
                  <span className="font-bold text-foreground text-sm">{profile.educationCareer?.profession}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Estimated Annual Income</span>
                  <span className="font-bold text-foreground text-sm font-mono">{formatIncomeByCountry(profile.educationCareer?.annualIncome, profile.country)}</span>
                </div>
              </div>
            </div>

            {/* Family Heritage & Values */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <Home className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-bold font-serif text-foreground">Family & Background</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Family Type & Values</span>
                  <span className="font-bold text-foreground text-sm">
                    {profile.familyInfo?.familyType || 'Nuclear'} • {profile.familyInfo?.familyValues || 'Moderate'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Father's Profession</span>
                  <span className="font-bold text-foreground text-sm">{profile.familyInfo?.fatherOccupation || 'Respected Business / Professional'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Mother's Status</span>
                  <span className="font-bold text-foreground text-sm">{profile.familyInfo?.motherOccupation || 'Homemaker'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Siblings</span>
                  <span className="font-bold text-foreground text-sm">
                    {profile.familyInfo?.brothersCount ?? 1} Brother(s), {profile.familyInfo?.sistersCount ?? 1} Sister(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Partner Expectations */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <Heart className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-bold font-serif text-foreground">Partner Preferences & Expectations</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{profile.partnerPreferences?.expectationsNotes || 'Seeking an educated, sincere, family-oriented partner with shared religious values and mutual respect.'}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Religion: <strong>{profile.partnerPreferences?.religions?.join(', ') || profile.religion}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Preferred Regions: <strong>{profile.partnerPreferences?.preferredLocations?.join(', ') || profile.country}</strong>
                  </span>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 text-xs text-brand-900 dark:text-brand-200">
                  <strong>Notes on Compatibility:</strong> {profile.partnerPreferences?.expectationsNotes || 'Values family harmony, mutual respect, and intellectual alignment.'}
                </div>
              </div>
            </div>

            {/* AI Profile Intelligence & Verification Audit (Workflow Version 1.0) */}
            <div className="rounded-3xl border border-gold-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-500" />
                  <h3 className="text-base font-bold font-serif text-foreground">AI Profile Intelligence & Trust Audit</h3>
                </div>
                <span className="rounded-full bg-gold-500/10 px-3 py-1 text-[11px] font-bold text-gold-600 dark:text-gold-400 border border-gold-500/20">
                  AI Processed v1.0
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {profile.aiSummary ||
                    `AI profile analysis highlights exceptional educational pedigree in ${profile.educationCareer?.highestDegree} and professional stability in ${profile.educationCareer?.profession}. Background matches verified family reputation and moderate lifestyle preferences.`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-2xl bg-muted/30 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Profile Quality</span>
                    <span className="text-lg font-black text-emerald-600 font-serif">
                      {profile.profileQualityScore || 98}%
                    </span>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Fraud Risk Index</span>
                    <span className="text-lg font-black text-blue-600 font-serif">
                      {profile.fraudScore ? `${profile.fraudScore}%` : '0% (Verified)'}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Match Probability</span>
                    <span className="text-lg font-black text-brand-600 font-serif">
                      {compatibility.overallScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like - Horizontal Recommendation Scroller */}
        <div className="mt-14 pt-10 border-t border-border">
          <RecommendationScroller
            currentProfile={currentProfile}
            profiles={profiles}
            excludeProfileId={profile.id}
          />
        </div>
      </div>

      {/* Send Interest Modal */}
      {interestModalOpen && (
        <SendInterestModal
          profile={profile}
          isOpen={interestModalOpen}
          onClose={() => setInterestModalOpen(false)}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          reportedUserId={profile.userId}
          reportedUserName={profile.fullName}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Admin Dossier & Connection History Modal */}
      {isAdminDossierOpen && (
        <AdminUserDossierModal
          isOpen={isAdminDossierOpen}
          onClose={() => setIsAdminDossierOpen(false)}
          user={
            users.find((u) => u.id === profile.userId || u.profileId === profile.id) ||
            ({
              id: profile.userId || `user-${profile.id}`,
              email: `${profile.displayName.toLowerCase().replace(/\s+/g, '')}@example.com`,
              name: profile.fullName,
              role: 'USER',
              subscriptionTier: 'FREE',
              isVerified: profile.verificationBadge === 'APPROVED',
              accountStatus: 'ACTIVE',
              createdAt: profile.createdAt,
              profileId: profile.id,
            } as User)
          }
          profile={profile}
        />
      )}

      <Footer />
    </div>
  );
}
