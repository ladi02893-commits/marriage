import React from 'react';
import Link from 'next/link';
import { Crown, ShieldCheck, Lock, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gold-200/60 bg-white dark:border-brand-950 dark:bg-card">
      {/* Trust Highlights Strip */}
      <div className="border-b border-border/80 bg-brand-50/40 py-8 dark:bg-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-gold-300 shadow-sm">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Family Consultants</h4>
                <p className="text-xs text-muted-foreground">Dedicated senior matchmaker concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300">
                <ShieldCheck className="h-5 w-5 text-gold-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Verified Profiles</h4>
                <p className="text-xs text-muted-foreground">Manual ID & WhatsApp authentication</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-100 text-navy-800 dark:bg-navy-950 dark:text-navy-300">
                <Lock className="h-5 w-5 text-navy-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Private & Controlled</h4>
                <p className="text-xs text-muted-foreground">Contact revealed only with consent</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Connection Credits</h4>
                <p className="text-xs text-muted-foreground">Fixed credits with no monthly expiry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-gold-600 shadow-md text-white border border-gold-400/30">
                <Crown className="h-5 w-5 text-gold-300" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-foreground font-serif">
                  VIP <span className="text-brand-800 font-extrabold">ROYAL</span>
                </div>
                <div className="text-[8px] tracking-[0.2em] text-gold-700 uppercase font-bold">
                  Matchmaking Concierge
                </div>
              </div>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Pakistan’s premier connection-based matrimonial platform designed exclusively for respectable families, doctors, corporate leaders, and accomplished professionals worldwide.
            </p>

            <div className="space-y-2 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                <span>Executive Office: Gulberg III & DHA Phase 5, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                <span>Concierge contact details are provided after assignment.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                <span>concierge@viproyalmatchmaking.com</span>
              </div>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/search" className="transition hover:text-brand-800">Browse Verified Profiles</Link>
              </li>
              <li>
                <Link href="/pricing" className="transition hover:text-brand-800">Connection Packages</Link>
              </li>
              <li>
                <Link href="/dashboard/discover" className="transition hover:text-brand-800">Recommended Matches</Link>
              </li>
              <li>
                <Link href="/dashboard/connections" className="transition hover:text-brand-800">Connections Hub</Link>
              </li>
              <li>
                <Link href="/stories" className="transition hover:text-brand-800">Royal Success Stories</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">Services</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/dashboard/consultant" className="transition hover:text-brand-800">Senior Family Consultant</Link>
              </li>
              <li>
                <Link href="/pricing" className="transition hover:text-brand-800">Additional Connection Packs</Link>
              </li>
              <li>
                <Link href="/dashboard/family" className="transition hover:text-brand-800">Family Member Access</Link>
              </li>
              <li>
                <Link href="/dashboard/verification" className="transition hover:text-brand-800">Identity Verification</Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="transition hover:text-brand-800">Helpdesk & Ticket Support</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust (Section 79) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">Trust & Policies</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="transition hover:text-brand-800">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-brand-800">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/safety" className="transition hover:text-brand-800">Community & Verification Rules</Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-brand-800">Bank Transfer Verification</Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground/60 transition hover:text-brand-800">Staff Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VIP Royal Matchmaking Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Consent-based introductions</span>
            <span>•</span>
            <span>No Monthly Expiry on Connections</span>
            <span>•</span>
            <span>Strict Family Confidentiality</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
