'use client';

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Legal & GDPR</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            Privacy Policy & Data Rights
          </h1>
          <p className="text-xs text-muted-foreground">Last updated: February 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-xs leading-relaxed text-muted-foreground space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">1. Commitment to Matrimonial Confidentiality</h2>
          <p>
            TRUEPAIR ("we", "our", or "the Bureau") operates with the highest standards of confidentiality. We understand the deeply sensitive nature of matrimonial profiles, family histories, and personal preferences.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">2. Information We Collect</h2>
          <p>
            We collect personal information necessary to calculate compatibility and verify member identities, including: legal names, dates of birth, educational degrees, career credentials, religious preferences, and government identification documents for verification audits.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">3. Government ID Encryption & Storage</h2>
          <p>
            All verification documents (passports, national ID cards) are encrypted at rest using AES-256 standards. Verification documents are strictly audited by authorized compliance officers and are never exposed publicly or shared with prospective matches.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">4. Member Privacy Controls</h2>
          <p>
            You retain absolute control over who views your photographs, contact numbers, and income ranges through your Dashboard Privacy Settings. You may choose to restrict photo views to verified members only or to mutual interest connections.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">5. Right to Erasure (Account Deletion)</h2>
          <p>
            In accordance with GDPR and international data privacy regulations, members may request complete profile deletion and data purging at any time through their Account Settings.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
