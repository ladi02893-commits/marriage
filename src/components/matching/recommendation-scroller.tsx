'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Briefcase, GraduationCap, Heart, ShieldCheck } from 'lucide-react';
import { MatrimonialProfile } from '@/lib/types';
import { MatchingService } from '@/lib/matching-service';

interface RecommendationScrollerProps {
  currentProfile?: MatrimonialProfile | null;
  profiles: MatrimonialProfile[];
  excludeProfileId?: string;
  title?: string;
  subtitle?: string;
}

export function RecommendationScroller({
  currentProfile,
  profiles,
  excludeProfileId,
  title = 'You May Also Like',
  subtitle = 'AI-recommended similar profiles based on mutual background, education & lifestyle compatibility.',
}: RecommendationScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter similar candidates
  const candidates = profiles
    .filter((p) => {
      if (excludeProfileId && p.id === excludeProfileId) return false;
      if (currentProfile && p.id === currentProfile.id) return false;
      if (currentProfile && p.gender === currentProfile.gender) return false;
      return true;
    })
    .map((candidate) => {
      const compatibility = currentProfile
        ? MatchingService.calculateCompatibility(currentProfile, candidate)
        : { overallScore: 88 + Math.floor(Math.random() * 10) };
      return {
        ...candidate,
        compatibilityScore: compatibility.overallScore,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  if (candidates.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-0.5">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" /> Curated Match Suggestions
          </div>
          <h3 className="text-xl font-bold font-serif text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-muted transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-muted transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroller Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {candidates.map((profile) => {
          const photoUrl =
            profile.photos?.[0]?.url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

          return (
            <Link
              key={profile.id}
              href={`/profile/${profile.id}`}
              className="group relative flex-none w-72 snap-start rounded-3xl border border-border bg-card p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted mb-3">
                <img
                  src={photoUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Compatibility Score Tag */}
                <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-gold-300 backdrop-blur-md border border-gold-500/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-gold-400" />
                  {profile.compatibilityScore}%
                </div>

                {/* Verified Badge */}
                {profile.verificationBadge === 'VERIFIED' && (
                  <div className="absolute top-2.5 left-2.5 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </div>
                )}

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold truncate">{profile.displayName}</h4>
                  <p className="text-[11px] text-zinc-200">
                    {profile.age} yrs • {profile.lifestyle?.height || "5' 6\""}
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                  <span className="truncate">{profile.educationCareer?.highestDegree}</span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{profile.educationCareer?.profession}</span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">
                    {profile.city}, {profile.country}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px]">
                <span className="font-semibold text-brand-600 group-hover:underline">
                  View Full Dossier →
                </span>
                <span className="text-muted-foreground">{profile.religion}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
