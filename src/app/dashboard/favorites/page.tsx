'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';

export default function FavoritesPage() {
  const { favorites, profiles, currentUser } = useAuth();

  const userFavorites = favorites.filter((f) => f.userId === currentUser?.id);
  const favoriteProfiles = profiles.filter((p) =>
    userFavorites.some((f) => f.targetProfileId === p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Bookmark className="h-4 w-4" /> VIP Bookmarked Matches
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Favorite Connections</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            You have saved <strong>{favoriteProfiles.length}</strong> profiles in your Favorite Connections list.
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
        >
          Find More Matches <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {favoriteProfiles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No favorite connections yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
            When you browse matches, click "Add to Favorite Connections" on any profile to save them for easy family consultation.
          </p>
          <Link
            href="/search"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Browse Compatible Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteProfiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
