'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Crown,
  Heart,
  ShieldCheck,
  User as UserIcon,
  Bell,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentProfile, notifications, connectionQuota, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN';
  const isConsultant = currentUser?.role === 'CONSULTANT';

  React.useEffect(() => {
    if (isAdmin && !pathname.startsWith('/admin')) {
      router.replace('/admin');
    }
  }, [isAdmin, pathname, router]);

  // Guest nav links
  const guestNavLinks = [
    { name: 'Find Matches', href: '/search' },
    { name: 'Connection Packages', href: '/pricing' },
    { name: 'Senior Consultant', href: '/#consultant' },
    { name: 'Success Stories', href: '/stories' },
    { name: 'Safety & Privacy', href: '/safety' },
  ];

  // User nav links (Section 74)
  const userNavLinks = [
    { name: 'Find Matches', href: '/search' },
    { name: 'Recommended', href: '/dashboard/discover' },
    { name: 'Connections', href: '/dashboard/connections' },
    { name: 'Favorite Connections', href: '/dashboard/connections?tab=favorites' },
    { name: 'My Consultant', href: '/dashboard/consultant' },
    { name: 'Packages', href: '/pricing' },
    { name: 'Helpdesk', href: '/dashboard/support' },
  ];

  const activeNavLinks = currentUser ? userNavLinks : guestNavLinks;

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      {/* Top Royal Ribbon */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-navy-900 px-4 py-1.5 text-center text-[11px] font-medium text-white shadow-inner hidden sm:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-gold-300 font-semibold tracking-wide">
              <Crown className="h-3 w-3 text-gold-400" /> VIP Royal Matchmaking
            </span>
            <span className="text-brand-200">|</span>
            <span className="text-white/80">Pakistan’s Premier Connection-Based Matrimonial Platform</span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <span>Verified Profiles</span>
            <span>Dedicated Family Consultants</span>
            <span>Discreet & Secure</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-gold-600 shadow-md shadow-brand-900/20 text-white transition-transform group-hover:scale-105 border border-gold-400/30">
            <Crown className="h-5 w-5 text-gold-300" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-serif leading-none">
              VIP <span className="text-brand-800 font-extrabold">ROYAL</span>
            </div>
            <div className="text-[8px] tracking-[0.2em] text-gold-700 uppercase font-bold mt-0.5">
              Matchmaking Concierge
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {activeNavLinks.map((link) => {
            const isActive = pathname === link.href.split('?')[0];
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-xs font-semibold tracking-tight transition-colors hover:text-brand-800',
                  isActive ? 'text-brand-900 font-bold underline decoration-gold-500 decoration-2 underline-offset-8' : 'text-muted-foreground'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Connection Credits Counter Pill (Section 3) */}
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-50/60 dark:bg-gold-950/20 px-3.5 py-1.5 text-xs transition hover:bg-gold-100/70"
                title={`${connectionQuota.remaining} remaining connections out of ${connectionQuota.total}`}
              >
                <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                <span className="font-bold text-foreground text-[11px]">
                  {connectionQuota.remaining} <span className="font-normal text-muted-foreground">Credits</span>
                </span>
                <span className="rounded-full bg-brand-800 px-1.5 py-0.2 text-[9px] font-bold text-white">
                  Buy +
                </span>
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-brand-800 hover:border-gold-300"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-semibold text-xs text-foreground">Notifications</span>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] text-brand-800 hover:underline font-semibold"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">No new notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <Link
                            key={n.id}
                            href={n.linkUrl || '/dashboard/connections'}
                            onClick={() => setNotificationsOpen(false)}
                            className={cn(
                              'block rounded-lg p-2 text-left text-xs transition',
                              !n.isRead ? 'bg-brand-50/70 border-l-2 border-brand-800' : 'hover:bg-muted'
                            )}
                          >
                            <div className="font-bold text-foreground">{n.title}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">{n.description}</div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Consultant Portal Link if Consultant */}
              {(isConsultant || isAdmin) && (
                <Link
                  href="/consultant"
                  className="flex items-center gap-1.5 rounded-full border border-gold-400 bg-gold-500/10 px-3 py-1.5 text-xs font-bold text-gold-800 dark:text-gold-300 transition hover:bg-gold-500/20"
                >
                  <Crown className="h-3.5 w-3.5 text-gold-600" />
                  Consultant
                </Link>
              )}

              {/* Admin Quick Action if Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-brand-800/40 bg-brand-900/10 px-3.5 py-1.5 text-xs font-bold text-brand-900 dark:text-brand-300 transition hover:bg-brand-900/20"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-brand-800" />
                  Admin
                </Link>
              )}

              {/* User Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3 text-xs font-semibold text-foreground transition hover:border-gold-300"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      '/avatar-placeholder.svg'
                    }
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-gold-400"
                  />
                  <div className="text-left hidden md:block">
                    <span className="block font-bold text-xs truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                    <span className="block font-mono text-[9px] text-gold-700 font-semibold">{currentUser.profileIdCode || 'VRM-MEMBER'}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50">
                    <div className="p-2 border-b border-border/80 mb-1">
                      <div className="font-bold text-xs text-foreground truncate">{currentUser.name}</div>
                      <div className="text-[10px] font-mono text-gold-700 font-bold">{currentUser.profileIdCode || 'ID pending'}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-800 border border-brand-200">
                          {currentUser.subscriptionTier.replace('_', ' ')}
                        </span>
                        {currentUser.isVerified && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-brand-800" />
                        Dashboard Overview
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <UserIcon className="h-3.5 w-3.5 text-brand-800" />
                        My Profile Dossier
                      </Link>
                      <Link
                        href="/dashboard/connections"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <Heart className="h-3.5 w-3.5 text-rose-600" />
                        Connections Hub
                      </Link>
                      <Link
                        href="/dashboard/consultant"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <Crown className="h-3.5 w-3.5 text-gold-600" />
                        My Family Consultant
                      </Link>
                      <Link
                        href="/dashboard/support"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                        Helpdesk & Support
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                          Admin Control Room
                        </Link>
                      )}
                    </div>

                    <div className="mt-1 pt-1 border-t border-border/80">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-xs font-bold text-foreground transition hover:text-brand-800"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-900 via-brand-800 to-rose-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] border border-gold-400/40"
              >
                <Crown className="h-3.5 w-3.5 text-gold-300" />
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          {currentUser && (
            <Link
              href="/pricing"
              className="flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-bold text-gold-800"
            >
              <Sparkles className="h-3 w-3 text-gold-600" />
              {connectionQuota.remaining}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card p-4 space-y-3">
          <div className="space-y-1">
            {activeNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2">
                  <span className="font-bold text-foreground">{currentUser.name}</span>
                  <span className="font-mono text-gold-700 font-bold">{currentUser.profileIdCode || 'ID pending'}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl bg-brand-900 py-2.5 text-center text-xs font-bold text-white shadow-sm"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center text-xs font-semibold text-rose-600 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-border py-2 text-center text-xs font-bold text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-brand-900 py-2.5 text-center text-xs font-bold text-white"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
