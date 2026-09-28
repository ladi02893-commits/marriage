'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Percent,
  Scale,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SystemSettings } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'CREDITS_TAX' | 'VERIFICATION' | 'WEIGHTS'>('GENERAL');

  // Form State
  const [siteName, setSiteName] = useState(settings.siteName || 'TRUEPAIR Matrimonial');
  const [tagline, setTagline] = useState(settings.tagline || 'Private, verified matrimonial matchmaking');
  const [profilePrefix, setProfilePrefix] = useState(settings.profileIdPrefix || 'TP-');
  const [minAge, setMinAge] = useState<number>(settings.minAge || 18);
  const [whatsappSupport, setWhatsappSupport] = useState(settings.whatsappSupportNumber || '+923001234567');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@truepair.com');
  const [allowRegistrations, setAllowRegistrations] = useState(settings.allowNewRegistrations ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode ?? false);

  // Free Tier & Monetization
  const [freeTierLimit, setFreeTierLimit] = useState<number>(settings.freeTierConnectionsLimit ?? 3);
  const [taxEnabled, setTaxEnabled] = useState(settings.tax?.taxEnabled ?? false);
  const [taxPercent, setTaxPercent] = useState<number>(settings.tax?.taxPercentage ?? 0);
  const [taxLabel, setTaxLabel] = useState(settings.tax?.taxLabel || 'Platform Service Fee & Tax');

  // Moderation & Verification
  const [requireProfileApproval, setRequireProfileApproval] = useState(settings.requireAdminProfileApproval ?? true);
  const [requireEmailVerif, setRequireEmailVerif] = useState(settings.requireEmailVerification ?? false);
  const [requireWhatsappVerif, setRequireWhatsappVerif] = useState(settings.requireWhatsAppVerification ?? false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(settings.whatsappNotificationsEnabled ?? false);
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotificationsEnabled ?? false);

  // Algorithm Weights
  const [ageW, setAgeW] = useState<number>(settings.matchingWeights?.ageWeight ?? 15);
  const [locW, setLocW] = useState<number>(settings.matchingWeights?.locationWeight ?? 15);
  const [eduW, setEduW] = useState<number>(settings.matchingWeights?.educationWeight ?? 15);
  const [profW, setProfW] = useState<number>(settings.matchingWeights?.professionWeight ?? 15);
  const [lifeW, setLifeW] = useState<number>(settings.matchingWeights?.lifestyleWeight ?? 15);
  const [famW, setFamW] = useState<number>(settings.matchingWeights?.familyWeight ?? 15);
  const [marW, setMarW] = useState<number>(settings.matchingWeights?.maritalWeight ?? 10);

  // Keep state in sync if settings update from backend
  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || 'TRUEPAIR Matrimonial');
      setTagline(settings.tagline || 'Private, verified matrimonial matchmaking');
      setProfilePrefix(settings.profileIdPrefix || 'TP-');
      setMinAge(settings.minAge || 18);
      setWhatsappSupport(settings.whatsappSupportNumber || '+923001234567');
      setSupportEmail(settings.supportEmail || 'support@truepair.com');
      setAllowRegistrations(settings.allowNewRegistrations ?? true);
      setMaintenanceMode(settings.maintenanceMode ?? false);

      setFreeTierLimit(settings.freeTierConnectionsLimit ?? 3);
      setTaxEnabled(settings.tax?.taxEnabled ?? false);
      setTaxPercent(settings.tax?.taxPercentage ?? 0);
      setTaxLabel(settings.tax?.taxLabel || 'Platform Service Fee & Tax');

      setRequireProfileApproval(settings.requireAdminProfileApproval ?? true);
      setRequireEmailVerif(settings.requireEmailVerification ?? false);
      setRequireWhatsappVerif(settings.requireWhatsAppVerification ?? false);
      setWhatsappNotifications(settings.whatsappNotificationsEnabled ?? false);
      setEmailNotifications(settings.emailNotificationsEnabled ?? false);

      if (settings.matchingWeights) {
        setAgeW(settings.matchingWeights.ageWeight ?? 15);
        setLocW(settings.matchingWeights.locationWeight ?? 15);
        setEduW(settings.matchingWeights.educationWeight ?? 15);
        setProfW(settings.matchingWeights.professionWeight ?? 15);
        setLifeW(settings.matchingWeights.lifestyleWeight ?? 15);
        setFamW(settings.matchingWeights.familyWeight ?? 15);
        setMarW(settings.matchingWeights.maritalWeight ?? 10);
      }
    }
  }, [settings]);

  const totalWeights = ageW + locW + eduW + profW + lifeW + famW + marW;

  const handleResetDefaults = () => {
    setAgeW(15);
    setLocW(15);
    setEduW(15);
    setProfW(15);
    setLifeW(15);
    setFamW(15);
    setMarW(10);
    toast.info('Reset algorithm weights to recommended distribution (100% total).');
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<SystemSettings> = {
        siteName: siteName.trim(),
        tagline: tagline.trim(),
        profileIdPrefix: profilePrefix.trim().toUpperCase() || 'TP-',
        minAge: Number(minAge),
        whatsappSupportNumber: whatsappSupport.trim(),
        supportEmail: supportEmail.trim(),
        allowNewRegistrations: allowRegistrations,
        maintenanceMode: maintenanceMode,

        freeTierConnectionsLimit: Number(freeTierLimit),
        freeTierMonthlyInterestLimit: Number(freeTierLimit),
        tax: {
          taxEnabled,
          taxPercentage: Number(taxPercent),
          taxFixed: 0,
          taxLabel: taxLabel.trim(),
        },

        requireAdminProfileApproval: requireProfileApproval,
        requireEmailVerification: requireEmailVerif,
        requireWhatsAppVerification: requireWhatsappVerif,
        whatsappNotificationsEnabled: whatsappNotifications,
        emailNotificationsEnabled: emailNotifications,

        matchingWeights: {
          ageWeight: Number(ageW),
          locationWeight: Number(locW),
          educationWeight: Number(eduW),
          professionWeight: Number(profW),
          lifestyleWeight: Number(lifeW),
          familyWeight: Number(famW),
          maritalWeight: Number(marW),
        },
      };

      await updateSettings(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-white">System Settings & Platform Policy</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure platform credentials, free tier credit quotas, taxation parameters, and AI matching weights.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAll()}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {[
          { id: 'GENERAL', label: 'Platform & Identity', icon: Globe },
          { id: 'CREDITS_TAX', label: 'Free Credits & Billing', icon: Zap },
          { id: 'VERIFICATION', label: 'Moderation & Verification', icon: Shield },
          { id: 'WEIGHTS', label: 'Compatibility Weights', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform & Identity */}
      {activeTab === 'GENERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Globe className="h-4 w-4 text-amber-500" /> Platform Brand & Appearance
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Site Title</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Candidate Profile Code Prefix</label>
                <input
                  type="text"
                  value={profilePrefix}
                  onChange={(e) => setProfilePrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. TP-"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Example generated ID: <strong className="text-amber-400 font-mono">{profilePrefix || 'TP-'}000184</strong>
                </span>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Minimum Registration Age</label>
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-32 rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Underage candidates will be rejected during signup.
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Smartphone className="h-4 w-4 text-emerald-400" /> Support Channels & System Switches
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">WhatsApp Support Line</label>
                <input
                  type="text"
                  value={whatsappSupport}
                  onChange={(e) => setWhatsappSupport(e.target.value)}
                  placeholder="+923001234567"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@truepair.com"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition">
                  <div>
                    <span className="text-white font-semibold block text-xs">Allow Public Registrations</span>
                    <span className="text-[11px] text-zinc-500">Enable new candidates to sign up via /register</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowRegistrations}
                    onChange={(e) => setAllowRegistrations(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition">
                  <div>
                    <span className="text-white font-semibold block text-xs">Maintenance Mode</span>
                    <span className="text-[11px] text-zinc-500">Show maintenance notice to non-admin visitors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Free Credits & Billing */}
      {activeTab === 'CREDITS_TAX' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier Quota Allocation */}
          <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" /> Free Tier Connection Allocation
              </h3>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Standard: 3 Credits
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">
                  Initial Free Credits on Registration:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={freeTierLimit}
                    onChange={(e) => setFreeTierLimit(Number(e.target.value))}
                    className="w-28 rounded-xl border border-emerald-500/50 bg-zinc-950 p-2.5 text-base font-bold font-mono text-emerald-400 text-center focus:outline-none"
                  />
                  <span className="text-zinc-400 font-medium">Credits per new free member</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 leading-relaxed text-zinc-300 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Policy Enforcement Note:
                </div>
                <p>
                  As requested, each free user receives strictly <strong>3 free credits</strong> (not 30). This allows them to express initial mutual interest while preventing automated spam scraping.
                </p>
                <p className="text-zinc-400">
                  When a candidate accepts an interest request or contact details are unlocked, 1 credit is deducted. Additional connections require upgrading to a paid tier.
                </p>
              </div>
            </div>
          </div>

          {/* Tax & Service Fee System */}
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
                <span className={taxEnabled ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                  {taxEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Tax / Fee Label</label>
                <input
                  type="text"
                  value={taxLabel}
                  onChange={(e) => setTaxLabel(e.target.value)}
                  placeholder="e.g. Govt Tax & Service Fee"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Tax Percentage (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-24 rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-white font-mono text-center focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-zinc-500 font-bold">%</span>
                </div>
              </div>

              {/* Live Fee Computation Preview */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-[11px]">
                <span className="text-zinc-400 font-medium block">Checkout Simulation Preview:</span>
                <div className="flex justify-between text-zinc-300">
                  <span>Basic Package (PKR 2,000):</span>
                  <span className="font-mono text-white font-bold">
                    +PKR {taxEnabled ? Math.round((2000 * taxPercent) / 100) : 0} {taxLabel}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Premium Package (PKR 5,000):</span>
                  <span className="font-mono text-white font-bold">
                    +PKR {taxEnabled ? Math.round((5000 * taxPercent) / 100) : 0} {taxLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Moderation & Verification */}
      {activeTab === 'VERIFICATION' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl max-w-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Shield className="h-4 w-4 text-amber-500" /> Candidate Verification & Privacy Policies
          </h3>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition">
              <div className="space-y-0.5">
                <span className="text-white font-semibold block flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-400" /> Require Admin Profile Approval
                </span>
                <span className="text-[11px] text-zinc-500">
                  Newly created candidate profiles stay hidden from public search until reviewed and approved by staff.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireProfileApproval}
                onChange={(e) => setRequireProfileApproval(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition">
              <div className="space-y-0.5">
                <span className="text-white font-semibold block flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-sky-400" /> Require Email Verification
                </span>
                <span className="text-[11px] text-zinc-500">
                  Send verification email link before activating member capabilities.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireEmailVerif}
                onChange={(e) => setRequireEmailVerif(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition">
              <div className="space-y-0.5">
                <span className="text-white font-semibold block flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-emerald-400" /> Require WhatsApp OTP Verification
                </span>
                <span className="text-[11px] text-zinc-500">
                  Verify Pakistani & international phone numbers with 6-digit OTP.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireWhatsappVerif}
                onChange={(e) => setRequireWhatsappVerif(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-amber-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-zinc-300 font-medium">WhatsApp Notifications</span>
                <input
                  type="checkbox"
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-zinc-300 font-medium">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 text-amber-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Matching Engine Weights */}
      {activeTab === 'WEIGHTS' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-500" /> Matrimonial Compatibility Algorithm Weights
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Adjust proportional weight scores used by the compatibility engine when ranking recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                  totalWeights === 100
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-700 text-amber-300'
                }`}
              >
                Sum: {totalWeights}% {totalWeights === 100 ? '✓ Balanced' : '(Target: 100%)'}
              </span>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-700"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Age Alignment', desc: 'Age difference preferences', val: ageW, set: setAgeW },
              { label: 'Location & City', desc: 'City and country proximity', val: locW, set: setLocW },
              { label: 'Education Level', desc: 'Degree and academic hierarchy', val: eduW, set: setEduW },
              { label: 'Profession & Career', desc: 'Occupational alignment', val: profW, set: setProfW },
              { label: 'Lifestyle & Habits', desc: 'Diet and personal preferences', val: lifeW, set: setLifeW },
              { label: 'Family Status', desc: 'Family values and setup', val: famW, set: setFamW },
              { label: 'Religion & Caste', desc: 'Sect and community matching', val: marW, set: setMarW },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-white block">{item.label}</span>
                  <span className="text-[10px] text-zinc-500">{item.desc}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    className="w-24 accent-amber-500"
                  />
                  <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="w-12 rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-center text-xs text-white"
                    />
                    <span className="text-zinc-500 text-xs">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Save Trigger */}
      <div className="sticky bottom-6 z-20 flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSaveAll()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-sm font-bold text-black shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving System Changes...' : 'Save All Settings to Database'}
        </button>
      </div>
    </div>
  );
}
