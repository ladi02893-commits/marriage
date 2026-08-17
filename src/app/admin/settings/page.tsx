'use client';

import React, { useState } from 'react';
import { Sliders, Save, ShieldCheck, Sparkles, Scale } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminSystemSettingsPage() {
  const { settings, updateSettings } = useAuth();

  const [siteName, setSiteName] = useState(settings.siteName);
  const [minAge, setMinAge] = useState(settings.minAge);
  const [requireId, setRequireId] = useState(settings.requireEmailVerification);
  const [freeLimit, setFreeLimit] = useState(settings.freeTierMonthlyInterestLimit);

  // Matching Weights
  const [ageW, setAgeW] = useState(settings.matchingWeights.ageWeight);
  const [locW, setLocW] = useState(settings.matchingWeights.locationWeight);
  const [eduW, setEduW] = useState(settings.matchingWeights.educationWeight);
  const [profW, setProfW] = useState(settings.matchingWeights.professionWeight);
  const [lifeW, setLifeW] = useState(settings.matchingWeights.lifestyleWeight);
  const [famW, setFamW] = useState(settings.matchingWeights.familyWeight);
  const [marW, setMarW] = useState(settings.matchingWeights.maritalWeight);

  const totalWeights = ageW + locW + eduW + profW + lifeW + famW + marW;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      minAge,
      requireEmailVerification: requireId,
      freeTierMonthlyInterestLimit: freeLimit,
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
    toast.success('System settings & algorithm parameters updated!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Platform Engine Configuration</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure matching algorithm weights, minimum registration age, and interest limits.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black shadow-md hover:bg-amber-400"
        >
          <Save className="h-4 w-4" /> Save System Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Rules */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
            General Platform Rules
          </h3>

          <div className="space-y-3 text-xs">
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
              <label className="text-zinc-400 font-semibold block mb-1">Minimum Member Age (Years)</label>
              <input
                type="number"
                min={18}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Free Tier Monthly Interest Limit</label>
              <input
                type="number"
                min={1}
                value={freeLimit}
                onChange={(e) => setFreeLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Algorithm Weights */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" /> Matching Engine Weights
            </h3>
            <span
              className={`text-xs font-mono font-bold ${
                totalWeights === 100 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              Sum: {totalWeights}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Age Alignment Weight', val: ageW, set: setAgeW },
              { label: 'Location & Region Weight', val: locW, set: setLocW },
              { label: 'Education Level Weight', val: eduW, set: setEduW },
              { label: 'Profession Synergy Weight', val: profW, set: setProfW },
              { label: 'Lifestyle & Diet Weight', val: lifeW, set: setLifeW },
              { label: 'Family Values Weight', val: famW, set: setFamW },
              { label: 'Religion & Sect Weight', val: marW, set: setMarW },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-zinc-300">{item.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-center text-white"
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
