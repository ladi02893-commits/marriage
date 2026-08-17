'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-muted/70 dark:bg-zinc-800/80 ${className}`}
      {...props}
    />
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-3.5 w-1/2 rounded-md" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/60">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Skeleton className="h-9 rounded-xl" />
        <Skeleton className="h-9 rounded-xl" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/60">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded" />
        </td>
      ))}
    </tr>
  );
}

// Dashboard Metric Card Skeleton
export function MetricCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-3 w-36 rounded" />
    </div>
  );
}
