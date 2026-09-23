'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboardPage() {
  const { users, verifications, reports, paymentProofs } = useAuth();
  const [liveStats, setLiveStats] = React.useState<{
    totalUsers: number;
    verifiedUsers: number;
    premiumUsers: number;
    pendingVerifs: number;
    openReports: number;
    pendingPayments: number;
    totalRevenue: number;
  } | null>(null);

  React.useEffect(() => {
    const fetchStats = () => {
      fetch('/api/admin/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setLiveStats(data.data);
          }
        })
        .catch((err) => console.error('Error fetching live admin stats', err));
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const totalUsers = liveStats?.totalUsers ?? users.length;
  const verifiedUsers = liveStats?.verifiedUsers ?? users.filter((u) => u.isVerified).length;
  const premiumUsers = liveStats?.premiumUsers ?? users.filter((u) => u.subscriptionTier !== 'FREE').length;
  const pendingVerifs = liveStats?.pendingVerifs ?? verifications.filter((v) => v.status === 'PENDING').length;
  const pendingPayments = liveStats?.pendingPayments ?? paymentProofs.filter((p) => p.status === 'PENDING').length;
  const totalRevenue = liveStats?.totalRevenue ?? paymentProofs.filter((p) => p.status === 'VERIFIED').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
            Platform Executive Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-0.5">
            Admin Overview & Operations
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time platform operations, verified candidate profiles, and financial ledger control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <Receipt className="h-4 w-4" /> Pending Payments ({pendingPayments})
          </Link>
          <Link
            href="/admin/verifications"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
          >
            <FileCheck className="h-4 w-4" /> Verifications ({pendingVerifs})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Registered Members</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-white">{totalUsers} Registered</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Current account count
          </div>
        </div>

        {/* Package & Connection Revenue */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Package & Connection Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-emerald-400">
            PKR {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            From verified connection packages
          </div>
        </div>

        {/* Premium VIP Subscribers */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Paid VIP Members</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-white">{premiumUsers} Members</div>
          <div className="text-[11px] text-zinc-400">
            Active upgraded accounts
          </div>
        </div>

        {/* Verification & Trust */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">ID Verification Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-blue-400">
            {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%
          </div>
          <div className="text-[11px] text-zinc-400">
            {verifiedUsers} of {totalUsers} ID Badged
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200">
        Daily activity and historical revenue charts are hidden until time-series reporting is connected to real transaction and registration records.
      </div>

      {/* Moderation & Quick Action Desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Verifications */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Pending ID Verifications</h3>
            </div>
            <Link href="/admin/verifications" className="text-xs font-bold text-amber-400 hover:underline">
              View Queue →
            </Link>
          </div>

          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No pending identity verification requests in queue.
              </div>
            ) : (
              verifications.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <img src={v.selfieUrl} alt={v.userName} className="h-10 w-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{v.userName}</h4>
                      <p className="text-[11px] text-zinc-400">{v.documentType} • Submitted recently</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      v.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : v.status === 'PENDING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Abuse Reports */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Abuse & Harassment Queue</h3>
            </div>
            <Link href="/admin/reports" className="text-xs font-bold text-rose-400 hover:underline">
              Moderation Desk →
            </Link>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No open reports are currently recorded.
              </div>
            ) : (
              reports.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800/80">
                  <div>
                    <h4 className="text-xs font-bold text-white">Against {r.reportedUserName}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{r.category}: "{r.description}"</p>
                  </div>
                  <span className="rounded-full bg-rose-950 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
