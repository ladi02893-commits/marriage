'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Save,
  Crown,
  CheckCircle2,
  DollarSign,
  Globe,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  RefreshCw,
  Edit2,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan } from '@/lib/types';
import { toast } from 'sonner';
import {
  getCurrencyForCountry,
  formatCurrencyByCountry,
  getPackagePriceForCountry,
  calculateAnnualPricing,
  COUNTRY_CURRENCY_MAP,
} from '@/lib/currency';

export default function AdminSubscriptionsPage() {
  const { plans, updatePlan, addPlan } = useAuth();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Edit form state in PKR
  const [monthlyPrice, setMonthlyPrice] = useState<number>(15000);
  const [yearlyPrice, setYearlyPrice] = useState<number>(35000);
  const [connectionLimit, setConnectionLimit] = useState<number>(2);
  const [planDescription, setPlanDescription] = useState<string>('');

  // Interactive Live Currency Simulator for Admin
  const [previewCountry, setPreviewCountry] = useState<string>('Pakistan');

  const popularPreviewCountries = [
    { name: 'Pakistan', code: 'PKR', flag: '🇵🇰', label: 'Pakistan (PKR - Domestic Base)' },
    { name: 'United States', code: 'USD', flag: '🇺🇸', label: 'United States (USD $)' },
    { name: 'United Kingdom', code: 'GBP', flag: '🇬🇧', label: 'United Kingdom (GBP £)' },
    { name: 'United Arab Emirates', code: 'AED', flag: '🇦🇪', label: 'United Arab Emirates (AED)' },
    { name: 'Saudi Arabia', code: 'SAR', flag: '🇸🇦', label: 'Saudi Arabia (SAR)' },
    { name: 'Canada', code: 'CAD', flag: '🇨🇦', label: 'Canada (CAD CA$)' },
    { name: 'Germany', code: 'EUR', flag: '🇪🇺', label: 'Europe (Euro €)' },
    { name: 'Australia', code: 'AUD', flag: '🇦🇺', label: 'Australia (AUD AU$)' },
    { name: 'Qatar', code: 'QAR', flag: '🇶🇦', label: 'Qatar (QAR)' },
  ];

  const selectedCurrency = getCurrencyForCountry(previewCountry);

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setMonthlyPrice(plan.monthlyPrice);
    setYearlyPrice(plan.yearlyPrice);
    setConnectionLimit(plan.limits?.monthlyInterests ?? (plan.slug === 'BASIC' ? 2 : plan.slug === 'PREMIUM' ? 50 : 200));
    setPlanDescription(plan.description);
  };

  const handleSavePlan = (planId: string) => {
    const existing = plans.find((p) => p.id === planId);
    updatePlan(planId, {
      monthlyPrice: Number(monthlyPrice),
      yearlyPrice: Number(yearlyPrice),
      description: planDescription,
      currency: 'PKR',
      limits: {
        ...(existing?.limits || {
          dailyDirectMessages: 5,
          canViewVisitors: false,
          hasPriorityMatching: false,
          hasFeaturedBadge: false,
          directContactAccess: false,
        }),
        monthlyInterests: Number(connectionLimit),
      },
    });
    setEditingPlanId(null);
    toast.success('Subscription pricing tier & connection limits updated successfully in PKR!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20 mb-1">
            <CreditCard className="h-3.5 w-3.5" /> Pricing & Multi-Currency Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Membership Packages & Currency Architecture
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage base PKR subscription pricing and inspect automatic multi-currency conversion for overseas candidates.
          </p>
        </div>

        {/* Currency Preview Selector */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
          <Globe className="h-4 w-4 text-amber-400 shrink-0 ml-1" />
          <span className="text-xs text-zinc-400 font-medium">Simulator:</span>
          <select
            value={previewCountry}
            onChange={(e) => setPreviewCountry(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            {popularPreviewCountries.map((c) => (
              <option key={c.name} value={c.name} className="bg-zinc-950 text-white">
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currency Conversion Engine Banner */}
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Automatic Location-Based Currency Localization Active
              <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                100% Automated
              </span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-3xl mt-0.5 leading-relaxed">
              Base plans are stored and audited in <strong>Pakistani Rupees (PKR)</strong>. When candidates in the UK, USA, UAE, Saudi Arabia, or Canada view packages or profiles, the system automatically converts prices into their local currency using active market rates.
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 px-4 py-2.5 rounded-2xl border border-zinc-800 shrink-0 text-right">
          <span className="text-[10px] text-zinc-400 block">Current Simulator Currency:</span>
          <span className="font-mono text-sm font-black text-amber-400">
            {selectedCurrency.code} ({selectedCurrency.symbol}) - {selectedCurrency.name}
          </span>
        </div>
      </div>

      {/* Subscription Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isEditing = editingPlanId === p.id;
          const localizedMonthly = getPackagePriceForCountry(p.slug, previewCountry, p.monthlyPrice);
          const localizedYearly = getPackagePriceForCountry(p.slug, previewCountry, p.yearlyPrice);
          const annualSavings = calculateAnnualPricing(p.monthlyPrice, p.yearlyPrice);

          return (
            <div
              key={p.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all duration-300 ${
                p.isPopular
                  ? 'border-amber-500/60 bg-zinc-900 ring-1 ring-amber-500/30'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white font-serif">{p.name}</h3>
                  {p.badge && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-5 min-h-[32px]">{p.description}</p>

                {isEditing ? (
                  /* Edit Form (in PKR) */
                  <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 block mb-1">
                        Monthly Base Price (PKR) *
                      </label>
                      <input
                        type="number"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-xs text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 block mb-1">
                        Annual Base Price (PKR) *
                      </label>
                      <input
                        type="number"
                        value={yearlyPrice}
                        onChange={(e) => setYearlyPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-xs text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-400 block mb-1">
                        Connection / Interest Quota Limit (Monthly) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={connectionLimit}
                        onChange={(e) => setConnectionLimit(Number(e.target.value))}
                        placeholder="e.g. Free: 2, Elite: 50, VIP: 200"
                        className="w-full rounded-xl border border-emerald-600/50 bg-zinc-900 p-2.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Profiles lock automatically when a user exhausts this connection quota.
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Plan Description</label>
                      <input
                        type="text"
                        value={planDescription}
                        onChange={(e) => setPlanDescription(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePlan(p.id)}
                        className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 shadow-md"
                      >
                        Save in PKR & Update Limit
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live Display with PKR Base & International Conversion */
                  <div className="space-y-3">
                    {/* Primary PKR Base Price */}
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Base Price (Pakistan / PKR):
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-serif text-white">
                          PKR {p.monthlyPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400">/ month</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>Annual: <strong>PKR {p.yearlyPrice.toLocaleString()}</strong></span>
                        {annualSavings.discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                            Save {annualSavings.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connection Quota Highlight */}
                    <div className="flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 text-xs">
                      <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" /> Connection Limit:
                      </span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                        {p.limits?.monthlyInterests || 2} Connections / mo
                      </span>
                    </div>

                    {/* Live Localized Country Conversion (for simulated country) */}
                    {previewCountry.toLowerCase() !== 'pakistan' && (
                      <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Globe className="h-3 w-3" /> In {previewCountry}:
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {localizedMonthly.formatted} / mo
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-amber-500/15">
                          <span>Annual: <strong>{localizedYearly.formatted} / yr</strong></span>
                          <span className="text-amber-300 font-mono font-semibold">
                            (≈ {selectedCurrency.symbol}{Math.round(localizedYearly.amount / 12)}/mo)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Plan Entitlements & Features */}
                <div className="space-y-2 pt-5 border-t border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-300 block mb-2">Package Entitlements:</span>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => handleEditClick(p)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
                >
                  <Edit2 className="h-3.5 w-3.5 text-amber-400" /> Edit Pricing in PKR
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-Currency Exchange Rates Reference Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Global Multi-Currency Rate Matrix
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reference exchange ratios automatically applied to convert PKR packages for international users.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { country: 'United States', code: 'USD', symbol: '$', rate: '1 USD ≈ 278 PKR' },
            { country: 'United Kingdom', code: 'GBP', symbol: '£', rate: '1 GBP ≈ 357 PKR' },
            { country: 'UAE (Dubai)', code: 'AED', symbol: 'AED', rate: '1 AED ≈ 75.8 PKR' },
            { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR', rate: '1 SAR ≈ 74.1 PKR' },
            { country: 'Eurozone', code: 'EUR', symbol: '€', rate: '1 EUR ≈ 303 PKR' },
            { country: 'Canada', code: 'CAD', symbol: 'CA$', rate: '1 CAD ≈ 204 PKR' },
          ].map((item) => (
            <div key={item.code} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-white">
                <span>{item.code}</span>
                <span className="font-mono text-amber-400">{item.symbol}</span>
              </div>
              <p className="text-[11px] text-zinc-400">{item.country}</p>
              <p className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-zinc-900">{item.rate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
