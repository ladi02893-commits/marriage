'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Send,
  Check,
  Eye,
  Crown,
  Lock,
} from 'lucide-react';
import { MatrimonialProfile } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { MatchingService } from '@/lib/matching-service';
import { SendInterestModal } from './send-interest-modal';
import { QuotaLimitModal } from '@/components/ui/quota-limit-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: MatrimonialProfile;
  className?: string;
  showScore?: boolean;
}

export function ProfileCard({ profile, className, showScore = true }: ProfileCardProps) {
  const { currentUser, currentProfile, toggleFavorite, isFavorited, interests, connectionQuota } = useAuth();
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);

  const favorited = isFavorited(profile.id);

  // Compute compatibility score if current user has a profile
  const compatibility = currentProfile
    ? MatchingService.calculateCompatibility(currentProfile, profile)
    : { overallScore: 88, matchReasons: ['High lifestyle & values match'] };

  const hasSentInterest = interests.some(
    (i) =>
      (i.senderId === currentUser?.id || (currentProfile && i.senderProfileId === currentProfile?.id)) &&
      i.receiverProfileId === profile.id
  );

  const primaryPhoto =
    profile.photos?.find((p) => p.isPrimary)?.url ||
    profile.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(profile.id);
    if (added) {
      toast.success(`Shortlisted ${profile.displayName} to your favorites!`);
    } else {
      toast.info(`Removed ${profile.displayName} from favorites.`);
    }
  };

  const handleInterestAction = () => {
    if (hasSentInterest) {
      toast.info('Interest is already sent to this profile.');
      return;
    }

    if (connectionQuota.isReached) {
      setQuotaModalOpen(true);
      return;
    }

    setInterestModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 hover:border-brand-300 dark:hover:border-brand-800',
          className
        )}
      >
        {/* Photo Container with overlay */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={primaryPhoto}
            alt={profile.fullName}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges on Photo */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
            {profile.verificationBadge === 'APPROVED' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> ID Verified
              </span>
            )}
            {profile.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                <Crown className="h-3.5 w-3.5" /> Featured
              </span>
            )}
          </div>

          {/* Shortlist Heart Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition z-10 shadow-sm',
              favorited
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-black/30 text-white hover:bg-black/50 hover:text-rose-400'
            )}
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-white')} />
          </button>

          {/* Compatibility Meter Tag on bottom corner of photo */}
          {showScore && (
            <div className="absolute bottom-2.5 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                <span className="text-emerald-400">{compatibility.overallScore}%</span> Match
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Header & Location */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-brand-600 transition">
                {profile.displayName}, <span className="text-muted-foreground font-normal">{profile.age} yrs</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              <span className="line-clamp-1">
                {profile.city}, {profile.country}
              </span>
            </div>
          </div>

          {/* Key Attributes Tags */}
          <div className="mb-4 space-y-1.5 text-xs text-foreground/90">
            <div className="flex items-center gap-2 line-clamp-1">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="line-clamp-1">{profile.educationCareer?.profession || 'Professional'}</span>
            </div>
            <div className="flex items-center gap-2 line-clamp-1">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="line-clamp-1">{profile.educationCareer?.highestDegree || "Bachelor's Degree"}</span>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2 italic">
            "{profile.bioHeadline || profile.aboutMe}"
          </p>

          {/* Action Footer */}
          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-border/80">
            <Link
              href={`/profile/${profile.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted hover:border-brand-300"
            >
              <Eye className="h-3.5 w-3.5" /> View Profile
            </Link>

            <button
              onClick={handleInterestAction}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition shadow-sm cursor-pointer',
                hasSentInterest
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : connectionQuota.isReached
                  ? 'bg-amber-500/15 text-amber-600 border border-amber-500/40 hover:bg-amber-500/25'
                  : 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-brand-600/20 hover:from-brand-700 hover:to-rose-700'
              )}
            >
              {hasSentInterest ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Sent
                </>
              ) : connectionQuota.isReached ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-600" /> Send Interest
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send Interest
                </>
              )}
            </button>
          </div>
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

      {/* Quota Limit Popup Modal */}
      {quotaModalOpen && (
        <QuotaLimitModal
          isOpen={quotaModalOpen}
          onClose={() => setQuotaModalOpen(false)}
          actionAttempted="INTEREST"
        />
      )}
    </>
  );
}
