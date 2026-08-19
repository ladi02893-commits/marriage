'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Calendar, Percent } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Coupon } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, toggleCouponStatus } = useAuth();
  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState<number>(20);
  const [newLimit, setNewLimit] = useState<number>(200);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newC: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discountPercent: newPercent,
      expiresAt: '2025-12-31T23:59:59Z',
      usageLimit: newLimit,
      timesUsed: 0,
      isActive: true,
    };

    addCoupon(newC);
    setNewCode('');
    toast.success(`Coupon ${newC.code} generated successfully!`);
  };

  const handleToggleCouponStatus = (id: string) => {
    toggleCouponStatus(id);
    toast.info('Coupon status updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Promotional Coupons & Vouchers</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create and monitor discount codes for seasonal campaigns and matrimonial galas.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="h-4 w-4 text-amber-500" /> Generate New Discount Voucher
        </h3>

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Coupon Code</label>
            <input
              type="text"
              required
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. SUMMERLOVE30"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs uppercase text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Discount (%)</label>
            <input
              type="number"
              min={5}
              max={90}
              value={newPercent}
              onChange={(e) => setNewPercent(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Max Redemptions</label>
            <input
              type="number"
              min={10}
              value={newLimit}
              onChange={(e) => setNewLimit(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-2 text-xs font-bold text-black hover:bg-amber-400"
            >
              Generate Code
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Code</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Discount</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Usage / Limit</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">{c.code}</td>
                  <td className="py-3.5 px-4 text-white font-bold">
                    {c.discountPercent ? `${c.discountPercent}% OFF` : `$${c.fixedDiscount} OFF`}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    {c.timesUsed} / {c.usageLimit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleCouponStatus(c.id)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
