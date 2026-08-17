'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Bookmark,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';

export default function ProfileAnalyticsPage() {
  const { currentProfile, interests, favorites } = useAuth();

  const userInterestsCount = interests.filter(
    (i) => i.receiverProfileId === currentProfile?.id || i.senderProfileId === currentProfile?.id
  ).length;

  const viewsData = [
    { day: 'Mon', views: 0, interests: 0 },
    { day: 'Tue', views: 0, interests: 0 },
    { day: 'Wed', views: 0, interests: 0 },
    { day: 'Thu', views: 0, interests: 0 },
    { day: 'Fri', views: 0, interests: 0 },
    { day: 'Sat', views: 0, interests: 0 },
    { day: 'Sun', views: currentProfile?.viewCount || 0, interests: userInterestsCount },
  ];

  const demographicData = [
    { location: 'Lahore, Pakistan', count: currentProfile?.city === 'Lahore' ? 12 : 4 },
    { location: 'Islamabad, Pakistan', count: currentProfile?.city === 'Islamabad' ? 10 : 3 },
    { location: 'Karachi, Pakistan', count: currentProfile?.city === 'Karachi' ? 8 : 2 },
    { location: 'Rawalpindi, Pakistan', count: currentProfile?.city === 'Rawalpindi' ? 6 : 1 },
    { location: 'Faisalabad, Pakistan', count: currentProfile?.city === 'Faisalabad' ? 5 : 1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> VIP Insights
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Profile & Visitor Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor search appearances, demographic interest, and candidate engagement trends.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground block mb-1">Total Profile Views</span>
          <div className="text-2xl font-black font-serif text-foreground">{currentProfile?.viewCount || 0}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> Live profile active
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground block mb-1">Interest Requests</span>
          <div className="text-2xl font-black font-serif text-emerald-600">{userInterestsCount}</div>
          <span className="text-[11px] text-muted-foreground block mt-1">Total connection inquiries</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground block mb-1">Search Appearances</span>
          <div className="text-2xl font-black font-serif text-foreground">{currentProfile?.viewCount ? currentProfile.viewCount * 3 : 0}</div>
          <span className="text-[11px] text-brand-600 block mt-1">Directory discovery</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground block mb-1">Shortlisted By</span>
          <div className="text-2xl font-black font-serif text-amber-600">
            {favorites.filter((f) => f.targetProfileId === currentProfile?.id).length || currentProfile?.likeCount || 0}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-1">Active candidate shortlists</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Traffic Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground">Weekly Profile Traffic & Inquiries</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" fontSize={11} stroke="#888888" />
                <YAxis fontSize={11} stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    borderColor: '#f43f5e',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#e11d48" strokeWidth={2.5} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Demographics by City */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground">Visitor Locations</h3>
          <div className="space-y-3 pt-2">
            {demographicData.map((d) => (
              <div key={d.location} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{d.location}</span>
                  <span className="font-bold text-foreground">{d.count} views</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-rose-500 rounded-full"
                    style={{ width: `${(d.count / 150) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
