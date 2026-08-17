'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* Hero Card Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-44 w-44 rounded-3xl shrink-0" />
            <div className="flex-1 space-y-3 py-2 w-full">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-60 rounded-xl" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 rounded-lg" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
