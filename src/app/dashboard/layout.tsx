'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Compass,
  Heart,
  Bookmark,
  MessageSquare,
  Bell,
  Crown,
  ShieldCheck,
  Lock,
  BarChart3,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentProfile, notifications, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sidebarLinks = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile Dossier', href: '/dashboard/profile', icon: User },
    { name: 'Discover Matches', href: '/dashboard/discover', icon: Compass },
    { name: 'Connection Interests', href: '/dashboard/interests', icon: Heart },
    { name: 'Favorites & Shortlist', href: '/dashboard/favorites', icon: Bookmark },
    { name: 'Secure Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount },
    { name: 'Subscription & VIP', href: '/dashboard/subscription', icon: Crown },
    { name: 'Identity Verification', href: '/dashboard/verification', icon: ShieldCheck },
    { name: 'Privacy & Safety', href: '/dashboard/privacy', icon: Lock },
    { name: 'Profile Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Support & Help Desk', href: '/dashboard/support', icon: HelpCircle },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-border bg-card shadow-sm shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-rose-500 text-white shadow-md">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-foreground font-serif">
                TRUE<span className="text-brand-600">PAIR</span>
              </div>
              <div className="text-[9px] tracking-widest text-muted-foreground uppercase font-medium">
                Member Portal
              </div>
            </div>
          </Link>
        </div>

        {/* User Card Profile Summary in Sidebar */}
        <div className="p-4 border-b border-border/80 bg-brand-50/30 dark:bg-brand-950/20">
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt="Avatar"
              className="h-11 w-11 rounded-2xl object-cover ring-2 ring-brand-500/30"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-foreground truncate">{currentUser?.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  {currentUser?.subscriptionTier.replace('_', ' ')}
                </span>
                {currentUser?.isVerified && (
                  <span className="text-[10px] text-blue-600 font-semibold flex items-center">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-muted-foreground')} />
                  <span>{link.name}</span>
                </div>
                {Boolean(link.badge) && (
                  <span
                    className={cn(
                      'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      isActive ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'
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
        <div className="p-4 border-t border-border space-y-2">
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MODERATOR') && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Switch to Admin Panel
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-rose-600 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between border-b border-border bg-card p-4 sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <span className="font-serif font-bold text-base">TRUEPAIR</span>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileSidebarOpen && (
          <div className="md:hidden border-b border-border bg-card p-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold',
                  pathname === link.href ? 'bg-brand-600 text-white' : 'text-foreground hover:bg-muted'
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

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
