'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Search,
  ShieldCheck,
  Crown,
  User as UserIcon,
  Bell,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  ChevronDown,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, notifications, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR';

  const navLinks = [
    { name: 'Discover Matches', href: '/search' },
    { name: 'Pricing & Plans', href: '/pricing' },
    { name: 'Success Stories', href: '/stories' },
    { name: 'Trust & Safety', href: '/safety' },
    { name: 'About Us', href: '/about' },
  ];

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md dark:border-brand-950/40 dark:bg-card/90">
      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 shadow-md shadow-brand-600/20 text-white transition-transform group-hover:scale-105">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground font-serif">
              TRUE<span className="text-brand-600">PAIR</span>
            </div>
            <div className="text-[9px] tracking-widest text-muted-foreground uppercase font-medium">
              Matrimonial Bureau
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-600',
                  isActive ? 'text-brand-600 font-semibold' : 'text-muted-foreground'
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
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-brand-600 hover:border-brand-300"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
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
                        className="text-[11px] text-brand-600 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.slice(0, 4).map((n) => (
                        <Link
                          key={n.id}
                          href={n.linkUrl}
                          onClick={() => setNotificationsOpen(false)}
                          className={cn(
                            'block rounded-lg p-2 text-left text-xs transition',
                            !n.isRead ? 'bg-brand-50/70 dark:bg-brand-950/40' : 'hover:bg-muted'
                          )}
                        >
                          <div className="font-medium text-foreground">{n.title}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">{n.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Quick Action if Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm transition hover:bg-amber-500/20"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Admin Panel
                </Link>
              )}

              {/* User Dropdown Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted/30 py-1 pl-1 pr-3 text-xs font-semibold text-foreground transition hover:border-brand-300 hover:bg-muted/60"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-brand-500/40"
                  />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50">
                    <div className="p-2 border-b border-border/80 mb-1">
                      <div className="font-bold text-xs text-foreground truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/50">
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
                        <LayoutDashboard className="h-3.5 w-3.5 text-brand-600" />
                        Dashboard Overview
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <UserIcon className="h-3.5 w-3.5 text-brand-600" />
                        My Profile Dossier
                      </Link>
                      <Link
                        href="/dashboard/discover"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        Discover Matches
                      </Link>
                      <Link
                        href="/dashboard/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted font-medium transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                        Secure Messages
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
                        className="flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
            <>
              <Link
                href="/login"
                className="rounded-full px-5 py-2.5 text-xs font-bold text-foreground transition hover:text-brand-600"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-rose-700 active:scale-95"
              >
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card px-4 py-5 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-foreground hover:text-brand-600"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              {currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-center text-sm font-semibold text-amber-800"
                    >
                      <ShieldAlert className="h-4 w-4" /> Open Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border border-border py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-border py-2 text-center text-sm font-medium text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-brand-600 py-2 text-center text-sm font-semibold text-white"
                  >
                    Register Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
