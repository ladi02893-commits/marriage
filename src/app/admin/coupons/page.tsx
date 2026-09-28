'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  Copy,
  Check,
  Trash2,
  Search,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Coupon } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, toggleCouponStatus, deleteCoupon } = useAuth();

  // Generator form state
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [newPercent, setNewPercent] = useState<number>(20);
  const [newFixedDiscount, setNewFixedDiscount] = useState<number>(500);
  const [newLimit, setNewLimit] = useState<number>(100);
  const [newExpiry, setNewExpiry] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL');

  const generateRandomCode = () => {
    const prefixes = ['PAIR', 'MARRY', 'NIKAH', 'RISHTA', 'VIP', 'OFFER', 'EID'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setNewCode(`${randomPrefix}${randomNum}`);
  };

  const setExpiryDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNewExpiry(d.toISOString().split('T')[0]);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a coupon code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newC: Coupon = {
        id: `coup-${Date.now()}`,
        code: cleanCode,
        discountPercent: discountType === 'PERCENT' ? newPercent : undefined,
        fixedDiscount: discountType === 'FIXED' ? newFixedDiscount : undefined,
        expiresAt: new Date(`${newExpiry}T23:59:59Z`).toISOString(),
        usageLimit: newLimit,
        timesUsed: 0,
        isActive: true,
      };

      await addCoupon(newC);
      setNewCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }
    if (deleteCoupon) {
      await deleteCoupon(id);
    }
  };

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive && new Date(c.expiresAt) >= new Date()).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.timesUsed || 0), 0);
  const expiredCoupons = coupons.filter((c) => new Date(c.expiresAt) < new Date()).length;

  // Filtered list
  const filteredCoupons = coupons.filter((c) => {
    if (searchQuery.trim()) {
      if (!c.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    const isExpired = new Date(c.expiresAt) < new Date();
    if (statusFilter === 'ACTIVE') return c.isActive && !isExpired;
    if (statusFilter === 'INACTIVE') return !c.isActive;
    if (statusFilter === 'EXPIRED') return isExpired;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-white">Promotional Coupons & Vouchers</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate and monitor discount vouchers for wedding seasons, holiday campaigns, and matrimonial packages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">Total Vouchers</span>
          <p className="text-2xl font-black font-serif text-white">{totalCoupons}</p>
          <span className="text-[10px] text-zinc-500">Configured campaigns</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-1">
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active Now
          </span>
          <p className="text-2xl font-black font-serif text-emerald-400">{activeCoupons}</p>
          <span className="text-[10px] text-zinc-500">Live for checkout</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-1">
          <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" /> Total Redemptions
          </span>
          <p className="text-2xl font-black font-serif text-amber-400 font-mono">{totalRedemptions}</p>
          <span className="text-[10px] text-zinc-500">Times redeemed by members</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-1">
          <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" /> Expired Codes
          </span>
          <p className="text-2xl font-black font-serif text-rose-400">{expiredCoupons}</p>
          <span className="text-[10px] text-zinc-500">Past validity date</span>
        </div>
      </div>

      {/* Voucher Generator Form */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-500" /> Generate New Discount Voucher
          </h3>
          <button
            type="button"
            onClick={generateRandomCode}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl"
          >
            <Sparkles className="h-3 w-3" /> Generate Random Code
          </button>
        </div>

        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Code */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. SPRING30"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs font-mono font-bold uppercase text-amber-400 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Type & Value */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-400 block">Discount Type</label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`px-1.5 py-0.5 rounded ${
                      discountType === 'PERCENT' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED')}
                    className={`px-1.5 py-0.5 rounded ${
                      discountType === 'FIXED' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    PKR
                  </button>
                </div>
              </div>
              {discountType === 'PERCENT' ? (
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={newPercent}
                    onChange={(e) => setNewPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs font-mono text-white pr-7 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-zinc-500 font-bold">%</span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={newFixedDiscount}
                    onChange={(e) => setNewFixedDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs font-mono text-white pr-12 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-zinc-500 font-mono">PKR</span>
                </div>
              )}
            </div>

            {/* Usage limit */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Max Redemptions</label>
              <input
                type="number"
                min={1}
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Expiry */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-400 block">Expiry Date</label>
                <div className="flex gap-1 text-[9px] text-zinc-500">
                  <button type="button" onClick={() => setExpiryDays(30)} className="hover:text-amber-400">+30d</button>
                  <span>•</span>
                  <button type="button" onClick={() => setExpiryDays(90)} className="hover:text-amber-400">+90d</button>
                  <span>•</span>
                  <button type="button" onClick={() => setExpiryDays(365)} className="hover:text-amber-400">+1y</button>
                </div>
              </div>
              <input
                type="date"
                required
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Voucher'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Roster & Filters */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Configured Vouchers ({filteredCoupons.length})</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-[11px]">
              {(['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    statusFilter === filter ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Tag className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No discount coupons found</p>
            <p className="text-xs text-zinc-500">
              {coupons.length === 0
                ? 'Generate your first promotional voucher using the creator form above.'
                : 'No coupons match your active search or filter selection.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-3">Voucher Code</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Usage Progress</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredCoupons.map((c) => {
                  const isExpired = new Date(c.expiresAt) < new Date();
                  const isDepleted = c.timesUsed >= c.usageLimit;
                  const usagePercent = Math.min(100, Math.round(((c.timesUsed || 0) / (c.usageLimit || 1)) * 100));

                  return (
                    <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                      {/* Code */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">{c.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            title="Copy Code"
                            className="p-1 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition"
                          >
                            {copiedCode === c.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                          {c.discountPercent ? `${c.discountPercent}% OFF` : `PKR ${c.fixedDiscount} OFF`}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
                            <span>{c.timesUsed} used</span>
                            <span className="text-zinc-500">/ {c.usageLimit} max</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercent >= 100
                                  ? 'bg-rose-500'
                                  : usagePercent > 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-3 text-zinc-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{new Date(c.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-[10px] block ${isExpired ? 'text-rose-400 font-semibold' : 'text-zinc-500'}`}>
                          {isExpired ? 'Expired' : `Valid until 23:59`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {isExpired ? (
                          <span className="rounded-full bg-rose-950/80 border border-rose-800/80 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                            Expired
                          </span>
                        ) : isDepleted ? (
                          <span className="rounded-full bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                            Exhausted
                          </span>
                        ) : c.isActive ? (
                          <span className="rounded-full bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleCouponStatus(c.id)}
                            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                          >
                            {c.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.code)}
                            title="Delete coupon"
                            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
