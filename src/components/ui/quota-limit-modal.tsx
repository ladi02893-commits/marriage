'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan } from '@/lib/types';
import { CheckoutModal } from './checkout-modal';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionAttempted?: 'INTEREST' | 'MESSAGE' | 'CONTACT' | 'PROFILE';
}

export function QuotaLimitModal({ isOpen, onClose, actionAttempted = 'INTEREST' }: QuotaLimitModalProps) {
  const { connectionQuota, plans } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  if (!isOpen) return null;

  const actionLabel = {
    INTEREST: 'send another interest',
    MESSAGE: 'start a conversation',
    CONTACT: 'view contact details',
    PROFILE: 'view this profile',
  }[actionAttempted];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Connection limit">
          <h2 className="text-xl font-bold text-foreground">Connection limit reached</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have used {connectionQuota.used} of {connectionQuota.total} connection credits. You cannot {actionLabel} right now. Messaging and contact details also require mutual interest acceptance.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Choose a plan below to submit payment evidence for manual review. Access changes only after approval.</p>
          <div className="mt-5 space-y-2">
            {plans.filter((plan) => plan.monthlyPrice > 0).map((plan) => (
              <button key={plan.slug} type="button" onClick={() => setSelectedPlan(plan)} className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-left hover:border-brand-500">
                <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                <span className="text-sm font-bold text-brand-600">PKR {plan.monthlyPrice.toLocaleString()}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-xs">
            <Link href="/pricing" onClick={onClose} className="font-semibold text-brand-600 hover:underline">View plan details</Link>
            <button type="button" onClick={onClose} className="font-semibold text-muted-foreground hover:text-foreground">Continue browsing</button>
          </div>
        </div>
      </div>
      {selectedPlan && <CheckoutModal isOpen={true} onClose={() => { setSelectedPlan(null); onClose(); }} plan={selectedPlan} />}
    </>
  );
}
