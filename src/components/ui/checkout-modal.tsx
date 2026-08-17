'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Landmark,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Upload,
  Sparkles,
  ArrowRight,
  Clock,
  MessageCircle,
  HelpCircle,
  Tag,
  AlertCircle,
  FileText,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan, ReceivingAccount, Invoice } from '@/lib/types';
import { getPackagePriceForCountry, getCurrencyForCountry } from '@/lib/currency';
import { toast } from 'sonner';
import { InvoiceReceiptModal } from './invoice-receipt-modal';
import Link from 'next/link';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  initialBillingCycle?: 'MONTHLY' | 'ANNUAL';
  selectedCountry?: string;
  initialDiscount?: { percent?: number; fixed?: number; code?: string } | null;
  onSuccess?: () => void;
}

type PaymentTab = 'CARD' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'RAAST' | 'SADAPAY';

export function CheckoutModal({
  isOpen,
  onClose,
  plan,
  initialBillingCycle = 'ANNUAL',
  selectedCountry = 'Pakistan',
  initialDiscount = null,
  onSuccess,
}: CheckoutModalProps) {
  const {
    currentUser,
    currentProfile,
    receivingAccounts,
    submitPaymentProof,
    processInstantPayment,
    applyCoupon,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<PaymentTab>('CARD');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>(initialBillingCycle);
  const [couponCode, setCouponCode] = useState(initialDiscount?.code || '');
  const [discountInfo, setDiscountInfo] = useState<{ percent?: number; fixed?: number; code?: string } | null>(
    initialDiscount
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card payment form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');

  // Mobile / Bank transfer form
  const [trxId, setTrxId] = useState('');
  const [senderAccount, setSenderAccount] = useState(currentProfile?.phone || '');
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>('receipt_screenshot.jpg');
  const [notes, setNotes] = useState('');

  // Processing & Success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<{
    type: 'INSTANT' | 'MANUAL';
    invoice?: Invoice;
    trxId?: string;
    planName: string;
  } | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (initialBillingCycle) setBillingCycle(initialBillingCycle);
    if (initialDiscount) setDiscountInfo(initialDiscount);
  }, [initialBillingCycle, initialDiscount, isOpen]);

  if (!isOpen || !plan) return null;

  const currencyConfig = getCurrencyForCountry(selectedCountry);
  const isAnnual = billingCycle === 'ANNUAL';

  // Base raw price calculation
  const rawMonthlyPKR = plan.monthlyPrice || 0;
  const rawYearlyPKR = plan.yearlyPrice || 0;

  const effectiveMonthlyPKR = isAnnual && rawYearlyPKR > 0 ? Math.round(rawYearlyPKR / 12) : rawMonthlyPKR;
  const totalPKR = isAnnual && rawYearlyPKR > 0 ? rawYearlyPKR : rawMonthlyPKR;

  // Localized pricing config
  const priceConfig = getPackagePriceForCountry(plan.slug, selectedCountry, totalPKR);
  let finalAmount = priceConfig.amount;

  if (discountInfo?.percent && finalAmount > 0) {
    finalAmount = Math.round(finalAmount * (1 - discountInfo.percent / 100));
  } else if (discountInfo?.fixed && finalAmount > 0) {
    finalAmount = Math.max(0, finalAmount - discountInfo.fixed);
  }

  // Filter accounts for selected tab
  const activeReceivingAccount = receivingAccounts.find(
    (acc) => acc.isActive && acc.provider.toUpperCase() === activeTab.toUpperCase()
  ) || receivingAccounts.find((acc) => acc.isActive && acc.provider === 'BANK_TRANSFER') || receivingAccounts[0];

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (res.valid) {
      setDiscountInfo({
        percent: res.discountPercent,
        fixed: res.fixedDiscount,
        code: couponCode.trim().toUpperCase(),
      });
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const fillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('889');
    setCardHolder(currentUser?.name || 'Verified Member');
    toast.info('Test card credentials auto-filled');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setScreenshotUrl(loadEvt.target.result as string);
          toast.success(`Attached ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Handle Instant Card Payment
  const handleInstantCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in first to complete membership upgrade.');
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvc || !cardHolder) {
      toast.error('Please complete all card details.');
      return;
    }

    setIsSubmitting(true);
    setProcessingStep('Connecting to 256-bit SSL Banking Gateway...');

    setTimeout(() => {
      setProcessingStep('Verifying 3D Secure Authorization & Funds...');
      setTimeout(async () => {
        setProcessingStep('Activating Membership & Upgrading Tier...');
        try {
          const result = await processInstantPayment({
            planSlug: plan.slug,
            planName: plan.name,
            amount: finalAmount,
            currency: currencyConfig.code,
            paymentMethod: `Credit / Debit Card (${cardNumber.slice(-4) || 'Online'})`,
            billingCycle,
            cardLast4: cardNumber.slice(-4) || '4242',
          });

          setIsSubmitting(false);
          setSubmissionResult({
            type: 'INSTANT',
            invoice: result.invoice,
            planName: plan.name,
          });
          toast.success(`🎉 Congratulations! Your account has been upgraded to ${plan.name}.`);
          if (onSuccess) onSuccess();
        } catch (err) {
          setIsSubmitting(false);
          toast.error('Payment processing failed. Please try another method.');
        }
      }, 900);
    }, 900);
  };

  // 2. Handle Mobile / Bank Manual Payment Proof
  const handleManualProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in first to submit payment proof.');
      return;
    }

    if (!trxId.trim()) {
      toast.error('Please enter the Transaction ID / Reference TRX code from your payment receipt.');
      return;
    }

    if (!senderAccount.trim()) {
      toast.error('Please enter your sender mobile / account number.');
      return;
    }

    setIsSubmitting(true);
    setProcessingStep('Submitting payment proof to verification queue...');

    setTimeout(() => {
      const generatedTrx = trxId.trim();
      submitPaymentProof({
        userId: currentUser.id,
        userName: currentUser.name || 'Member',
        userEmail: currentUser.email || '',
        userPhone: currentProfile?.phone || senderAccount,
        planSlug: plan.slug,
        planName: plan.name,
        amount: finalAmount,
        currency: currencyConfig.code,
        paymentMethod: activeTab,
        transactionId: generatedTrx,
        senderAccountNumber: senderAccount,
        screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      });

      setIsSubmitting(false);
      setSubmissionResult({
        type: 'MANUAL',
        trxId: generatedTrx,
        planName: plan.name,
      });
      toast.success('Payment proof submitted successfully for admin verification!');
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl text-foreground">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl bg-brand-600/10 p-2 text-brand-600 dark:text-brand-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif leading-tight text-foreground">
                  Upgrade to {plan.name}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Official Matrimonial Membership Checkout & Instant Access
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* If Success / Completed */}
          {submissionResult ? (
            <div className="p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                {submissionResult.type === 'INSTANT' ? (
                  <Sparkles className="h-10 w-10 animate-pulse" />
                ) : (
                  <FileCheck className="h-10 w-10" />
                )}
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-bold font-serif text-foreground">
                  {submissionResult.type === 'INSTANT'
                    ? 'Account Upgraded Successfully!'
                    : 'Payment Proof Received!'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {submissionResult.type === 'INSTANT'
                    ? `Congratulations! Your profile is now upgraded to ${submissionResult.planName}. You have immediate access to direct contact unlocks, priority matching, and verified features.`
                    : `Your payment proof (TRX: ${submissionResult.trxId}) for ${submissionResult.planName} has been queued for verification. Our admin team will verify it within 1-2 hours.`}
                </p>
              </div>

              {/* Action Cards */}
              <div className="max-w-lg mx-auto rounded-2xl bg-muted/40 p-4 border border-border text-xs space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-border text-foreground font-semibold">
                  <span>Selected Membership</span>
                  <span className="text-brand-600 font-bold">{submissionResult.planName}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Billing Amount</span>
                  <span className="font-mono font-bold text-foreground">
                    {currencyConfig.symbol} {finalAmount.toLocaleString()} ({currencyConfig.code})
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      submissionResult.type === 'INSTANT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {submissionResult.type === 'INSTANT' ? 'Active (Paid)' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Fast Track WhatsApp & Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
                {submissionResult.type === 'INSTANT' && submissionResult.invoice && (
                  <button
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-muted transition"
                  >
                    <FileText className="h-4 w-4 text-brand-600" /> View Official Receipt
                  </button>
                )}

                {submissionResult.type === 'MANUAL' && (
                  <a
                    href={`https://wa.me/923001234567?text=${encodeURIComponent(
                      `Assalam-o-Alaikum! I have submitted my payment proof for ${submissionResult.planName} on Compatible Matrimonials. TRX ID: ${submissionResult.trxId}, Email: ${currentUser?.email}. Please fast-track my verification.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" /> Fast-Track on WhatsApp
                  </a>
                )}

                <Link
                  href="/dashboard/subscription"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:from-brand-700 transition"
                >
                  Go to Subscription Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Main Checkout Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
              {/* Left Column: Order Summary & Plan Features */}
              <div className="lg:col-span-5 space-y-6">
                {/* Plan Overview Card */}
                <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-background to-brand-50/30 p-6 shadow-sm dark:border-brand-900/50 dark:from-brand-950/40 dark:via-card dark:to-brand-950/20">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-brand-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {plan.badge || 'Selected Plan'}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{currencyConfig.code}</span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">{plan.description}</p>

                  {/* Billing Switch */}
                  <div className="flex items-center justify-between rounded-2xl bg-card p-1.5 border border-border shadow-xs text-xs mb-4">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`flex-1 py-2 rounded-xl font-semibold transition ${
                        !isAnnual
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('ANNUAL')}
                      className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1 ${
                        isAnnual
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Annual <span className="text-[10px] font-bold text-gold-300">Save 35%</span>
                    </button>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Standard Rate:</span>
                      <span className="font-mono">
                        {currencyConfig.symbol} {priceConfig.amount.toLocaleString()}
                      </span>
                    </div>

                    {discountInfo && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Promo Code ({discountInfo.code}):</span>
                        <span className="font-mono">
                          - {discountInfo.percent ? `${discountInfo.percent}%` : `${currencyConfig.symbol} ${discountInfo.fixed}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform Security & VAT:</span>
                      <span className="text-emerald-600 font-semibold">Free (0%)</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-border text-foreground font-bold">
                      <span className="text-sm">Total Payable:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black font-serif text-brand-600 dark:text-brand-400">
                          {currencyConfig.symbol} {finalAmount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {isAnnual ? 'Billed annually' : 'Billed monthly'} ({currencyConfig.code})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="mt-5 pt-4 border-t border-border/80 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Included Privileges:
                    </span>
                    <ul className="space-y-2 text-xs">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/90">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Tag className="h-3.5 w-3.5 text-brand-600" /> Have a Coupon or Voucher?
                  </div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. WELCOME20"
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono uppercase text-foreground focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-foreground px-3.5 py-1.5 text-xs font-bold text-background hover:bg-foreground/90 transition"
                    >
                      Apply
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Multi-Channel Payment Methods & Checkout Forms */}
              <div className="lg:col-span-7 space-y-5">
                {/* Payment Gateway Tabs */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Select Payment Gateway:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('CARD')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                        activeTab === 'CARD'
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-1 text-brand-600" />
                      <span className="text-[11px] font-bold">Debit / Card</span>
                      <span className="text-[9px] text-emerald-600 font-semibold">Instant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('JAZZCASH')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                        activeTab === 'JAZZCASH'
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 mb-1 text-rose-600" />
                      <span className="text-[11px] font-bold">JazzCash</span>
                      <span className="text-[9px] text-muted-foreground">Mobile App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('EASYPAISA')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                        activeTab === 'EASYPAISA'
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 mb-1 text-emerald-600" />
                      <span className="text-[11px] font-bold">Easypaisa</span>
                      <span className="text-[9px] text-muted-foreground">Mobile App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('BANK_TRANSFER')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                        activeTab === 'BANK_TRANSFER'
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Landmark className="h-5 w-5 mb-1 text-sky-600" />
                      <span className="text-[11px] font-bold">Bank IBFT</span>
                      <span className="text-[9px] text-muted-foreground">Online Transfer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('RAAST')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                        activeTab === 'RAAST'
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Zap className="h-5 w-5 mb-1 text-amber-500" />
                      <span className="text-[11px] font-bold">Raast / Sada</span>
                      <span className="text-[9px] text-muted-foreground">Zero Fee</span>
                    </button>
                  </div>
                </div>

                {/* FORM 1: Instant Card Checkout */}
                {activeTab === 'CARD' ? (
                  <form onSubmit={handleInstantCardSubmit} className="space-y-4">
                    <div className="rounded-2xl bg-muted/40 p-4 border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit Encrypted Instant Gateway
                        </div>
                        <button
                          type="button"
                          onClick={fillTestCard}
                          className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
                        >
                          ⚡ Auto-Fill Test Card
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Cardholder Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. Muhammad Ali Khan"
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Card Number (Visa / MasterCard / PayPak)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-mono text-foreground focus:border-brand-500 focus:outline-none"
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-1 text-muted-foreground">
                              <CreditCard className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              Expiry Date (MM/YY)
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="12/28"
                              maxLength={5}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-mono text-foreground focus:border-brand-500 focus:outline-none text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              CVV / Security Code
                            </label>
                            <input
                              type="password"
                              required
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="•••"
                              maxLength={4}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-mono text-foreground focus:border-brand-500 focus:outline-none text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 py-3.5 text-center text-xs font-bold text-white shadow-lg shadow-brand-600/25 hover:from-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{processingStep || 'Processing Payment...'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>
                            Pay {currencyConfig.symbol} {finalAmount.toLocaleString()} & Activate {plan.name} Now
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* FORM 2: Mobile Wallet / Bank IBFT Manual Payment Proof Form */
                  <form onSubmit={handleManualProofSubmit} className="space-y-4">
                    {/* Active Official Receiving Account Card */}
                    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/50 via-background to-card p-4 text-xs space-y-3 dark:border-brand-900/60 dark:from-brand-950/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                          Official Receiving Account Details
                        </span>
                        <span className="text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Bank / Merchant Name:</span>
                          <span className="font-bold text-foreground">
                            {activeReceivingAccount?.bankName || 'Compatible Matrimonials Merchant'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Account Title:</span>
                          <span className="font-bold text-foreground">
                            {activeReceivingAccount?.accountTitle || 'Compatible Matrimonials'}
                          </span>
                        </div>
                      </div>

                      {/* Account Number with Copy */}
                      <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">
                            {activeTab === 'RAAST' ? 'Raast ID / Account:' : 'Account / Wallet Number:'}
                          </span>
                          <span className="font-mono font-bold text-foreground text-sm">
                            {activeReceivingAccount?.accountNumber || '0300-1234567'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeReceivingAccount?.accountNumber || '0300-1234567', 'accNum')}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition"
                        >
                          {copiedField === 'accNum' ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* IBAN if available */}
                      {activeReceivingAccount?.iban && (
                        <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">IBAN Number:</span>
                            <span className="font-mono font-bold text-foreground text-xs">
                              {activeReceivingAccount.iban}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeReceivingAccount.iban!, 'iban')}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition"
                          >
                            {copiedField === 'iban' ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground">
                        💡 {activeReceivingAccount?.instructions || 'Transfer the exact amount and submit your receipt screenshot below.'}
                      </p>
                    </div>

                    {/* Form Inputs: TRX ID & Sender Account */}
                    <div className="rounded-2xl bg-muted/40 p-4 border border-border space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Transaction ID / Trx Code / Reference No. <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder="e.g. TRX-9876543210 or Bank Ref ID"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-mono text-foreground uppercase focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Sender Mobile / Account Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={senderAccount}
                          onChange={(e) => setSenderAccount(e.target.value)}
                          placeholder="e.g. 03001234567 or account name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      {/* Screenshot Attachment */}
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Payment Slip / Receipt Screenshot (Optional but recommended)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-center cursor-pointer hover:bg-muted/50 transition">
                            <Upload className="h-4 w-4 text-brand-600" />
                            <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                              {uploadedFileName || 'Choose receipt screenshot...'}
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 py-3.5 text-center text-xs font-bold text-white shadow-lg shadow-brand-600/25 hover:from-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{processingStep || 'Submitting Payment Proof...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submit Payment Proof for Verification</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Security footer badge */}
                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-600" /> 100% Encrypted & Safe
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-brand-600" /> Sharia-Compliant
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" /> 1-2 Hrs Fast Verification
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Standalone Receipt Modal if opened */}
      {submissionResult?.invoice && (
        <InvoiceReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          invoice={submissionResult.invoice}
          userName={currentUser?.name}
          userEmail={currentUser?.email}
        />
      )}
    </>
  );
}
