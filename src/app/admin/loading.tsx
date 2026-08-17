'use client';

import React from 'react';
import { Skeleton, MetricCardSkeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-xl bg-zinc-800" />
          <Skeleton className="h-4 w-96 rounded-lg bg-zinc-800" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl bg-zinc-800" />
          <Skeleton className="h-9 w-28 rounded-xl bg-zinc-800" />
        </div>
      </div>

      {/* KPI Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <Skeleton className="h-4 w-28 rounded bg-zinc-800" />
            <Skeleton className="h-8 w-24 rounded-lg bg-zinc-800" />
            <Skeleton className="h-3 w-32 rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-xl bg-zinc-800" />
          <Skeleton className="h-8 w-60 rounded-xl bg-zinc-800" />
        </div>

        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded bg-zinc-800" />
                  <Skeleton className="h-3 w-24 rounded bg-zinc-800" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
              <Skeleton className="h-8 w-24 rounded-xl bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
