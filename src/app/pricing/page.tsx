'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan } from '@/lib/types';

export default function PricingPage() {
  const { plans, currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold font-serif sm:text-5xl">Connection packages</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Browse profiles with a free account. Package payments are made in PKR by bank or wallet transfer and activated only after manual receipt verification.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.slug} className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
              <h2 className="text-xl font-bold font-serif">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-4 text-3xl font-black text-brand-600">PKR {plan.monthlyPrice.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">One-time package payment</p>
              <p className="mt-5 text-sm font-semibold">{plan.connectionsLimit ?? plan.connectionLimit ?? 'Specified'} connection credits</p>
              <ul className="mt-4 flex-1 list-inside list-disc space-y-2 text-xs text-muted-foreground">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              {currentUser ? (
                <button type="button" onClick={() => setSelectedPlan(plan)} className="mt-7 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700">Choose {plan.name}</button>
              ) : (
                <Link href="/login?returnTo=%2Fpricing" className="mt-7 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-700">Sign in to choose</Link>
              )}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 className="font-bold">Before you pay</h2>
          <p className="mt-2">Check the official receiving account shown at checkout. Upload the receipt and transaction ID from your signed-in account. No plan is activated instantly; an administrator checks the payment first.</p>
          <p className="mt-2">Card payments, coupons, top-up packs, annual discounts, and foreign-currency billing are not available yet.</p>
        </div>
      </main>
      <Footer />
      <CheckoutModal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)} plan={selectedPlan} />
    </div>
  );
}
