'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Edit2,
  CheckCircle2,
  TrendingUp,
  Globe,
  Plus,
  Trash2,
  Zap,
  Sparkles,
  ShieldCheck,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlan } from '@/lib/types';
import {
  convertPKRToCountryCurrency,
  getCurrencyForCountry,
  calculateAnnualPricing,
} from '@/lib/currency';
import { toast } from 'sonner';

export default function AdminSubscriptionsPage() {
  const { plans, updatePlan, addPlan } = useAuth();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit form state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [monthlyPricePKR, setMonthlyPricePKR] = useState<number>(0);
  const [yearlyPricePKR, setYearlyPricePKR] = useState<number>(0);
  const [connectionsLimit, setConnectionsLimit] = useState<number>(30);
  const [planBadge, setPlanBadge] = useState('');
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [canViewContactDirectly, setCanViewContactDirectly] = useState(false);
  const [canMessageDirectly, setCanMessageDirectly] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Add new plan form state
  const [newPlanSlug, setNewPlanSlug] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanMonthly, setNewPlanMonthly] = useState<number>(3000);
  const [newPlanYearly, setNewPlanYearly] = useState<number>(3000);
  const [newPlanCredits, setNewPlanCredits] = useState<number>(50);
  const [newPlanBadge, setNewPlanBadge] = useState('');
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([
    '50 connection credits',
    'Verified candidate badge',
    'Direct messaging unlocked',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Simulated viewer country for international price preview
  const [previewCountry, setPreviewCountry] = useState<string>('pakistan');
  const selectedCurrency = getCurrencyForCountry(previewCountry);

  const handleEditClick = (p: SubscriptionPlan) => {
    setEditingPlanId(p.id);
    setPlanName(p.name);
    setPlanDescription(p.description || '');
    setMonthlyPricePKR(p.monthlyPrice ?? p.price ?? 0);
    setYearlyPricePKR(p.yearlyPrice ?? p.monthlyPrice ?? p.price ?? 0);
    setConnectionsLimit(p.connectionsLimit ?? p.limits?.connectionsCount ?? (p.slug === 'BASIC' ? 30 : p.slug === 'PREMIUM' ? 100 : 300));
    setPlanBadge(p.badge || '');
    setPlanFeatures(Array.isArray(p.features) ? [...p.features] : []);
    setCanViewContactDirectly(Boolean(p.limits?.directContactAccess));
    setCanMessageDirectly(p.limits?.canChat !== false);
    setIsFeatured(Boolean(p.isPopular || p.popular || p.limits?.isFeatured));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setPlanFeatures([...planFeatures, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setPlanFeatures(planFeatures.filter((_, i) => i !== index));
  };

  const handleSavePlan = async (id: string) => {
    setIsSaving(true);
    try {
      const success = await updatePlan(id, {
        name: planName,
        description: planDescription,
        monthlyPrice: monthlyPricePKR,
        yearlyPrice: yearlyPricePKR,
        price: monthlyPricePKR,
        connectionsLimit,
        badge: planBadge.trim() ? planBadge.trim() : undefined,
        features: planFeatures,
        limits: {
          connectionsCount: connectionsLimit,
          directContactAccess: canViewContactDirectly,
          canChat: canMessageDirectly,
          isFeatured,
        },
        popular: isFeatured,
        isPopular: isFeatured,
      });

      if (success) {
        setEditingPlanId(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    setIsSaving(true);
    try {
      const slug = newPlanSlug.trim().toUpperCase() || newPlanName.trim().toUpperCase().replace(/\s+/g, '_');
      const plan: SubscriptionPlan = {
        id: `plan-${Date.now()}`,
        slug,
        name: newPlanName.trim(),
        description: newPlanDesc.trim(),
        price: newPlanMonthly,
        monthlyPrice: newPlanMonthly,
        yearlyPrice: newPlanYearly,
        currency: 'PKR',
        connectionsLimit: newPlanCredits,
        badge: newPlanBadge.trim() || undefined,
        features: newPlanFeatures,
        limits: {
          connectionsCount: newPlanCredits,
          directContactAccess: false,
          canChat: true,
          isFeatured: false,
        },
        isActive: true,
      };

      const ok = await addPlan(plan);
      if (ok) {
        setShowAddModal(false);
        setNewPlanName('');
        setNewPlanSlug('');
        setNewPlanDesc('');
        setNewPlanBadge('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out any internal FREE tier from paid card list if represented separately
  const paidPlans = plans.filter((p) => p.slug !== 'FREE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-white">Membership Packages & Quotas</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage base PKR subscription pricing, connection allocations, and international exchange preview.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
          >
            <Plus className="h-4 w-4" /> Add New Package
          </button>
        </div>
      </div>

      {/* Free Tier Standard Notice */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-zinc-300 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Free User Starter Quota:</span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40 font-mono">
                3 Free Credits
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Newly registered candidates automatically receive exactly <strong>3 Connection Credits</strong> (previously 30) for safe initial browsing and mutual match evaluation.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-zinc-400 flex items-center gap-1 shrink-0 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Database & Registration Synced
        </div>
      </div>

      {/* Currency Preview Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <Globe className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-white">Simulate Overseas Viewer Country:</span>
          <span className="text-zinc-400 text-[11px] hidden md:inline">
            (Preview how international diaspora see packages)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={previewCountry}
            onChange={(e) => setPreviewCountry(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="pakistan">🇵🇰 Pakistan (PKR - Base)</option>
            <option value="united states">🇺🇸 United States (USD $)</option>
            <option value="united kingdom">🇬🇧 United Kingdom (GBP £)</option>
            <option value="united arab emirates">🇦🇪 UAE Dubai (AED)</option>
            <option value="saudi arabia">🇸🇦 Saudi Arabia (SAR)</option>
            <option value="germany">🇪🇺 Eurozone (EUR €)</option>
            <option value="canada">🇨🇦 Canada (CAD CA$)</option>
          </select>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
            {selectedCurrency.code} ({selectedCurrency.symbol})
          </span>
        </div>
      </div>

      {/* Active Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paidPlans.map((p) => {
          const isEditing = editingPlanId === p.id;
          const monthlyPrice = p.monthlyPrice ?? p.price ?? 0;
          const yearlyPrice = p.yearlyPrice ?? monthlyPrice;
          const annualSavings = calculateAnnualPricing(monthlyPrice, yearlyPrice);
          const localizedMonthly = convertPKRToCountryCurrency(monthlyPrice, previewCountry);
          const localizedYearly = convertPKRToCountryCurrency(yearlyPrice, previewCountry);
          const creditLimit = p.connectionsLimit ?? p.limits?.connectionsCount ?? (p.slug === 'BASIC' ? 30 : p.slug === 'PREMIUM' ? 100 : 300);

          return (
            <div
              key={p.id}
              className={`rounded-3xl border ${
                isEditing
                  ? 'border-amber-500/70 bg-zinc-900 shadow-2xl ring-2 ring-amber-500/20'
                  : p.popular || p.isPopular
                  ? 'border-amber-500/40 bg-zinc-900/90 shadow-xl'
                  : 'border-zinc-800 bg-zinc-900/70 shadow-lg'
              } p-6 flex flex-col justify-between transition-all`}
            >
              <div className="space-y-4">
                {/* Plan Card Header */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 block">
                      Slug: {p.slug}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-white mt-0.5">{p.name}</h3>
                  </div>
                  {p.badge && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 min-h-[36px]">{p.description}</p>

                {isEditing ? (
                  /* Edit Mode Form */
                  <div className="space-y-3.5 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Package Name</label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                          Base Monthly (PKR)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={monthlyPricePKR}
                          onChange={(e) => setMonthlyPricePKR(Number(e.target.value))}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                          Base Yearly (PKR)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={yearlyPricePKR}
                          onChange={(e) => setYearlyPricePKR(Number(e.target.value))}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                          Connection Credits Limit
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={connectionsLimit}
                          onChange={(e) => setConnectionsLimit(Number(e.target.value))}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={planBadge}
                          onChange={(e) => setPlanBadge(e.target.value)}
                          placeholder="e.g. Most Popular"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
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

                    {/* Features Editor */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                      <label className="text-[10px] font-bold text-zinc-300 block">Manage Features List:</label>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {planFeatures.map((f, i) => (
                          <div key={i} className="flex items-center justify-between gap-1 text-[11px] bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                            <span className="text-zinc-300 truncate">{f}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(i)}
                              className="text-zinc-500 hover:text-rose-400 shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          placeholder="Add entitlement..."
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-bold text-white hover:bg-zinc-700 border border-zinc-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800 text-[11px]">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-zinc-300">Direct Contact Details Access</span>
                        <input
                          type="checkbox"
                          checked={canViewContactDirectly}
                          onChange={(e) => setCanViewContactDirectly(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-zinc-300">Direct Chat / Messaging</span>
                        <input
                          type="checkbox"
                          checked={canMessageDirectly}
                          onChange={(e) => setCanMessageDirectly(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-zinc-300">Featured Placement Badge</span>
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                        />
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSavePlan(p.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 shadow-md disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live Display Card */
                  <div className="space-y-3">
                    {/* Primary PKR Base Price */}
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Base Domestic Rate (PKR):
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-serif text-white">
                          PKR {monthlyPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold">Fixed Package</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-900">
                        <span>Annual: <strong>PKR {yearlyPrice.toLocaleString()}</strong></span>
                        {annualSavings.discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                            Save {annualSavings.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connection Quota Badge */}
                    <div className="flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 text-xs">
                      <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" /> Connection Quota:
                      </span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                        {creditLimit} Connection Credits
                      </span>
                    </div>

                    {/* Live Overseas Currency Preview */}
                    {previewCountry.toLowerCase() !== 'pakistan' && (
                      <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Globe className="h-3 w-3" /> In {previewCountry}:
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {localizedMonthly.formatted} / package
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

                {/* Plan Entitlements & Features List */}
                <div className="space-y-2 pt-4 border-t border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-300 block mb-1">Package Entitlements:</span>
                  {(p.features || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {!isEditing && (
                <div className="pt-5 mt-4 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => handleEditClick(p)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition shadow-sm"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-amber-400" /> Edit Pricing & Quota
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-Currency Matrix */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Global Multi-Currency Localization Matrix
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live conversion ratios applied automatically when visitors access matrimonial plans from international locations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { country: 'United States', code: 'USD', symbol: '$', rate: '1 USD ≈ 278 PKR' },
            { country: 'United Kingdom', code: 'GBP', symbol: '£', rate: '1 GBP ≈ 358 PKR' },
            { country: 'UAE (Dubai)', code: 'AED', symbol: 'AED', rate: '1 AED ≈ 75.8 PKR' },
            { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR', rate: '1 SAR ≈ 74.1 PKR' },
            { country: 'Eurozone', code: 'EUR', symbol: '€', rate: '1 EUR ≈ 302 PKR' },
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

      {/* Add New Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-500" /> Create Custom Membership Plan
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPlan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Platinum Crown"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    value={newPlanSlug}
                    onChange={(e) => setNewPlanSlug(e.target.value)}
                    placeholder="e.g. PLATINUM"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="e.g. High-tier executive matchmaking membership"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Monthly (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPlanMonthly}
                    onChange={(e) => setNewPlanMonthly(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Yearly (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPlanYearly}
                    onChange={(e) => setNewPlanYearly(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Credits Quota</label>
                  <input
                    type="number"
                    min={1}
                    value={newPlanCredits}
                    onChange={(e) => setNewPlanCredits(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Badge (Optional)</label>
                <input
                  type="text"
                  value={newPlanBadge}
                  onChange={(e) => setNewPlanBadge(e.target.value)}
                  placeholder="e.g. Executive"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-zinc-400 block">Plan Features:</label>
                <div className="space-y-1">
                  {newPlanFeatures.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-zinc-300">{f}</span>
                      <button
                        type="button"
                        onClick={() => setNewPlanFeatures(newPlanFeatures.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    placeholder="New bullet feature..."
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setNewPlanFeatures([...newPlanFeatures, newFeatureInput.trim()]);
                        setNewFeatureInput('');
                      }
                    }}
                    className="rounded-xl bg-zinc-800 px-3 py-2 text-white font-bold border border-zinc-700 hover:bg-zinc-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
