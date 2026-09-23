'use client';

import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
        <BarChart3 className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold font-serif text-white">Historical analytics are not available</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
          The former charts used sample visitor, conversion, and demographic numbers. They have been removed. This page will remain disabled until real event tracking and aggregated reporting are connected.
        </p>
      </div>
    </div>
  );
}
