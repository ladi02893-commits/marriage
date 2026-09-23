'use client';

import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PrivacySettingsPage() {
  const { currentProfile, updateCurrentUserProfile } = useAuth();

  const [photoVisibility, setPhotoVisibility] = useState(
    currentProfile?.privacy?.photoVisibility || 'ONLY_ACCEPTED_INTERESTS'
  );
  const [contactVisibility, setContactVisibility] = useState(
    currentProfile?.privacy?.contactVisibility || 'ONLY_ACCEPTED_INTERESTS'
  );
  const [showAge, setShowAge] = useState(currentProfile?.privacy?.showAge ?? true);
  const [showIncome, setShowIncome] = useState(currentProfile?.privacy?.showIncome ?? true);
  const [hideProfile, setHideProfile] = useState(
    currentProfile?.privacy?.hideProfileTemporarily ?? false
  );

  useEffect(() => {
    if (!currentProfile) return;
    setPhotoVisibility(currentProfile.privacy?.photoVisibility || 'ONLY_ACCEPTED_INTERESTS');
    setContactVisibility(currentProfile.privacy?.contactVisibility || 'ONLY_ACCEPTED_INTERESTS');
    setShowAge(currentProfile.privacy?.showAge ?? true);
    setShowIncome(currentProfile.privacy?.showIncome ?? false);
    setHideProfile(currentProfile.privacy?.hideProfileTemporarily ?? false);
  }, [currentProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      privacy: {
        photoVisibility: photoVisibility as any,
        contactVisibility: contactVisibility as any,
        showAge,
        showIncome,
        showLastSeen: true,
        searchEngineIndex: false,
        hideProfileTemporarily: hideProfile,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Privacy & Visibility Vault</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure granular visibility settings for your photos, contact details, and search listings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700"
        >
          <Save className="h-4 w-4" /> Save Privacy Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Privacy Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Lock className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-foreground">Photo Gallery Visibility</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Control who can view your uploaded portfolio photos.
          </p>

          <div className="space-y-2">
            {[
              { id: 'ALL', label: 'Visible to all members', desc: 'Other signed-in members can view approved photos.' },
              { id: 'ONLY_ACCEPTED_INTERESTS', label: 'Accepted matches only', desc: 'Only accepted matches can view approved photos.' },
              { id: 'NONE', label: 'Hidden from other members', desc: 'Only you and administrators can view your photos.' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  photoVisibility === opt.id
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="photoVis"
                  checked={photoVisibility === opt.id}
                  onChange={() => setPhotoVisibility(opt.id as any)}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Contact Privacy Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-foreground">Contact & Phone Privacy</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Define when your family's contact coordinates may be accessed.
          </p>

          <div className="space-y-2">
            {[
              { id: 'ONLY_ACCEPTED_INTERESTS', label: 'Only Mutual Accepted Matches', desc: 'Direct contact is disclosed strictly after mutual acceptance.' },
              { id: 'NONE', label: 'Keep fully confidential', desc: 'Contact details remain hidden from other members.' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  contactVisibility === opt.id
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="contactVis"
                  checked={contactVisibility === opt.id}
                  onChange={() => setContactVisibility(opt.id as any)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Account Pause / Hide Box */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground">Temporary Profile Pause</h3>
        <p className="text-xs text-muted-foreground">
          If you are currently in active discussions or traveling, you can temporarily hide your profile from search results.
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hideProfile}
            onChange={(e) => setHideProfile(e.target.checked)}
            className="rounded border-border text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          <span className="text-xs font-semibold text-foreground">
            Temporarily hide my profile from public & member search directories
          </span>
        </label>
      </div>
    </div>
  );
}
