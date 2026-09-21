'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Save,
  ShieldCheck,
  Sparkles,
  Scale,
  Percent,
  ToggleLeft,
  ToggleRight,
  Crown,
  Key,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminSystemSettingsPage() {
  const { settings, updateSettings } = useAuth();

  const [siteName, setSiteName] = useState(settings.siteName || 'VIP Royal Matchmaking');
  const [minAge, setMinAge] = useState(settings.minAge || 18);
  const [profilePrefix, setProfilePrefix] = useState(settings.profileIdPrefix || 'VRM-');

  // Governance Toggles (Section 84)
  const [allowRegistrations, setAllowRegistrations] = useState(settings.allowNewRegistrations ?? true);
  const [requireProfileApproval, setRequireProfileApproval] = useState(settings.requireAdminProfileApproval ?? true);
  const [requireWhatsappVerification, setRequireWhatsappVerification] = useState(settings.requireWhatsAppVerification ?? true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(settings.requireEmailVerification ?? true);
  const [freeTierLimit, setFreeTierLimit] = useState(settings.freeTierConnectionsLimit || 30);
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState(settings.whatsappSupportNumber || '+92 300 1234567');

  // Tax Settings (Section 35)
  const [taxEnabled, setTaxEnabled] = useState(settings.tax?.taxEnabled ?? false);
  const [taxPercent, setTaxPercent] = useState(settings.tax?.taxPercentage ?? 5);
  const [taxLabel, setTaxLabel] = useState(settings.tax?.taxLabel || 'Service & Verification Fee');

  // Matching Weights
  const [ageW, setAgeW] = useState(settings.matchingWeights.ageWeight || 25);
  const [locW, setLocW] = useState(settings.matchingWeights.locationWeight || 20);
  const [eduW, setEduW] = useState(settings.matchingWeights.educationWeight || 15);
  const [profW, setProfW] = useState(settings.matchingWeights.professionWeight || 15);
  const [lifeW, setLifeW] = useState(settings.matchingWeights.lifestyleWeight || 10);
  const [famW, setFamW] = useState(settings.matchingWeights.familyWeight || 10);
  const [marW, setMarW] = useState(settings.matchingWeights.maritalWeight || 5);

  const totalWeights = ageW + locW + eduW + profW + lifeW + famW + marW;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      minAge,
      profileIdPrefix: profilePrefix,
      allowNewRegistrations: allowRegistrations,
      requireEmailVerification,
      requireWhatsAppVerification: requireWhatsappVerification,
      requireAdminProfileApproval: requireProfileApproval,
      freeTierConnectionsLimit: Number(freeTierLimit),
      whatsappSupportNumber: whatsappSupportNumber.trim(),
      tax: {
        taxEnabled,
        taxPercentage: Number(taxPercent),
        taxFixed: 0,
        taxLabel,
      },
      matchingWeights: {
        ageWeight: ageW,
        locationWeight: locW,
        educationWeight: eduW,
        professionWeight: profW,
        lifestyleWeight: lifeW,
        familyWeight: famW,
        maritalWeight: marW,
      },
    });
    toast.success('VIP Royal platform settings and tax parameters updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Crown className="h-4 w-4" /> System Settings & Engine Governance
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">Platform Settings & Control</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure profile approval workflows, WhatsApp OTP verification, service tax fees, and matching algorithm weights.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black shadow-md hover:bg-amber-400"
        >
          <Save className="h-4 w-4" /> Save All Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Rules & Governance (Section 84) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
            Workflow Governance & Verification
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Profile ID Prefix</label>
              <input
                type="text"
                value={profilePrefix}
                onChange={(e) => setProfilePrefix(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono uppercase"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Output format: {profilePrefix}000001</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Free Tier Connections</label>
                <input
                  type="number"
                  min={0}
                  value={freeTierLimit}
                  onChange={(e) => setFreeTierLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">WhatsApp Support Line</label>
                <input
                  type="text"
                  value={whatsappSupportNumber}
                  onChange={(e) => setWhatsappSupportNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-white font-semibold block">New Member Registrations</span>
                  <span className="text-[11px] text-zinc-500">Allow public registrations via /register</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowRegistrations}
                  onChange={(e) => setAllowRegistrations(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-white font-semibold block">Require Admin Profile Approval</span>
                  <span className="text-[11px] text-zinc-500">Profiles hide from public search until approved</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireProfileApproval}
                  onChange={(e) => setRequireProfileApproval(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-white font-semibold block">WhatsApp OTP Verification</span>
                  <span className="text-[11px] text-zinc-500">Dispatch VIP-XXXXXX code during signup</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireWhatsappVerification}
                  onChange={(e) => setRequireWhatsappVerification(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Tax System (Section 35) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="h-4 w-4 text-amber-500" /> Tax & Service Fee System
            </h3>
            <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-amber-500"
              />
              <span>Enable Tax</span>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Tax Label / Description</label>
              <input
                type="text"
                value={taxLabel}
                onChange={(e) => setTaxLabel(e.target.value)}
                placeholder="e.g. Service Fee or VAT"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Tax Percentage (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-24 rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white text-center font-mono"
                />
                <span className="text-zinc-500 font-bold">%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              When enabled, a {taxPercent}% {taxLabel} will be computed at checkout and displayed transparently on official invoices and downloadable payment receipts.
            </div>
          </div>
        </div>

        {/* Algorithm Weights */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl md:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" /> Matching Engine Compatibility Weights
            </h3>
            <span
              className={`text-xs font-mono font-bold ${
                totalWeights === 100 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              Sum: {totalWeights}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Age Alignment', val: ageW, set: setAgeW },
              { label: 'City / Region', val: locW, set: setLocW },
              { label: 'Education Level', val: eduW, set: setEduW },
              { label: 'Profession Synergy', val: profW, set: setProfW },
              { label: 'Lifestyle & Diet', val: lifeW, set: setLifeW },
              { label: 'Family Background', val: famW, set: setFamW },
              { label: 'Religion & Caste', val: marW, set: setMarW },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300">{item.label}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    className="w-14 rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-xs text-center text-white"
                  />
                  <span className="text-zinc-500 font-mono">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
