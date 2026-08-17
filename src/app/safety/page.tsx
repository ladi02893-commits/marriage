'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, AlertTriangle, EyeOff, UserCheck, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            <ShieldCheck className="h-4 w-4" /> Trust & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            Your Safety, Dignity & Privacy Come First
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover the rigorous protocols, artificial intelligence fraud detection, and manual verification steps that protect our members.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        {/* Verification Process Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-serif text-foreground text-center">
            The 3-Layer TruePair Verification Standard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">1. Government ID Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Members upload national identity cards, driver’s licenses, or passports. Our compliance specialists verify legal full names, dates of birth, and validity before badging.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">2. Biometric Facial Match</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live biometric selfies ensure the individual creating the account is genuine and matches all uploaded gallery photos, preventing impersonation and catfishing.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">3. Privacy Vault Protection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All identity documents are encrypted with AES-256 and never stored publicly or shared with other members under any circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <h3 className="text-xl font-bold text-foreground font-serif">Safe Matrimonial Interaction Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-muted-foreground">
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Involve Family Early
              </h4>
              <p>
                We encourage members to involve parents or trusted guardians as early as possible once mutual interest and basic compatibility are established.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Never Transfer Funds
              </h4>
              <p>
                TRUEPAIR members will never ask for monetary transfers or financial assistance. Report any financial solicitation to our moderation desk immediately.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Meet in Public Spaces
              </h4>
              <p>
                When meeting prospective matches in person, choose well-lit, public settings such as cafes or restaurants, preferably accompanied by family.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Utilize Photo Privacy Controls
              </h4>
              <p>
                If you prefer privacy, adjust your profile settings to 'Visible to Accepted Matches Only' until you approve reciprocal interest.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
