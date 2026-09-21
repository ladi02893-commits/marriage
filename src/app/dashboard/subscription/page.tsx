'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  Download,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MessageCircle,
  FileText,
  AlertCircle,
  Zap,
  Users,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { InvoiceReceiptModal } from '@/components/ui/invoice-receipt-modal';
import { SubscriptionPlan, Invoice } from '@/lib/types';

export default function SubscriptionBillingPage() {
  const {
    currentUser,
    currentProfile,
    plans,
    extraPacks,
    invoices,
    paymentProofs,
    connectionQuota,
  } = useAuth();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const currentTier = currentUser?.subscriptionTier || 'BASIC';

  const currentPlan =
    plans.find((p) => {
      const s = p.slug.toUpperCase();
      if (currentTier === 'PREMIUM_PLUS' || currentTier === 'VIP') return s === 'VIP' || s === 'PREMIUM_PLUS';
      if (currentTier === 'PREMIUM') return s === 'PREMIUM';
      return s === 'BASIC';
    }) || plans[0];

  // Check if current user has a pending payment proof in queue
  const userPendingProof = paymentProofs.find(
    (p) =>
      (p.userId === currentUser?.id || (currentUser?.email && p.userEmail.toLowerCase() === currentUser.email.toLowerCase())) &&
      p.status === 'PENDING'
  );

  // Filter invoices for current user
  const userInvoices = invoices.filter(
    (inv) =>
      inv.userId === currentUser?.id ||
      inv.userId === `user-${currentUser?.id}` ||
      (currentUser?.email && inv.userName?.toLowerCase() === currentUser.name?.toLowerCase())
  );
  const displayInvoices = userInvoices;

  const handleOpenUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handleBuyExtraPack = (pack: any) => {
    const count = pack.connectionsCount || pack.connections || 10;
    const pseudoPlan: SubscriptionPlan = {
      id: pack.id,
      name: pack.name,
      slug: pack.id,
      description: `${count} Additional Connection Credits Top-Up`,
      currency: 'PKR',
      monthlyPrice: pack.pricePKR,
      yearlyPrice: pack.pricePKR,
      connectionsLimit: count,
      connectionLimit: count,
      features: [
        `${count} Additional Connection Credits`,
        'Valid with your current package',
        'No monthly expiry',
      ],
      badge: 'Top-Up Pack',
      isPopular: false,
      isActive: true,
      order: 10,
      limits: {
        connectionsCount: count,
        directContactAccess: true,
      },
    };
    setSelectedPlanForCheckout(pseudoPlan);
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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-0.5 text-xs font-bold text-gold-700 dark:text-gold-300 mb-1">
            <Crown className="h-3.5 w-3.5 text-gold-500" /> Connection-Based Royal Packages
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Packages & Connection Credits</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your connection balances, top-up additional connection packs, and view bank transfer receipts.
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 px-5 py-2.5 text-xs font-bold text-gold-300 shadow-md hover:from-brand-800 transition"
        >
          <Crown className="h-4 w-4 text-gold-400" /> Compare All Packages
        </Link>
      </div>

      {/* Pending Payment Verification Banner */}
      {userPendingProof && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-6 text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">Manual Bank Payment Verification In Progress</h3>
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    PENDING ADMIN APPROVAL
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  Your bank transfer slip for <strong>{userPendingProof.planName}</strong> ({userPendingProof.currency}{' '}
                  {userPendingProof.amount.toLocaleString()}) via <strong>{userPendingProof.paymentMethod}</strong> (TRX:{' '}
                  <strong>{userPendingProof.transactionId}</strong>) is being reviewed by our accounts desk. Standard
                  turnaround is 1-2 hours.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/923001234567?text=${encodeURIComponent(
                `Assalam-o-Alaikum! My bank transfer proof for ${userPendingProof.planName} is pending review. TRX ID: ${userPendingProof.transactionId}, User: ${currentUser?.name} (${currentUser?.email}). Please expedite verification.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
            >
              <MessageCircle className="h-4 w-4" /> Fast-Track on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Current Active Plan & Quota Metrics Card */}
      <div className="rounded-3xl border border-gold-500/30 bg-gradient-to-r from-brand-950 via-brand-900 to-rose-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-gold-300">
                <Crown className="h-3.5 w-3.5 fill-gold-400" /> ACTIVE PACKAGE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="h-3 w-3" /> Royal Verified Member
              </span>
              {currentUser?.profileIdCode && (
                <span className="font-mono text-xs bg-gold-400/20 text-gold-300 border border-gold-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  {currentUser.profileIdCode}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif">{currentPlan.name}</h2>
            <p className="text-xs text-brand-100 max-w-lg leading-relaxed">{currentPlan.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md text-center min-w-[170px] w-full sm:w-auto">
              <span className="text-[11px] text-brand-200 uppercase tracking-wider block">Remaining Balance</span>
              <span className="text-2xl font-black text-gold-300 font-serif">
                {connectionQuota.remaining}{' '}
                <span className="text-xs font-normal text-white">/ {connectionQuota.total}</span>
              </span>
              <span className="text-[11px] text-emerald-300 block mt-0.5">
                {connectionQuota.remaining > 0 ? 'Credits Active & Ready' : 'Quota Exhausted'}
              </span>
            </div>

            <button
              onClick={() => {
                const target = plans.find((p) => p.slug.toUpperCase() === 'VIP') || plans[2] || plans[0];
                handleOpenUpgrade(target);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 px-5 py-3 text-xs font-bold text-stone-950 shadow-lg hover:from-gold-400 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> Upgrade Package
            </button>
          </div>
        </div>

        {/* Live Quota Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/15 space-y-3">
          <div className="flex items-center justify-between text-xs text-brand-100">
            <span>
              Connection Usage: <strong>{connectionQuota.used} Used</strong> (
              <strong>{connectionQuota.remaining} Remaining</strong>)
            </span>
            <span className="font-bold text-gold-300">{connectionQuota.usagePercentage}% Quota Consumed</span>
          </div>

          <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                connectionQuota.isReached
                  ? 'bg-rose-500'
                  : connectionQuota.usagePercentage >= 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, connectionQuota.usagePercentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-brand-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Browsing profiles consumes 0 credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>1 credit unlocks direct Phone/WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Same profile never deducts twice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Packages Grid */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold font-serif text-foreground">Available Connection Packages</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a package below to pay via Bank IBFT, JazzCash, EasyPaisa, or instant online debit/credit card.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isSelected =
              (p.slug.toUpperCase() === 'BASIC' && currentTier === 'BASIC') ||
              (p.slug.toUpperCase() === 'PREMIUM' && currentTier === 'PREMIUM') ||
              ((p.slug.toUpperCase() === 'VIP' || p.slug.toUpperCase() === 'PREMIUM_PLUS') &&
                (currentTier === 'VIP' || currentTier === 'PREMIUM_PLUS'));
            const isVipPlan = p.slug.toUpperCase() === 'VIP' || p.slug.toUpperCase() === 'PREMIUM_PLUS';

            return (
              <div
                key={p.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-gold-500 bg-gold-50/20 ring-2 ring-gold-500/20 dark:bg-gold-950/20'
                    : isVipPlan
                    ? 'border-gold-500/60 bg-gradient-to-b from-gold-50/30 to-background dark:from-gold-950/20 dark:to-background shadow-md'
                    : 'border-border bg-background hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-serif text-foreground">{p.name}</span>
                    {isSelected ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Current Package
                      </span>
                    ) : isVipPlan ? (
                      <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[10px] font-bold text-gold-800 dark:bg-gold-950 dark:text-gold-300">
                        ⭐ Most Popular
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-muted-foreground min-h-[36px]">{p.description}</p>

                  <div className="text-2xl font-black font-serif text-foreground">
                    PKR {p.monthlyPrice.toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground block text-gold-600 dark:text-gold-400 font-sans mt-0.5 font-bold">
                      {p.connectionsLimit || (isVipPlan ? 300 : p.slug === 'PREMIUM' ? 100 : 30)} Connection Credits
                    </span>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-border text-xs">
                    {p.features.slice(0, 5).map((f, i) => (
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
                        ? 'bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-stone-950 shadow-md hover:from-gold-400'
                        : 'bg-gradient-to-r from-brand-900 to-brand-700 text-white shadow-brand-900/20 hover:from-brand-800'
                    }`}
                  >
                    {isSelected ? 'Renew / Top-Up' : `Purchase ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Connection Top-Up Packs (Section 38) */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Need More Connections? Buy Extra Packs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instantly top-up connection credits without upgrading your entire package. Valid with your active profile.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-900">
            Instant Top-Up
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {extraPacks.map((pack) => {
            const count = pack.connectionsCount || pack.connections || 10;
            return (
              <div
                key={pack.id}
                className="rounded-2xl border border-border p-5 bg-background hover:border-gold-500 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{pack.name}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +{count} Credits
                    </span>
                  </div>
                  <div className="text-xl font-bold font-serif text-foreground mt-2">
                    PKR {pack.pricePKR.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Rs. {Math.round(pack.pricePKR / count)} per verified contact unlock
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyExtraPack(pack)}
                  className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Top-Up {count} Credits
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold font-serif text-foreground">Invoice & Payment Receipts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official tax-compliant electronic receipts for your package and connection credit orders.
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
                const plan = plans.find((p) => p.slug.toUpperCase() === 'PREMIUM') || plans[0];
                handleOpenUpgrade(plan);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 text-gold-300 px-4 py-2 text-xs font-bold shadow-sm hover:bg-brand-800 transition"
            >
              Purchase Package & Generate Receipt
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Package / Item</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(inv.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{inv.planName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {inv.currency} {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground capitalize">
                      {inv.paymentMethod?.replace('_', ' ').toLowerCase() || 'Bank Transfer'}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewReceipt(inv)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 font-medium text-foreground hover:bg-muted transition"
                      >
                        <Download className="h-3 w-3" /> View Receipt
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
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlanForCheckout}
      />

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoice={viewingInvoice}
      />
    </div>
  );
}
