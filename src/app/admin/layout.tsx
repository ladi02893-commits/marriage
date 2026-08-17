'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  UserCheck,
  FileCheck,
  AlertTriangle,
  CreditCard,
  Tag,
  FileText,
  BarChart3,
  Sliders,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, verifications, reports, paymentProofs } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingVerifsCount = verifications.filter((v) => v.status === 'PENDING').length;
  const pendingPaymentsCount = (paymentProofs || []).filter((p) => p.status === 'PENDING').length;
  const openReportsCount = reports.filter((r) => r.status === 'OPEN').length;

  const adminLinks = [
    { name: 'Executive Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Payment Verifications', href: '/admin/payments', icon: CreditCard, badge: pendingPaymentsCount },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Profile Moderation', href: '/admin/profiles', icon: UserCheck },
    { name: 'ID Verifications', href: '/admin/verifications', icon: FileCheck, badge: pendingVerifsCount },
    { name: 'Abuse Reports', href: '/admin/reports', icon: AlertTriangle, badge: openReportsCount },
    { name: 'Subscriptions & Revenue', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Coupons & Vouchers', href: '/admin/coupons', icon: Tag },
    { name: 'CMS & Content', href: '/admin/cms', icon: FileText },
    { name: 'SaaS Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Platform Settings', href: '/admin/settings', icon: Sliders },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-zinc-800 bg-zinc-900 shadow-2xl shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-black shadow-md font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white font-serif">
                TRUE<span className="text-amber-500">PAIR</span>
              </div>
              <div className="text-[9px] tracking-widest text-amber-400/80 uppercase font-mono">
                Admin Control Room
              </div>
            </div>
          </Link>
        </div>

        {/* Admin Logged in pill */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
              alt="Admin Avatar"
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-500/30"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-amber-400 font-mono font-medium">{currentUser?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-zinc-950' : 'text-zinc-400')} />
                  <span>{link.name}</span>
                </div>
                {Boolean(link.badge) && (
                  <span
                    className={cn(
                      'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      isActive ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500 text-zinc-950'
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
          >
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            Switch to Member View
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-zinc-800 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4 sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-black font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="font-serif font-bold text-base text-white">TRUEPAIR ADMIN</span>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-white"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileSidebarOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-900 p-4 space-y-1">
            {adminLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold',
                  pathname === link.href ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
