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
  Crown,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, verifications, reports, paymentProofs, refreshDatabase, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out from Admin Panel.');
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  // Real-time polling for the admin panel
  React.useEffect(() => {
    // Initial fetch on mount
    refreshDatabase();
    
    // Poll every 10 seconds
    const intervalId = setInterval(() => {
      refreshDatabase();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshDatabase]);

  // Role & Access Security Guard
  React.useEffect(() => {
    if (currentUser === null) {
      // If logged out completely, send to login
      const timeout = setTimeout(() => {
        router.push('/login?redirect=/admin');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentUser, router]);

  const pendingVerifsCount = verifications.filter((v) => v.status === 'PENDING').length;
  const pendingPaymentsCount = (paymentProofs || []).filter((p) => p.status === 'PENDING').length;
  const openReportsCount = reports.filter((r) => r.status === 'OPEN').length;

  const adminLinks = [
    { name: 'Executive Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Payment Verifications', href: '/admin/payments', icon: CreditCard, badge: pendingPaymentsCount },
    { name: 'User Directory & Credits', href: '/admin/users', icon: Users },
    { name: 'Senior Consultants', href: '/admin/consultants', icon: Crown },
    { name: 'Helpdesk & Support', href: '/admin/support', icon: HelpCircle },
    { name: 'Profile Approvals', href: '/admin/profiles', icon: UserCheck },
    { name: 'ID Verifications', href: '/admin/verifications', icon: FileCheck, badge: pendingVerifsCount },
    { name: 'Abuse Reports', href: '/admin/reports', icon: AlertTriangle, badge: openReportsCount },
    { name: 'Packages & Revenue', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Coupons & Vouchers', href: '/admin/coupons', icon: Tag },
    { name: 'CMS & Content', href: '/admin/cms', icon: FileText },
    { name: 'SaaS Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Platform Settings', href: '/admin/settings', icon: Sliders },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  if (currentUser && currentUser.role === 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Administrative Clearance Required</h2>
          <p className="text-xs text-zinc-400">
            Your current logged-in account ({currentUser.name}) does not have administrative privileges to access the VIP Royal Matchmaking Control Room.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-block w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                VIP ROYAL
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
              src={currentUser?.avatarUrl || '/avatar-placeholder.svg'}
              alt="Admin Avatar"
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-500/30"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-amber-400 font-mono font-medium">{currentUser?.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30 transition"
              title="Logout from Admin Panel"
            >
              <LogOut className="h-4 w-4" />
            </button>
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

        {/* Sidebar Footer - Dedicated Logout Button */}
        <div className="p-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-900/60 bg-rose-950/40 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 hover:text-white transition shadow-sm"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            Logout from Admin Panel
          </button>
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
            <span className="font-serif font-bold text-base text-white">VIP ROYAL ADMIN</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs font-bold hover:bg-rose-900/60"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-white"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
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
            <div className="pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-900/60 bg-rose-950/40 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 hover:text-white transition"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                Logout from Admin Panel
              </button>
            </div>
          </div>
        )}

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
