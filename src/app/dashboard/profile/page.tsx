'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Sparkles,
  Users,
  Camera,
  Heart,
  Save,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from '@/lib/auth-context';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { toast } from 'sonner';

export default function ProfileEditorPage() {
  const { currentProfile, currentUser, updateCurrentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'photos' | 'basic' | 'career' | 'lifestyle' | 'family' | 'prefs'>('basic');

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR';

  const [form, setForm] = useState({
    fullName: currentProfile?.fullName || '',
    gender: currentProfile?.gender || 'FEMALE',
    dateOfBirth: currentProfile?.dateOfBirth || '1998-01-01',
    maritalStatus: currentProfile?.maritalStatus || 'NEVER_MARRIED',
    religion: currentProfile?.religion || 'ISLAM',
    sectOrCommunity: currentProfile?.sectOrCommunity || '',
    motherTongue: currentProfile?.motherTongue || 'Urdu',
    city: currentProfile?.city || 'London',
    country: currentProfile?.country || 'United Kingdom',
    bioHeadline: currentProfile?.bioHeadline || '',
    aboutMe: currentProfile?.aboutMe || '',

    // Career
    highestDegree: currentProfile?.educationCareer?.highestDegree || '',
    institution: currentProfile?.educationCareer?.institution || '',
    profession: currentProfile?.educationCareer?.profession || '',
    jobTitle: currentProfile?.educationCareer?.jobTitle || '',
    annualIncome: currentProfile?.educationCareer?.annualIncome || '',

    // Lifestyle
    height: currentProfile?.lifestyle?.height || "5' 6\"",
    diet: currentProfile?.lifestyle?.diet || 'HALAL_ONLY',
    smoking: currentProfile?.lifestyle?.smoking || 'NO',
    drinking: currentProfile?.lifestyle?.drinking || 'NO',

    // Family
    familyType: currentProfile?.familyInfo?.familyType || 'NUCLEAR',
    familyValues: currentProfile?.familyInfo?.familyValues || 'MODERATE',
    fatherOccupation: currentProfile?.familyInfo?.fatherOccupation || '',
    motherOccupation: currentProfile?.familyInfo?.motherOccupation || '',
    familyLocation: currentProfile?.familyInfo?.familyLocation || '',
    aboutFamily: currentProfile?.familyInfo?.aboutFamily || '',

    // Partner Prefs
    prefAgeMin: currentProfile?.partnerPreferences?.ageRange?.min || 25,
    prefAgeMax: currentProfile?.partnerPreferences?.ageRange?.max || 35,
    prefNotes: currentProfile?.partnerPreferences?.expectationsNotes || '',
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const updateField = (field: string, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName: form.fullName,
      gender: form.gender as any,
      dateOfBirth: form.dateOfBirth,
      maritalStatus: form.maritalStatus as any,
      religion: form.religion as any,
      sectOrCommunity: form.sectOrCommunity,
      motherTongue: form.motherTongue,
      city: form.city,
      country: form.country,
      bioHeadline: form.bioHeadline,
      aboutMe: form.aboutMe,
      educationCareer: {
        ...currentProfile?.educationCareer!,
        highestDegree: form.highestDegree,
        institution: form.institution,
        profession: form.profession,
        jobTitle: form.jobTitle,
        annualIncome: form.annualIncome,
      },
      lifestyle: {
        ...currentProfile?.lifestyle!,
        height: form.height,
        diet: form.diet as any,
        smoking: form.smoking as any,
        drinking: form.drinking as any,
      },
      familyInfo: {
        ...currentProfile?.familyInfo!,
        familyType: form.familyType as any,
        familyValues: form.familyValues as any,
        fatherOccupation: form.fatherOccupation,
        motherOccupation: form.motherOccupation,
        familyLocation: form.familyLocation,
        aboutFamily: form.aboutFamily,
      },
      partnerPreferences: {
        ...currentProfile?.partnerPreferences!,
        ageRange: { min: form.prefAgeMin, max: form.prefAgeMax },
        expectationsNotes: form.prefNotes,
      },
    });

    toast.success('Matrimonial profile dossier updated successfully!');
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const currentPhotos = currentProfile?.photos || [];
    const newPhoto = {
      id: `p-${Date.now()}`,
      url: newPhotoUrl.trim(),
      isPrimary: currentPhotos.length === 0,
      isApproved: true,
      order: currentPhotos.length + 1,
    };
    updateCurrentUserProfile({
      photos: [...currentPhotos, newPhoto],
    });
    setNewPhotoUrl('');
    toast.success('Photo added to your gallery!');
  };

  const handleDeletePhoto = (photoId: string) => {
    const currentPhotos = currentProfile?.photos || [];
    if (currentPhotos.length <= 1) {
      toast.error('You must maintain at least one primary profile photo.');
      return;
    }
    updateCurrentUserProfile({
      photos: currentPhotos.filter((p) => p.id !== photoId),
    });
    toast.info('Photo removed from gallery.');
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info & Bio', icon: User },
    { id: 'photos', label: 'Photos Gallery', icon: Camera },
    { id: 'career', label: 'Education & Career', icon: GraduationCap },
    { id: 'lifestyle', label: 'Lifestyle & Habits', icon: Sparkles },
    { id: 'family', label: 'Family Dossier', icon: Users },
    { id: 'prefs', label: 'Partner Criteria', icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-foreground">My Matrimonial Dossier</h1>
            {isAdmin && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                👑 Super Admin
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep your profile accurate to ensure optimal matchmaking compatibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
            >
              <ShieldAlert className="h-4 w-4" /> Open Admin Panel
            </Link>
          )}

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:from-brand-700"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-bold shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Super Administrator Controls Available
              </h4>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                You are logged in as <strong>{currentUser?.email}</strong>. You have full access to User Management, Verification Approvals, and SaaS Analytics.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-zinc-900 shadow-sm shrink-0 border border-amber-500/40"
          >
            Go to Admin Control Room →
          </Link>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shrink-0 transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Tabs Content */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {/* BASIC & BIO TAB */}
        {activeTab === 'basic' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Marital Status</label>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Religion</label>
                <select
                  value={form.religion}
                  onChange={(e) => updateField('religion', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="ISLAM">Islam</option>
                  <option value="HINDUISM">Hinduism</option>
                  <option value="SIKHISM">Sikhism</option>
                  <option value="CHRISTIANITY">Christianity</option>
                  <option value="SPIRITUAL">Spiritual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Sect / Community</label>
                <input
                  type="text"
                  value={form.sectOrCommunity}
                  onChange={(e) => updateField('sectOrCommunity', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <CountryCitySelect
                  selectedCountry={form.country}
                  selectedCity={form.city}
                  onCountryChange={(newCountry) => updateField('country', newCountry)}
                  onCityChange={(newCity) => updateField('city', newCity)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Profile Headline</label>
                <input
                  type="text"
                  value={form.bioHeadline}
                  onChange={(e) => updateField('bioHeadline', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">About Myself Narrative</label>
                <textarea
                  rows={4}
                  value={form.aboutMe}
                  onChange={(e) => updateField('aboutMe', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold font-serif text-foreground mb-1">Profile Photos Gallery</h3>
              <p className="text-xs text-muted-foreground">
                Upload up to 5 verified high-resolution photographs. Photos are moderated to maintain platform authenticity.
              </p>
            </div>

            {/* Photo List Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {currentProfile?.photos?.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
                  <img src={photo.url} alt="Gallery" className="h-full w-full object-cover" />
                  {photo.isPrimary && (
                    <span className="absolute top-2 left-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo Box */}
            <div className="p-4 border border-dashed border-border rounded-2xl bg-muted/20 space-y-2">
              <label className="text-xs font-semibold text-foreground block">Upload New Photo</label>
              <FileUpload
                label="Select Photo"
                bucket="avatars"
                folder="gallery"
                onUploadSuccess={(url) => {
                  setNewPhotoUrl(url);
                  // We also auto-trigger the add since FileUpload completed it
                  const currentPhotos = currentProfile?.photos || [];
                  const newPhoto = {
                    id: `p-${Date.now()}`,
                    url: url,
                    isPrimary: currentPhotos.length === 0,
                    isApproved: true,
                    order: currentPhotos.length + 1,
                  };
                  updateCurrentUserProfile({
                    photos: [...currentPhotos, newPhoto],
                  });
                  setNewPhotoUrl('');
                  toast.success('Photo added to your gallery!');
                }}
              />
            </div>
          </div>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Educational & Career Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Highest Degree</label>
                <input
                  type="text"
                  value={form.highestDegree}
                  onChange={(e) => updateField('highestDegree', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Institution / College</label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Profession Sector</label>
                <input
                  type="text"
                  value={form.profession}
                  onChange={(e) => updateField('profession', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Current Job Title</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Annual Income Bracket</label>
                <input
                  type="text"
                  value={form.annualIncome}
                  onChange={(e) => updateField('annualIncome', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* LIFESTYLE TAB */}
        {activeTab === 'lifestyle' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Lifestyle & Habits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Height</label>
                <input
                  type="text"
                  value={form.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Dietary Values</label>
                <select
                  value={form.diet}
                  onChange={(e) => updateField('diet', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="HALAL_ONLY">Halal Only</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Smoking</label>
                <select
                  value={form.smoking}
                  onChange={(e) => updateField('smoking', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="NO">No</option>
                  <option value="OCCASIONALLY">Occasionally</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Drinking</label>
                <select
                  value={form.drinking}
                  onChange={(e) => updateField('drinking', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="NO">No</option>
                  <option value="SOCIALLY">Socially</option>
                </select>
              </div>
            </div>
          </form>
        )}

        {/* FAMILY TAB */}
        {activeTab === 'family' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Family Background & Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Family Type</label>
                <select
                  value={form.familyType}
                  onChange={(e) => updateField('familyType', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="NUCLEAR">Nuclear Family</option>
                  <option value="JOINT">Joint Family</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Family Values</label>
                <select
                  value={form.familyValues}
                  onChange={(e) => updateField('familyValues', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="MODERATE">Moderate</option>
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="LIBERAL">Liberal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Father's Occupation</label>
                <input
                  type="text"
                  value={form.fatherOccupation}
                  onChange={(e) => updateField('fatherOccupation', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Mother's Occupation</label>
                <input
                  type="text"
                  value={form.motherOccupation}
                  onChange={(e) => updateField('motherOccupation', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Family Location</label>
                <input
                  type="text"
                  value={form.familyLocation}
                  onChange={(e) => updateField('familyLocation', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* PARTNER PREFS TAB */}
        {activeTab === 'prefs' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Partner Expectations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Preferred Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    value={form.prefAgeMin}
                    onChange={(e) => updateField('prefAgeMin', Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="number"
                    max={60}
                    value={form.prefAgeMax}
                    onChange={(e) => updateField('prefAgeMax', Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Compatibility Notes</label>
                <textarea
                  rows={4}
                  value={form.prefNotes}
                  onChange={(e) => updateField('prefNotes', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
