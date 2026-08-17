import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Lock, Phone, Mail, MapPin, Award, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white dark:border-brand-950 dark:bg-card">
      {/* Trust Highlights Strip */}
      <div className="border-b border-border/80 bg-brand-50/50 py-8 dark:bg-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">100% Verified Profiles</h4>
                <p className="text-xs text-muted-foreground">Manual ID & background checks</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Strict Privacy Controls</h4>
                <p className="text-xs text-muted-foreground">Your photos & contacts are secure</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Smart Compatibility</h4>
                <p className="text-xs text-muted-foreground">Multi-factor matrimonial scoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Dignified Families</h4>
                <p className="text-xs text-muted-foreground">Dedicated to lifelong marriage</p>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-rose-500 text-white shadow-md">
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
            <p className="text-xs leading-relaxed text-muted-foreground max-w-sm">
              TRUEPAIR is a premier matrimonial SaaS platform uniting educated, cultured individuals and families across the globe with high-trust verification, smart compatibility algorithms, and strict privacy.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-600" /> London • New York • Dubai
              </div>
            </div>
          </div>

          {/* Col 1 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Explore</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-brand-600 transition">
                  Search Profiles
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-brand-600 transition">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-muted-foreground hover:text-brand-600 transition">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-brand-600 transition">
                  Trust & Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Quick Access</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-brand-600 transition">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-brand-600 transition">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-brand-600 transition">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-brand-600 transition">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal & Privacy</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-brand-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-brand-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-brand-600 transition">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-brand-600 transition">
                  Contact Bureau
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TRUEPAIR Matrimonial Bureau SaaS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-serif italic text-brand-700 dark:text-brand-400">
            "Where Compatibility Meets Commitment"
          </p>
        </div>
      </div>
    </footer>
  );
}
