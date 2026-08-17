'use client';

import React from 'react';
import { Skeleton, ProfileCardSkeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-200">
      {/* Top Search Filter Skeleton */}
      <div className="border-b border-border bg-card/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Skeleton className="h-11 rounded-2xl" />
            <Skeleton className="h-11 rounded-2xl" />
            <Skeleton className="h-11 rounded-2xl" />
            <Skeleton className="h-11 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Grid of Profile Cards Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ProfileCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
