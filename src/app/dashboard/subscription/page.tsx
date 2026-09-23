'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { InvoiceReceiptModal } from '@/components/ui/invoice-receipt-modal';
import { Invoice, SubscriptionPlan } from '@/lib/types';

export default function SubscriptionBillingPage() {
  const { currentUser, plans, invoices, paymentProofs, connectionQuota } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const ownPendingProofs = paymentProofs.filter((proof) => proof.userId === currentUser?.id && proof.status === 'PENDING');
  const ownInvoices = invoices.filter((invoice) => invoice.userId === currentUser?.id);
  const tier = currentUser?.subscriptionTier ?? 'FREE';

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Packages & connection credits</h1>
        <p className="mt-1 text-sm text-muted-foreground">One credit is used when you send an interest request. Contact details and messaging require the recipient to accept it.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Current tier</p><p className="mt-2 text-2xl font-bold">{tier.replaceAll('_', ' ')}</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Credits remaining</p><p className="mt-2 text-2xl font-bold">{connectionQuota.remaining} / {connectionQuota.total}</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Interests sent</p><p className="mt-2 text-2xl font-bold">{connectionQuota.used}</p></div>
      </div>
      {ownPendingProofs.length > 0 && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        {ownPendingProofs.length} payment receipt{ownPendingProofs.length === 1 ? '' : 's'} awaiting manual review. The plan will not change until payment is verified.
      </div>}
      <div>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Available packages</h2><Link href="/pricing" className="text-xs font-semibold text-brand-600 hover:underline">Compare details</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => <div key={plan.slug} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold">{plan.name}</h3>
            <p className="mt-2 text-xl font-black text-brand-600">PKR {plan.monthlyPrice.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">One-time payment · {plan.connectionsLimit ?? plan.connectionLimit ?? 'Specified'} credits</p>
            <button type="button" onClick={() => setSelectedPlan(plan)} className="mt-5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">Submit payment for review</button>
          </div>)}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-bold">Invoices</h2>
        {ownInvoices.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No verified payment invoices yet.</p> : <div className="mt-3 space-y-2">{ownInvoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between gap-3 border-t border-border py-2 text-sm"><span>{invoice.invoiceNumber || invoice.id} · PKR {invoice.amount.toLocaleString()}</span><button type="button" onClick={() => setSelectedInvoice(invoice)} className="text-xs font-semibold text-brand-600 hover:underline">View receipt</button></div>)}</div>}
      </div>
      <p className="text-xs text-muted-foreground">Card payments, coupon codes, and separate top-up packs are not available yet.</p>
      <CheckoutModal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)} plan={selectedPlan} />
      <InvoiceReceiptModal isOpen={selectedInvoice !== null} onClose={() => setSelectedInvoice(null)} invoice={selectedInvoice} />
    </div>
  );
}
