'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Terms of Service</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            Matrimonial Service Agreement
          </h1>
          <p className="text-xs text-muted-foreground">Effective Date: January 1, 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-xs leading-relaxed text-muted-foreground space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">1. Eligibility for Matrimonial Membership</h2>
          <p>
            TRUEPAIR is exclusively dedicated to individuals seeking lawful, lifelong matrimonial marriage. By registering, you affirm that you are of legal minimum marriageable age (at least 18 years of age) and legally eligible to enter into matrimony.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">2. Accurate Representation</h2>
          <p>
            Members agree to provide accurate, truthful personal details, authentic photographs, and valid marital status. Creating duplicate profiles or misrepresenting educational or career qualifications will result in immediate permanent suspension without refund.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">3. Respectful Code of Conduct</h2>
          <p>
            All communication between prospective matches and families must be conducted with respect and cultural decorum. Inappropriate language, harassment, commercial solicitation, or requests for monetary transfers are strictly prohibited.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-serif">4. Subscription Terms & Cancellations</h2>
          <p>
            Paid memberships grant access to enhanced search, direct messaging, and verified contact dossiers according to the selected tier. Members may cancel subscription auto-renewals at any time from their billing dashboard.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
