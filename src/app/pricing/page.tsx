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
  Building,
  CreditCard,
  PlusCircle,
  Phone,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { getPackagePriceForCountry, getCurrencyForCountry } from '@/lib/currency';
import { CheckoutModal } from '@/components/ui/checkout-modal';
import { SubscriptionPlan } from '@/lib/types';

export default function PricingPage() {
  const { plans, extraPacks, applyCoupon, currentUser, currentProfile, addExtraConnections } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{ percent?: number; fixed?: number; code?: string } | null>(null);

  // Checkout modal state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [pendingPlanSlug, setPendingPlanSlug] = useState<string>('PREMIUM');

  // Country
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

    setSelectedPlanForCheckout(planObj);
    setIsCheckoutOpen(true);
  };

  const handleBuyExtraPack = (pack: any) => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return;
    }

    const count = pack.connectionsCount || pack.connections || pack.count || 10;

    // Wrap as pseudo plan for checkout modal
    const pseudoPlan: SubscriptionPlan = {
      id: pack.id,
      name: pack.name,
      slug: pack.id,
      description: `${count} Extra Connection Credits Top-Up`,
      currency: 'PKR',
      monthlyPrice: pack.pricePKR || pack.priceNum || 1000,
      yearlyPrice: pack.pricePKR || pack.priceNum || 1000,
      connectionsLimit: count,
      connectionLimit: count,
      features: [`${count} Additional Connection Credits`, 'Valid with your current package', 'No monthly expiry'],
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Header (Section 1 & 2) */}
      <div className="border-b border-border bg-gradient-to-b from-brand-950/20 via-background to-background py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3.5 py-1 text-xs font-bold text-gold-700 dark:text-gold-300 shadow-sm">
            <Crown className="h-4 w-4 text-gold-500" /> Connection-Based Matchmaking Packages
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-foreground">
            Invest in Sacred Companionship
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our primary model is strictly connection-based. Free profile browsing with zero deductions. 
            Credits deduct only upon mutual consent or direct contact unlock. <strong>Credits never expire monthly</strong>.
          </p>
        </div>
      </div>

      {/* Connection Packages Grid (Section 2 & 87) */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full space-y-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {plans.map((p) => {
            const rawPKR = p.monthlyPrice || 2000;
            const priceConfig = getPackagePriceForCountry(p.slug, selectedCountry, rawPKR);
            let displayAmount = priceConfig.amount;

            if (discountInfo?.percent && displayAmount > 0) {
              displayAmount = Math.round(displayAmount * (1 - discountInfo.percent / 100));
            } else if (discountInfo?.fixed && displayAmount > 0) {
              displayAmount = Math.max(0, displayAmount - discountInfo.fixed);
            }

            const connectionCount =
              p.connectionLimit ||
              (p.slug === 'VIP' || p.slug === 'PREMIUM_PLUS' ? 300 : p.slug === 'PREMIUM' ? 100 : 30);

            const isVip = p.slug === 'VIP' || p.slug === 'PREMIUM_PLUS';
            const isPopular = p.isPopular || p.slug === 'PREMIUM';

            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-2xl ${
                  isVip
                    ? 'border-gold-500 bg-gradient-to-b from-gold-50/30 via-card to-card dark:from-gold-950/20 shadow-xl'
                    : isPopular
                    ? 'border-brand-500 bg-white ring-2 ring-brand-500 shadow-xl dark:bg-card'
                    : 'border-border bg-card'
                }`}
              >
                {isVip ? (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-gold-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-black shadow-md">
                    Royal Bespoke
                  </span>
                ) : isPopular ? (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-brand-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                    Most Popular
                  </span>
                ) : null}

                <h3 className="text-2xl font-bold text-foreground font-serif">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4 min-h-[32px]">{p.description}</p>

                {/* Price & Connection Highlight */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-foreground font-serif">
                      Rs. {displayAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">/ one-time</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-2 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-800 dark:text-brand-300 px-3 py-1 text-xs font-bold font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                    {connectionCount} Fixed Connection Credits
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground mb-6">
                  Purchased credits remain active without monthly expiration.
                </p>

                {/* Features list */}
                <div className="border-t border-border pt-6 mb-8 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                    Package Inclusions:
                  </span>
                  <ul className="space-y-3 text-xs">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-foreground/90">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {isVip && (
                      <li className="flex items-start gap-2.5 font-bold text-gold-700 dark:text-gold-300">
                        <Crown className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                        <span>Dedicated Senior Family Consultant Assigned</span>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(p.slug)}
                  className={`w-full rounded-2xl py-3.5 text-center text-xs font-bold transition shadow-sm cursor-pointer ${
                    isVip
                      ? 'bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold shadow-md'
                      : isPopular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
                      : 'border border-border bg-muted/40 text-foreground hover:bg-muted'
                  }`}
                >
                  Select {p.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Section 38: Buy Additional Connections Section */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                <PlusCircle className="h-4 w-4" /> Top-Up Available Any Time
              </div>
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Buy Additional Connections
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Already have a package? Purchase extra connection credit packs anytime to continue unlocking contact details.
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">Section 38 Feature</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'PACK_10', name: '10 Connections Pack', count: 10, price: 'Rs. 1,000', priceNum: 1000 },
              { id: 'PACK_30', name: '30 Connections Pack', count: 30, price: 'Rs. 2,500', priceNum: 2500, popular: true },
              { id: 'PACK_50', name: '50 Connections Pack', count: 50, price: 'Rs. 4,000', priceNum: 4000 },
              { id: 'PACK_100', name: '100 Connections Pack', count: 100, price: 'Rs. 7,500', priceNum: 7500, bestValue: true },
            ].map((pack) => (
              <div
                key={pack.id}
                className="relative rounded-2xl border border-border bg-muted/20 p-5 hover:border-brand-500 transition flex flex-col justify-between"
              >
                {pack.bestValue ? (
                  <span className="absolute -top-2.5 right-3 bg-gold-600 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Best Value
                  </span>
                ) : pack.popular ? (
                  <span className="absolute -top-2.5 right-3 bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Popular
                  </span>
                ) : null}

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{pack.name}</h4>
                  <div className="text-xl font-black font-serif text-brand-600 my-1">
                    {pack.price}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Instant top-up of {pack.count} contact unlock credits.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyExtraPack(pack)}
                  className="mt-4 w-full rounded-xl bg-card border border-border hover:border-brand-500 hover:text-brand-600 text-foreground py-2 text-xs font-bold transition shadow-xs"
                >
                  Buy Extra Pack
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Coupon Section (Section 36 & 37) */}
        <div className="mx-auto max-w-md p-6 rounded-3xl border border-border bg-card shadow-sm text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
            <Tag className="h-4 w-4 text-brand-600" /> Have a Promotional Code? (e.g. VIP20)
          </div>
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter Promo Code..."
              className="flex-1 rounded-2xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-mono uppercase text-foreground focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-sm"
            >
              Apply
            </button>
          </form>
          {discountInfo && (
            <p className="text-xs text-emerald-600 font-medium">
              Applied {discountInfo.code}:{' '}
              {discountInfo.percent ? `${discountInfo.percent}% Discount` : `Rs. ${discountInfo.fixed} Off`}
            </p>
          )}
        </div>

        {/* Section 88: Comprehensive FAQ Section */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-serif text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted-foreground">
              Everything you need to know about our connection credit policy and verification process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-4">
            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">What is a connection?</h4>
              <p className="text-muted-foreground leading-relaxed">
                A connection is a credit that permits mutual contact revelation (phone, WhatsApp, and email) with an approved prospective partner.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">When is a connection deducted?</h4>
              <p className="text-muted-foreground leading-relaxed">
                A connection credit is only deducted when you explicitly unlock a member's contact details or when your mutual interest is accepted. Simply browsing profiles never deducts credits.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">Do connection credits expire monthly?</h4>
              <p className="text-muted-foreground leading-relaxed">
                No! Connection credits do not expire on a monthly basis. They remain safely stored on your profile balance until you decide to use them.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">How does payment approval work?</h4>
              <p className="text-muted-foreground leading-relaxed">
                You transfer via Bank Transfer or online banking and upload your receipt screenshot. Our administration team cross-checks the transaction ID and activates your credits immediately.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">Is my contact information private?</h4>
              <p className="text-muted-foreground leading-relaxed">
                100% confidential. Your telephone numbers and identity papers are never visible publicly. Only verified candidates with approved mutual connections can view contact details.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="font-bold text-foreground">What does a Senior Family Consultant do?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Our Senior Family Consultants provide private family background screening, handpick matching profiles, schedule dignified family discussions, and assist throughout the proposal process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={selectedPlanForCheckout}
          selectedCountry={selectedCountry}
          initialDiscount={discountInfo}
          onSuccess={() => {
            setIsCheckoutOpen(false);
          }}
        />
      )}

      {/* Auth Prompt Modal */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base font-serif text-foreground">
              Sign In or Register to Continue
            </h3>
            <p className="text-xs text-muted-foreground">
              Please sign in to your VIP Royal account or create your matrimonial profile to purchase packages.
            </p>
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full block rounded-xl bg-brand-600 hover:bg-brand-700 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Sign In to Existing Account
              </Link>
              <Link
                href="/register"
                className="w-full block rounded-xl border border-border hover:bg-muted py-2.5 text-xs font-bold text-foreground"
              >
                Create New Member Profile
              </Link>
            </div>
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-xs text-muted-foreground hover:underline pt-2 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
