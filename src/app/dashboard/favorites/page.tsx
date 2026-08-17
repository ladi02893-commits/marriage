'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, Users, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';

export default function FavoritesPage() {
  const { favorites, currentProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Bookmark className="h-4 w-4" /> Saved Candidate Dossiers
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">My Shortlisted Matches</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            You have shortlisted <strong>{favorites.length}</strong> candidates for further family consultation.
          </p>
        </div>

        <Link
          href="/dashboard/discover"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
        >
          Discover More Matches <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No shortlisted profiles yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
            When you browse matches, click the heart icon on any profile card to save them to your favorites for easy access.
          </p>
          <Link
            href="/dashboard/discover"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Browse Compatible Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <ProfileCard key={fav.id} profile={fav.targetProfile} />
          ))}
        </div>
      )}
    </div>
  );
}
