'use client';

import { Heart, UserRoundSearch, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfileAnalyticsPage() {
  const { currentProfile, interests, favorites } = useAuth();
  const interestCount = interests.filter((item) => item.receiverProfileId === currentProfile?.id || item.senderProfileId === currentProfile?.id).length;
  const favoriteCount = favorites.length;

  const metrics = [
    { label: 'Recorded profile views', value: currentProfile?.viewCount ?? 0, icon: UserRoundSearch },
    { label: 'Interest requests', value: interestCount, icon: Users },
    { label: 'Your favorite profiles', value: favoriteCount, icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Profile analytics</h1>
        <p className="mt-1 text-xs text-muted-foreground">Only values backed by current application records are shown.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <Icon className="h-5 w-5 text-brand-600" />
            <div className="mt-3 text-3xl font-black font-serif text-foreground">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Time-series traffic, search appearances, and visitor demographics are hidden until real analytics event collection is implemented.
      </div>
    </div>
  );
}
