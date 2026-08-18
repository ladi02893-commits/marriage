'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  Download,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MessageCircle,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { InvoiceReceiptModal } from '@/components/ui/invoice-receipt-modal';
import { SubscriptionPlan, Invoice } from '@/lib/types';

export default function SubscriptionBillingPage() {
  const { currentUser, currentProfile, plans, invoices, paymentProofs, updateUserSubscription } = useAuth();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const currentTier = currentUser?.subscriptionTier || 'FREE';

  const currentPlan =
    plans.find((p) => {
      const s = p.slug.toUpperCase();
      if (currentTier === 'PREMIUM_PLUS') return s === 'VIP' || s === 'PREMIUM_PLUS' || s.includes('VIP') || s.includes('ROYAL');
      if (currentTier === 'PREMIUM') return s === 'PREMIUM' || s.includes('ELITE') || s.includes('EXECUTIVE');
      return s === 'BASIC' || s === 'FREE';
    }) || plans[0];

  // Check if current user has a pending payment proof in queue
  const userPendingProof = paymentProofs.find(
    (p) =>
      (p.userId === currentUser?.id || (currentUser?.email && p.userEmail === currentUser.email)) &&
      p.status === 'PENDING'
  );

  // Filter invoices for current user (or show all user invoices)
  const userInvoices = invoices.filter(
    (inv) => inv.userId === currentUser?.id || inv.userId === `user-${currentUser?.id}`
  );
  const displayInvoices = userInvoices.length > 0 ? userInvoices : invoices;

  const expiryDateFormatted = currentUser?.subscriptionExpiresAt
    ? new Date(currentUser.subscriptionExpiresAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const remainingDays = currentUser?.subscriptionExpiresAt
    ? Math.max(0, Math.ceil((new Date(currentUser.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleOpenUpgrade = (plan: SubscriptionPlan) => {
    if (plan.slug.toUpperCase() === 'BASIC') {
      if (currentTier === 'FREE') {
        toast.info('You are already on the Basic (Free) tier.');
        return;
      }
      updateUserSubscription('FREE');
      toast.success('Your subscription has been switched to Basic (Free) tier.');
      return;
    }

    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handleViewReceipt = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Subscription & VIP Tier</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your matrimonial membership tier, unlock verified contact dossiers, and view billing invoices.
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:from-brand-700 transition"
        >
          <Crown className="h-4 w-4" /> Compare All Plans
        </Link>
      </div>

      {/* Pending Payment Verification Banner if applicable */}
      {userPendingProof && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-6 text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">Payment Verification In Progress</h3>
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    PENDING ADMIN APPROVAL
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  Your transaction <strong>{userPendingProof.transactionId}</strong> for{' '}
                  <strong>{userPendingProof.planName}</strong> ({userPendingProof.currency} {userPendingProof.amount}) via{' '}
                  <strong>{userPendingProof.paymentMethod}</strong> is queued for admin review. Standard turnaround is
                  1-2 hours.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/923001234567?text=${encodeURIComponent(
                `Assalam-o-Alaikum! My payment proof for ${userPendingProof.planName} is pending. TRX ID: ${userPendingProof.transactionId}, User: ${currentUser?.name} (${currentUser?.email}). Please assist.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
            >
              <MessageCircle className="h-4 w-4" /> Fast-Track WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Current Active Plan Card */}
      <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-900 via-brand-800 to-rose-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-gold-300">
                <Crown className="h-3.5 w-3.5" /> CURRENT MEMBERSHIP
              </span>
              {currentTier !== 'FREE' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="h-3 w-3" /> Blue Shield Verified
                </span>
              )}
              {expiryDateFormatted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/25 border border-amber-400/40 px-3 py-0.5 text-[11px] font-bold text-amber-200">
                  <Calendar className="h-3 w-3 text-amber-300" /> Valid Until: {expiryDateFormatted} ({remainingDays} Days Left)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif">{currentPlan.name}</h2>
            <p className="text-xs text-brand-100 max-w-lg leading-relaxed">{currentPlan.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md text-center min-w-[160px] w-full sm:w-auto">
              <span className="text-[11px] text-brand-200 uppercase tracking-wider block">Status</span>
              <span className="text-lg font-bold text-emerald-400">
                {currentTier === 'FREE' ? 'Free Basic (2 Connects)' : 'Active (Verified)'}
              </span>
              <span className="text-[11px] text-brand-200 block mt-0.5">
                {expiryDateFormatted ? `Renews on ${expiryDateFormatted}` : 'Standard Free Quota'}
              </span>
            </div>

            {currentTier === 'FREE' && (
              <button
                onClick={() => {
                  const premPlan = plans.find((p) => p.slug.toUpperCase() === 'PREMIUM') || plans[1];
                  handleOpenUpgrade(premPlan);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 px-5 py-3 text-xs font-bold text-stone-950 shadow-lg hover:from-gold-400 hover:to-amber-500 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Upgrade to Premium Now
              </button>
            )}
          </div>
        </div>

        {/* Feature Quota Progress Bars */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15 text-xs">
          <div className="rounded-2xl bg-black/30 p-4 backdrop-blur-sm space-y-1.5">
            <div className="flex justify-between text-brand-200">
              <span>Connection Interests</span>
              <span className="font-bold text-white">
                {currentTier === 'PREMIUM_PLUS'
                  ? '200 / Unlimited'
                  : currentTier === 'PREMIUM'
                  ? '50 Monthly'
                  : '2 Monthly Allowance'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: currentTier === 'PREMIUM_PLUS' ? '100%' : currentTier === 'PREMIUM' ? '65%' : '20%' }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-4 backdrop-blur-sm space-y-1.5">
            <div className="flex justify-between text-brand-200">
              <span>Direct WhatsApp Unlocks</span>
              <span className="font-bold text-white">
                {currentTier !== 'FREE' ? 'Unlocked & Active' : 'Locked (Requires Premium)'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: currentTier !== 'FREE' ? '100%' : '0%' }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-4 backdrop-blur-sm space-y-1.5">
            <div className="flex justify-between text-brand-200">
              <span>Verified Dossier Views</span>
              <span className="font-bold text-white">
                {currentTier === 'PREMIUM_PLUS'
                  ? 'Full Access'
                  : currentTier === 'PREMIUM'
                  ? 'Full Access'
                  : 'Basic Views'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: currentTier !== 'FREE' ? '100%' : '30%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade / Change Membership Cards */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold font-serif text-foreground">Available Membership Plans</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select an upgrade tier below to open the checkout gateway with instant Card, JazzCash, EasyPaisa, or Bank IBFT.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            const isSelected =
              ((p.slug.toUpperCase() === 'BASIC' || p.slug.toUpperCase() === 'FREE') && currentTier === 'FREE') ||
              (p.slug.toUpperCase() === 'PREMIUM' && currentTier === 'PREMIUM') ||
              ((p.slug.toUpperCase() === 'VIP' || p.slug.toUpperCase() === 'PREMIUM_PLUS') && currentTier === 'PREMIUM_PLUS');
            const isVipPlan = p.slug.toUpperCase() === 'VIP' || p.slug.toUpperCase() === 'PREMIUM_PLUS';

            return (
              <div
                key={p.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20 dark:bg-brand-950/30'
                    : 'border-border bg-background hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-serif text-foreground">{p.name}</span>
                    {isSelected && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Active Tier
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground min-h-[36px]">{p.description}</p>

                  <div className="text-2xl font-black font-serif text-foreground">
                    {p.monthlyPrice === 0 ? 'Free' : `PKR ${p.monthlyPrice.toLocaleString()}`}
                    <span className="text-xs font-normal text-muted-foreground"> / mo</span>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-border text-xs">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/85">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => handleOpenUpgrade(p)}
                    className={`w-full rounded-2xl py-3 text-center text-xs font-bold transition shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : isVipPlan
                        ? 'bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-stone-950 shadow-md hover:from-amber-400'
                        : 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-brand-600/20 hover:from-brand-700'
                    }`}
                  >
                    {isSelected ? 'Current Active Tier' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold font-serif text-foreground">Invoice & Billing History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official tax-compliant electronic receipts for your membership payments.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {displayInvoices.length} Total Receipts
          </span>
        </div>

        {displayInvoices.length === 0 ? (
          <div className="rounded-2xl bg-muted/30 border border-border p-8 text-center space-y-3">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <div className="text-xs text-muted-foreground">No invoices recorded yet on this account.</div>
            <button
              onClick={() => {
                const premPlan = plans.find((p) => p.slug.toUpperCase() === 'PREMIUM') || plans[1];
                handleOpenUpgrade(premPlan);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
            >
              Upgrade & Generate First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-semibold">Invoice #</th>
                  <th className="pb-3 font-semibold">Plan Description</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Payment Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayInvoices.map((inv) => (
                  <tr key={inv.id} className="text-foreground">
                    <td className="py-3.5 font-bold font-mono text-[11px]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 font-medium">{inv.planName}</td>
                    <td className="py-3.5 text-muted-foreground">
                      {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 font-bold font-serif">
                      {inv.currency} {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-muted-foreground">{inv.paymentMethod}</td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleViewReceipt(inv)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPlanForCheckout(null);
          }}
          plan={selectedPlanForCheckout}
          initialBillingCycle="ANNUAL"
          selectedCountry={currentProfile?.country || 'Pakistan'}
        />
      )}

      {/* Receipt Modal */}
      {viewingInvoice && (
        <InvoiceReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setViewingInvoice(null);
          }}
          invoice={viewingInvoice}
          userName={currentUser?.name}
          userEmail={currentUser?.email}
        />
      )}
    </div>
  );
}
