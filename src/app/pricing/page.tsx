'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Crown,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight,
  HelpCircle,
  Lock,
  Globe,
  LogIn,
  UserPlus,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { getPackagePriceForCountry, getCurrencyForCountry, COUNTRY_CURRENCY_MAP } from '@/lib/currency';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { SubscriptionPlan } from '@/lib/types';

export default function PricingPage() {
  const { plans, applyCoupon, currentUser, currentProfile, updateUserSubscription } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{ percent?: number; fixed?: number; code?: string } | null>(null);

  // Checkout modal state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [pendingPlanSlug, setPendingPlanSlug] = useState<string>('PREMIUM');

  // Default country to user's country or Pakistan
  const [selectedCountry, setSelectedCountry] = useState<string>(
    currentProfile?.country || 'Pakistan'
  );

  const currencyConfig = getCurrencyForCountry(selectedCountry);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (res.valid) {
      setDiscountInfo({ percent: res.discountPercent, fixed: res.fixedDiscount, code: couponCode.trim().toUpperCase() });
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleSelectPlan = (planSlug: string) => {
    const planObj = plans.find((p) => p.slug.toUpperCase() === planSlug.toUpperCase()) || plans[0];

    if (!currentUser) {
      setPendingPlanSlug(planSlug);
      setIsAuthPromptOpen(true);
      return;
    }

    if (planSlug.toUpperCase() === 'BASIC') {
      if (currentUser.subscriptionTier === 'FREE') {
        toast.info('You are already on the Basic (Free) tier.');
        return;
      }
      updateUserSubscription('FREE');
      toast.success('Your account has been switched to Basic (Free) membership.');
      return;
    }

    // Open rich checkout modal for paid plans
    setSelectedPlanForCheckout(planObj);
    setIsCheckoutOpen(true);
  };

  const popularCountries = [
    { name: 'Pakistan', code: 'PKR', flag: '🇵🇰' },
    { name: 'United Kingdom', code: 'GBP', flag: '🇬🇧' },
    { name: 'United States', code: 'USD', flag: '🇺🇸' },
    { name: 'United Arab Emirates', code: 'AED', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: 'SAR', flag: '🇸🇦' },
    { name: 'Canada', code: 'CAD', flag: '🇨🇦' },
    { name: 'Germany', code: 'EUR', flag: '🇩🇪' },
    { name: 'Australia', code: 'AUD', flag: '🇦🇺' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-brand-50/70 via-background to-background py-16 text-center dark:from-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm dark:border-brand-900 dark:bg-card dark:text-brand-300">
            <Crown className="h-4 w-4 text-gold-500" /> Transparent Matrimonial Membership
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-foreground">
            Invest in Your Sacred Future
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Gain direct access to verified contact dossiers, unlimited messaging with prospective matches, and dedicated matchmaking guidance.
          </p>

          {/* Location & Country Currency Switcher */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs shadow-sm">
              <Globe className="h-4 w-4 text-brand-600" />
              <span className="text-muted-foreground font-medium">Pricing Currency:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {popularCountries.map((c) => (
                  <option key={c.name} value={c.name} className="bg-card text-foreground">
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Switch (Monthly / Annual) */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-brand-600 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual Billing{' '}
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-800 dark:bg-gold-950 dark:text-gold-300">
                SAVE 35%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {plans.map((p) => {
            // Base amount in PKR for either monthly or annual billing
            const rawMonthlyPKR = p.monthlyPrice || 0;
            const rawYearlyPKR = p.yearlyPrice || 0;

            const effectiveMonthlyPKR = isAnnual && rawYearlyPKR > 0
              ? Math.round(rawYearlyPKR / 12)
              : rawMonthlyPKR;

            const priceConfig = getPackagePriceForCountry(p.slug, selectedCountry, effectiveMonthlyPKR);
            const yearlyTotalConfig = getPackagePriceForCountry(p.slug, selectedCountry, rawYearlyPKR);

            let monthlyDisplayAmount = priceConfig.amount;
            if (discountInfo?.percent && monthlyDisplayAmount > 0) {
              monthlyDisplayAmount = Math.round(monthlyDisplayAmount * (1 - discountInfo.percent / 100));
            } else if (discountInfo?.fixed && monthlyDisplayAmount > 0) {
              monthlyDisplayAmount = Math.max(0, monthlyDisplayAmount - discountInfo.fixed);
            }

            const isCurrent =
              currentUser &&
              (((p.slug === 'BASIC' || p.slug === 'FREE') && currentUser.subscriptionTier === 'FREE') ||
                (p.slug === 'PREMIUM' && currentUser.subscriptionTier === 'PREMIUM') ||
                ((p.slug === 'VIP' || p.slug === 'PREMIUM_PLUS') && currentUser.subscriptionTier === 'PREMIUM_PLUS'));

            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-2xl ${
                  p.isPopular
                    ? 'border-brand-500 bg-white ring-2 ring-brand-500 shadow-xl dark:bg-card'
                    : 'border-border bg-card'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-brand-600 to-rose-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                    {p.badge}
                  </span>
                )}

                <h3 className="text-2xl font-bold text-foreground font-serif">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-6 min-h-[36px]">{p.description}</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-foreground font-serif">
                    {monthlyDisplayAmount === 0 ? 'Free' : `${currencyConfig.symbol} ${monthlyDisplayAmount.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-6">
                  {monthlyDisplayAmount === 0
                    ? 'Free forever for genuine matrimonial candidates'
                    : isAnnual
                    ? `Billed annually at ${currencyConfig.symbol} ${yearlyTotalConfig.amount.toLocaleString()} (${currencyConfig.code})`
                    : `Billed monthly in ${currencyConfig.code}, cancel anytime`}
                </div>

                <div className="border-t border-border pt-6 mb-8 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                    Plan Highlights:
                  </span>
                  <ul className="space-y-3 text-xs">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-foreground/90">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(p.slug)}
                  className={`w-full rounded-2xl py-3.5 text-center text-xs font-bold transition shadow-sm cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white cursor-default'
                      : p.isPopular
                      ? 'bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 text-white shadow-brand-600/25 hover:from-brand-700'
                      : 'border border-border bg-muted/40 text-foreground hover:bg-muted'
                  }`}
                >
                  {isCurrent ? 'Current Active Plan' : p.slug === 'BASIC' ? 'Select Basic Plan' : `Upgrade to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Promo Coupon Section */}
        <div className="mx-auto max-w-md mt-12 p-6 rounded-3xl border border-border bg-card shadow-sm text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
            <Tag className="h-4 w-4 text-brand-600" /> Have a Promotional Code?
          </div>
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. WELCOME20"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs uppercase font-mono text-foreground focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition cursor-pointer"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Auth Prompt Modal (if unauthenticated user attempts upgrade) */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Crown className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-serif text-foreground">
                Sign In to Upgrade Membership
              </h3>
              <p className="text-xs text-muted-foreground">
                Please sign in or create an account to activate your subscription and unlock verified matrimonial profiles.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/login?redirect=/pricing"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md hover:from-brand-700 transition"
              >
                <LogIn className="h-4 w-4" /> Sign In to Your Account
              </Link>
              <Link
                href={`/register?plan=${pendingPlanSlug.toLowerCase()}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition"
              >
                <UserPlus className="h-4 w-4 text-brand-600" /> Create New Profile & Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPlanForCheckout(null);
          }}
          plan={selectedPlanForCheckout}
          initialBillingCycle={isAnnual ? 'ANNUAL' : 'MONTHLY'}
          selectedCountry={selectedCountry}
          initialDiscount={discountInfo}
        />
      )}

      <Footer />
    </div>
  );
}
