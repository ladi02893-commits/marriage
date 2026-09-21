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
  Users,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentProfile, notifications, connectionQuota, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Requirements Section 18, 19, 24, 74, 75
  const sidebarLinks = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile Dossier', href: '/dashboard/profile', icon: User },
    { name: 'Find Matches', href: '/search', icon: Compass },
    { name: 'Connections', href: '/dashboard/connections', icon: Users, badge: connectionQuota.remaining > 0 ? `${connectionQuota.remaining}` : '0' },
    { name: 'Favorite Connections', href: '/dashboard/favorites', icon: Bookmark },
    { name: 'My Consultant', href: '/dashboard/consultant', icon: Crown },
    { name: 'Secure Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount },
    { name: 'Packages & Payments', href: '/dashboard/subscription', icon: CreditCard },
    { name: 'Identity Verification', href: '/dashboard/verification', icon: ShieldCheck },
    { name: 'Privacy & Photo Access', href: '/dashboard/privacy', icon: Lock },
    { name: 'Family Access', href: '/dashboard/family', icon: Users },
    { name: 'Support & Helpdesk', href: '/dashboard/support', icon: HelpCircle },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const profileIdCode = currentProfile?.profileIdCode || currentUser?.profileIdCode || 'VRM-000012';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-border bg-card shadow-sm shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-border bg-gradient-to-b from-brand-950/20 to-transparent">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-900 to-brand-700 text-gold-400 border border-gold-500/30 shadow-md">
              <Crown className="h-5 w-5 fill-gold-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-foreground font-serif leading-tight">
                VIP ROYAL
              </div>
              <div className="text-[9px] tracking-widest text-gold-600 dark:text-gold-400 uppercase font-semibold">
                Matchmaking Member
              </div>
            </div>
          </Link>
        </div>

        {/* User Profile Card Summary in Sidebar */}
        <div className="p-4 border-b border-border/80 bg-brand-50/30 dark:bg-brand-950/20 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt="Avatar"
              className="h-11 w-11 rounded-2xl object-cover ring-2 ring-gold-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-foreground truncate">{currentUser?.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100/70 dark:bg-brand-900/60 px-1.5 py-0.2 rounded">
                  {profileIdCode}
                </span>
                <span className="rounded-full bg-gold-100 px-1.5 py-0.2 text-[9px] font-bold text-gold-800 dark:bg-gold-950 dark:text-gold-300">
                  {currentUser?.subscriptionTier.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Credits Mini Badge */}
          <div className="flex items-center justify-between text-[11px] bg-background/80 rounded-xl px-2.5 py-1.5 border border-border/60">
            <span className="text-muted-foreground">Credits:</span>
            <span className="font-mono font-bold text-brand-700 dark:text-brand-300">
              {connectionQuota.remaining} / {connectionQuota.total} Left
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/dashboard/connections' && pathname === '/dashboard/interests');
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition',
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
                      'flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[9px] font-bold',
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
        <div className="p-3 border-t border-border space-y-1.5">
          {/* Consultant shortcut if VIP */}
          <Link
            href="/consultant"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-gold-300/40 bg-gold-50/40 py-2 text-[11px] font-bold text-gold-900 dark:bg-gold-950/40 dark:text-gold-300 hover:bg-gold-100 transition"
          >
            <Crown className="h-3 w-3 text-gold-600" />
            Senior Consultant Portal
          </Link>

          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MODERATOR') && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-brand-300 bg-brand-50 py-2 text-[11px] font-semibold text-brand-800 shadow-sm transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Switch to Admin Panel
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b border-border bg-card p-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-800 text-gold-400">
            <Crown className="h-4 w-4" />
          </div>
          <span className="font-bold font-serif text-sm">VIP ROYAL MATCHMAKING</span>
        </Link>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl border border-border text-foreground hover:bg-muted"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Modal */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="w-72 bg-card h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Menu</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold',
                        isActive ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
