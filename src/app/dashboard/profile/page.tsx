'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  User,
  GraduationCap,
  Sparkles,
  Users,
  Camera,
  Heart,
  Save,
  Trash2,
  Building2,
  Send,
  CheckCircle2,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from '@/lib/auth-context';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { toast } from 'sonner';

function ProfileEditorContent() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  const {
    currentUser,
    currentProfile,
    bureaus,
    updateCurrentUserProfile,
    refreshDatabase,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'basic' | 'photos' | 'career' | 'lifestyle' | 'family' | 'prefs'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  const nameParts = (currentProfile?.fullName || currentUser?.name || '').trim().split(/\s+/);
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ');

  const [form, setForm] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    displayName: currentProfile?.displayName || currentUser?.username || '',
    phone: currentProfile?.phone || currentUser?.phone || '',
    whatsappNumber: currentProfile?.whatsappNumber || currentUser?.whatsappNumber || '',
    gender: currentProfile?.gender || 'FEMALE',
    dateOfBirth: currentProfile?.dateOfBirth ? currentProfile.dateOfBirth.slice(0, 10) : '',
    maritalStatus: currentProfile?.maritalStatus || 'NEVER_MARRIED',
    religion: currentProfile?.religion || 'ISLAM',
    sectOrCommunity: currentProfile?.sectOrCommunity || '',
    caste: currentProfile?.caste || '',
    motherTongue: currentProfile?.motherTongue || 'Urdu',
    city: currentProfile?.city && currentProfile.city !== 'Not specified' ? currentProfile.city : 'Lahore',
    country: currentProfile?.country || 'Pakistan',
    province: currentProfile?.state || currentProfile?.province || '',
    bureauId:
      currentProfile?.bureauId === 'custom-bureau'
        ? 'CUSTOM'
        : currentProfile?.bureauId || currentUser?.bureauId || '',
    customBureauName:
      currentProfile?.bureauId === 'custom-bureau'
        ? currentProfile?.bureauName || ''
        : '',
    bioHeadline: currentProfile?.bioHeadline || '',
    aboutMe: currentProfile?.aboutMe || '',

    // Career
    highestDegree:
      currentProfile?.educationCareer?.highestDegree && currentProfile.educationCareer.highestDegree !== 'Not specified'
        ? currentProfile.educationCareer.highestDegree
        : '',
    fieldOfStudy: currentProfile?.educationCareer?.fieldOfStudy || '',
    institution: currentProfile?.educationCareer?.institution || '',
    profession:
      currentProfile?.educationCareer?.profession && currentProfile.educationCareer.profession !== 'Not specified'
        ? currentProfile.educationCareer.profession
        : '',
    jobTitle: currentProfile?.educationCareer?.jobTitle || '',
    company: currentProfile?.educationCareer?.company || '',
    annualIncome: currentProfile?.educationCareer?.annualIncome || '',

    // Lifestyle
    height:
      currentProfile?.lifestyle?.height && currentProfile.lifestyle.height !== 'Not specified'
        ? currentProfile.lifestyle.height
        : '',
    weight: currentProfile?.lifestyle?.weight || '',
    bodyType: currentProfile?.lifestyle?.bodyType || '',
    diet: currentProfile?.lifestyle?.diet || 'HALAL_ONLY',
    smoking: currentProfile?.lifestyle?.smoking || 'NO',
    drinking: currentProfile?.lifestyle?.drinking || 'NO',
    languagesSpoken: (currentProfile?.lifestyle?.languagesSpoken ?? ['Urdu']).join(', '),

    // Family
    familyType: currentProfile?.familyInfo?.familyType || 'NUCLEAR',
    familyValues: currentProfile?.familyInfo?.familyValues || 'MODERATE',
    fatherOccupation: currentProfile?.familyInfo?.fatherOccupation || '',
    motherOccupation: currentProfile?.familyInfo?.motherOccupation || '',
    brothersCount: currentProfile?.familyInfo?.brothersCount ?? 0,
    sistersCount: currentProfile?.familyInfo?.sistersCount ?? 0,
    familyLocation: currentProfile?.familyInfo?.familyLocation || '',
    aboutFamily: currentProfile?.familyInfo?.aboutFamily || '',

    // Partner Prefs
    prefAgeMin: currentProfile?.partnerPreferences?.ageRange?.min || 22,
    prefAgeMax: currentProfile?.partnerPreferences?.ageRange?.max || 35,
    prefHeightMin: currentProfile?.partnerPreferences?.heightRange?.min || '',
    prefHeightMax: currentProfile?.partnerPreferences?.heightRange?.max || '',
    prefLocations: (currentProfile?.partnerPreferences?.preferredLocations ?? []).join(', '),
    prefNotes: currentProfile?.partnerPreferences?.expectationsNotes || '',
  });

  useEffect(() => {
    if (!currentProfile) return;
    const parts = (currentProfile.fullName || currentUser?.name || '').trim().split(/\s+/);
    setForm((prev) => ({
      ...prev,
      firstName: parts[0] || prev.firstName,
      lastName: parts.slice(1).join(' ') || prev.lastName,
      displayName: currentProfile.displayName || currentUser?.username || '',
      phone: currentProfile.phone || currentUser?.phone || '',
      whatsappNumber: currentProfile.whatsappNumber || currentUser?.whatsappNumber || '',
      gender: currentProfile.gender || 'FEMALE',
      dateOfBirth: currentProfile.dateOfBirth ? currentProfile.dateOfBirth.slice(0, 10) : '',
      maritalStatus: currentProfile.maritalStatus || 'NEVER_MARRIED',
      religion: currentProfile.religion || 'ISLAM',
      sectOrCommunity: currentProfile.sectOrCommunity || '',
      caste: currentProfile.caste || '',
      motherTongue: currentProfile.motherTongue || 'Urdu',
      city: currentProfile.city && currentProfile.city !== 'Not specified' ? currentProfile.city : prev.city,
      country: currentProfile.country || 'Pakistan',
      province: currentProfile.state || currentProfile.province || '',
      bureauId:
        currentProfile.bureauId === 'custom-bureau'
          ? 'CUSTOM'
          : currentProfile.bureauId || currentUser?.bureauId || prev.bureauId,
      customBureauName:
        currentProfile.bureauId === 'custom-bureau'
          ? currentProfile.bureauName || ''
          : prev.customBureauName,
      bioHeadline: currentProfile.bioHeadline || '',
      aboutMe: currentProfile.aboutMe || '',
      highestDegree:
        currentProfile.educationCareer?.highestDegree && currentProfile.educationCareer.highestDegree !== 'Not specified'
          ? currentProfile.educationCareer.highestDegree
          : '',
      fieldOfStudy: currentProfile.educationCareer?.fieldOfStudy || '',
      institution: currentProfile.educationCareer?.institution || '',
      profession:
        currentProfile.educationCareer?.profession && currentProfile.educationCareer.profession !== 'Not specified'
          ? currentProfile.educationCareer.profession
          : '',
      jobTitle: currentProfile.educationCareer?.jobTitle || '',
      company: currentProfile.educationCareer?.company || '',
      annualIncome: currentProfile.educationCareer?.annualIncome || '',
      height:
        currentProfile.lifestyle?.height && currentProfile.lifestyle.height !== 'Not specified'
          ? currentProfile.lifestyle.height
          : '',
      weight: currentProfile.lifestyle?.weight || '',
      bodyType: currentProfile.lifestyle?.bodyType || '',
      diet: currentProfile.lifestyle?.diet || 'HALAL_ONLY',
      smoking: currentProfile.lifestyle?.smoking || 'NO',
      drinking: currentProfile.lifestyle?.drinking || 'NO',
      languagesSpoken: (currentProfile.lifestyle?.languagesSpoken ?? ['Urdu']).join(', '),
      familyType: currentProfile.familyInfo?.familyType || 'NUCLEAR',
      familyValues: currentProfile.familyInfo?.familyValues || 'MODERATE',
      fatherOccupation: currentProfile.familyInfo?.fatherOccupation || '',
      motherOccupation: currentProfile.familyInfo?.motherOccupation || '',
      brothersCount: currentProfile.familyInfo?.brothersCount ?? 0,
      sistersCount: currentProfile.familyInfo?.sistersCount ?? 0,
      familyLocation: currentProfile.familyInfo?.familyLocation || '',
      aboutFamily: currentProfile.familyInfo?.aboutFamily || '',
      prefAgeMin: currentProfile.partnerPreferences?.ageRange?.min || 22,
      prefAgeMax: currentProfile.partnerPreferences?.ageRange?.max || 35,
      prefHeightMin: currentProfile.partnerPreferences?.heightRange?.min || '',
      prefHeightMax: currentProfile.partnerPreferences?.heightRange?.max || '',
      prefLocations: (currentProfile.partnerPreferences?.preferredLocations ?? []).join(', '),
      prefNotes: currentProfile.partnerPreferences?.expectationsNotes || '',
    }));
  }, [currentProfile, currentUser]);

  const approvedBureaus = useMemo(
    () => bureaus.filter((b) => b.approvalStatus === 'APPROVED'),
    [bureaus],
  );

  const cityMatchingBureaus = useMemo(() => {
    const selectedCity = form.city.trim().toLowerCase();
    if (!selectedCity) return [];
    return approvedBureaus.filter((b) => {
      const mainCity = (b.city || '').trim().toLowerCase();
      const extra = (b.serviceCities ?? []).map((c) => c.trim().toLowerCase());
      return (
        mainCity === selectedCity ||
        mainCity.includes(selectedCity) ||
        selectedCity.includes(mainCity) ||
        extra.some((c) => c === selectedCity || c.includes(selectedCity))
      );
    });
  }, [approvedBureaus, form.city]);

  const selectedBureau = approvedBureaus.find((b) => b.id === form.bureauId) ?? null;

  const updateField = (field: string, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const buildPayload = (submitForApproval: boolean) => ({
    fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim() || currentUser?.name || '',
    displayName: form.displayName.trim() || form.firstName.trim(),
    username: form.displayName.trim() || currentUser?.username,
    phone: form.phone.trim(),
    whatsappNumber: form.whatsappNumber.trim() || form.phone.trim(),
    gender: form.gender as any,
    dateOfBirth: form.dateOfBirth,
    maritalStatus: form.maritalStatus as any,
    religion: form.religion as any,
    sectOrCommunity: form.sectOrCommunity,
    caste: form.caste,
    motherTongue: form.motherTongue,
    city: form.city,
    country: form.country,
    state: form.province,
    bureauId: form.bureauId || undefined,
    customBureauName: form.bureauId === 'CUSTOM' ? form.customBureauName.trim() : undefined,
    bioHeadline: form.bioHeadline,
    aboutMe: form.aboutMe,
    submitForApproval,
    educationCareer: {
      ...currentProfile?.educationCareer,
      highestDegree: form.highestDegree || 'Not specified',
      fieldOfStudy: form.fieldOfStudy,
      institution: form.institution,
      profession: form.profession || 'Not specified',
      jobTitle: form.jobTitle,
      company: form.company,
      annualIncome: form.annualIncome,
    },
    lifestyle: {
      ...currentProfile?.lifestyle,
      height: form.height || 'Not specified',
      weight: form.weight,
      bodyType: (form.bodyType || undefined) as any,
      diet: form.diet as any,
      smoking: form.smoking as any,
      drinking: form.drinking as any,
      motherTongue: form.motherTongue,
      languagesSpoken: form.languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
    },
    familyInfo: {
      ...currentProfile?.familyInfo,
      familyType: form.familyType as any,
      familyValues: form.familyValues as any,
      fatherOccupation: form.fatherOccupation,
      motherOccupation: form.motherOccupation,
      brothersCount: Number(form.brothersCount) || 0,
      sistersCount: Number(form.sistersCount) || 0,
      familyLocation: form.familyLocation,
      aboutFamily: form.aboutFamily,
    },
    partnerPreferences: {
      ...currentProfile?.partnerPreferences,
      ageRange: { min: Number(form.prefAgeMin) || 18, max: Number(form.prefAgeMax) || 40 },
      heightRange: { min: form.prefHeightMin, max: form.prefHeightMax },
      preferredLocations: form.prefLocations.split(',').map((s) => s.trim()).filter(Boolean),
      expectationsNotes: form.prefNotes,
    },
  });

  const handleSave = async (submitForApproval: boolean) => {
    if (submitForApproval) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.dateOfBirth || !form.country || !form.city || form.city === 'Not specified') {
        setActiveTab('basic');
        toast.error('Please fill all required Basic Info fields (*): First Name, Last Name, Mobile Number, Date of Birth, Country, and City.');
        return;
      }
      if (!form.bureauId) {
        setActiveTab('basic');
        toast.error('Please select your Marriage Bureau (Daftar) or enter your Marriage Bureau name before sending to Admin.');
        return;
      }
      if (form.bureauId === 'CUSTOM' && form.customBureauName.trim().length < 2) {
        setActiveTab('basic');
        toast.error('Please enter your Marriage Bureau name.');
        return;
      }
      if (!form.highestDegree.trim() || !form.profession.trim()) {
        setActiveTab('career');
        toast.error('Please complete your Highest Degree and Profession under Education & Career.');
        return;
      }
      if (!form.height.trim()) {
        setActiveTab('lifestyle');
        toast.error('Please select or enter your Height under Lifestyle & Habits.');
        return;
      }
    }

    setIsSaving(true);
    await updateCurrentUserProfile(buildPayload(submitForApproval));
    setIsSaving(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    const currentPhotos = currentProfile?.photos || [];
    if (currentPhotos.length <= 1) {
      toast.error('You must maintain at least one primary profile photo.');
      return;
    }
    try {
      const response = await fetch(`/api/profile-photos?id=${encodeURIComponent(photoId)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Photo could not be deleted.');
      await refreshDatabase();
      toast.success('Photo removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Photo could not be deleted.');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info & Bureau *', icon: User },
    { id: 'career', label: 'Education & Career *', icon: GraduationCap },
    { id: 'lifestyle', label: 'Lifestyle & Habits *', icon: Sparkles },
    { id: 'family', label: 'Family Dossier', icon: Users },
    { id: 'prefs', label: 'Partner Criteria', icon: Heart },
    { id: 'photos', label: 'Photos Gallery', icon: Camera },
  ];

  const completion = currentProfile?.completionPercentage ?? 20;

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-foreground">Complete Your Matrimonial Profile</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              currentProfile?.approvalStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {currentProfile?.approvalStatus?.replaceAll('_', ' ') || 'PENDING APPROVAL'} • {completion}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in all required (*) and optional details, choose your Marriage Bureau (Daftar) name, and submit your request for Admin approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave(false)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:from-brand-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {isSaving ? 'Submitting...' : 'Save & Send Request to Admin'}
          </button>
        </div>
      </div>

      {/* Onboarding / Bureau Reminder Banner */}
      {(isOnboarding || currentProfile?.approvalStatus !== 'APPROVED' || !form.bureauId) && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30 p-4 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-foreground">
              {isOnboarding
                ? 'Welcome! Complete your profile to request Admin approval.'
                : 'Required steps before your profile goes live:'}
            </div>
            <p className="text-muted-foreground">
              1. Enter your personal details &amp; contact numbers. • 2. Choose or enter your <strong>Marriage Bureau (Daftar) name</strong> below. • 3. Complete Education, Profession &amp; Lifestyle tabs. • 4. Click <strong>Save &amp; Send Request to Admin</strong>.
            </p>
          </div>
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
              type="button"
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
        {/* BASIC, LOCATION & BUREAU TAB */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold font-serif text-foreground mb-1">Personal Information &amp; Marriage Bureau</h3>
              <p className="text-xs text-muted-foreground">Fields marked with * are required before submitting your profile to Admin.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Username / Display Name *</label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  placeholder="Name displayed on cards"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-mono text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => updateField('whatsappNumber', e.target.value)}
                  placeholder="Same as mobile if blank"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-mono text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Gender *</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="FEMALE">Female (Bride Candidate)</option>
                  <option value="MALE">Male (Groom Candidate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Marital Status *</label>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Religion *</label>
                <select
                  value={form.religion}
                  onChange={(e) => updateField('religion', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="ISLAM">Islam</option>
                  <option value="HINDUISM">Hinduism</option>
                  <option value="SIKHISM">Sikhism</option>
                  <option value="CHRISTIANITY">Christianity</option>
                  <option value="BUDDHISM">Buddhism</option>
                  <option value="JAINISM">Jainism</option>
                  <option value="SPIRITUAL">Spiritual</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Sect / Community (Optional)</label>
                <input
                  type="text"
                  value={form.sectOrCommunity}
                  onChange={(e) => updateField('sectOrCommunity', e.target.value)}
                  placeholder="e.g. Sunni"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Caste / Zaat (Optional)</label>
                <input
                  type="text"
                  value={form.caste}
                  onChange={(e) => updateField('caste', e.target.value)}
                  placeholder="e.g. Syed, Arain, Rajput, Malik"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Mother Tongue (Optional)</label>
                <input
                  type="text"
                  value={form.motherTongue}
                  onChange={(e) => updateField('motherTongue', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <CountryCitySelect
                  selectedCountry={form.country}
                  selectedCity={form.city}
                  onCountryChange={(newCountry) => updateField('country', newCountry)}
                  onCityChange={(newCity) => updateField('city', newCity)}
                  countryLabel="Country *"
                  cityLabel="City *"
                  required
                />
              </div>
            </div>

            {/* Marriage Bureau (Daftar) Name Selection */}
            <div className="rounded-2xl border-2 border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/20 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  Select Your Marriage Bureau (Daftar) Name *
                </label>
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                  {cityMatchingBureaus.length > 0
                    ? `${cityMatchingBureaus.length} bureau(s) found in ${form.city}`
                    : `Showing all ${approvedBureaus.length} approved bureaus`}
                </span>
              </div>

              <select
                value={form.bureauId}
                onChange={(e) => updateField('bureauId', e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-3 text-xs font-semibold text-foreground focus:border-brand-500 focus:outline-none"
              >
                <option value="">-- Choose Your Marriage Bureau Name --</option>
                {cityMatchingBureaus.length > 0 && (
                  <optgroup label={`Marriage Bureaus in ${form.city}`}>
                    {cityMatchingBureaus.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.city} ({b.bureauCode})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Approved Marriage Bureaus">
                  {approvedBureaus
                    .filter((b) => !cityMatchingBureaus.some((m) => m.id === b.id))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.city} ({b.bureauCode})
                      </option>
                    ))}
                </optgroup>
                <option value="CUSTOM">Other / Type My Marriage Bureau Name Manually</option>
              </select>

              {form.bureauId === 'CUSTOM' && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Enter Your Marriage Bureau (Daftar) Name *
                  </label>
                  <input
                    type="text"
                    value={form.customBureauName}
                    onChange={(e) => updateField('customBureauName', e.target.value)}
                    placeholder="e.g. Al-Harmain Nikah Center Lahore"
                    className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              {selectedBureau && (
                <div className="rounded-xl border border-border bg-card p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{selectedBureau.name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" /> {selectedBureau.bureauCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-brand-600" />
                      <span>{selectedBureau.address}, {selectedBureau.city}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    Tel: {selectedBureau.phone}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Profile Headline (Optional)</label>
                <input
                  type="text"
                  value={form.bioHeadline}
                  onChange={(e) => updateField('bioHeadline', e.target.value)}
                  placeholder="e.g. Practicing physician seeking a sincere, family-oriented match"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">About Myself Narrative (Optional)</label>
                <textarea
                  rows={4}
                  value={form.aboutMe}
                  onChange={(e) => updateField('aboutMe', e.target.value)}
                  placeholder="Write about your personality, family values, and education..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold font-serif text-foreground mb-1">Profile Photos Gallery (Optional)</h3>
              <p className="text-xs text-muted-foreground">
                Upload up to 5 verified high-resolution photographs. Photos are moderated to maintain platform authenticity.
              </p>
            </div>

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
                    type="button"
                    onClick={() => void handleDeletePhoto(photo.id)}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border border-dashed border-border rounded-2xl bg-muted/20 space-y-2">
              <label className="text-xs font-semibold text-foreground block">Upload New Photo</label>
              <FileUpload
                label="Select Photo"
                bucket="avatars"
                folder="gallery"
                onUploadSuccess={async (url, key) => {
                  try {
                    const response = await fetch('/api/profile-photos', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url, key }),
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) throw new Error(result.error || 'Photo could not be saved.');
                    await refreshDatabase();
                    toast.success('Photo submitted for review.');
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Photo could not be saved.');
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Educational &amp; Career Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Highest Degree *</label>
                <input
                  type="text"
                  required
                  value={form.highestDegree}
                  onChange={(e) => updateField('highestDegree', e.target.value)}
                  placeholder="e.g. MBBS, BS Computer Science, MBA"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Field of Study (Optional)</label>
                <input
                  type="text"
                  value={form.fieldOfStudy}
                  onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                  placeholder="e.g. Medicine, Engineering, Finance"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Institution / College (Optional)</label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  placeholder="e.g. LUMS, NUST, King Edward"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Profession Sector *</label>
                <input
                  type="text"
                  required
                  value={form.profession}
                  onChange={(e) => updateField('profession', e.target.value)}
                  placeholder="e.g. Software Engineer, Medical Doctor, Business"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Current Job Title (Optional)</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Company / Organization (Optional)</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Monthly / Annual Income Bracket (Optional)</label>
                <input
                  type="text"
                  value={form.annualIncome}
                  onChange={(e) => updateField('annualIncome', e.target.value)}
                  placeholder="e.g. PKR 250,000 / month"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* LIFESTYLE TAB */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Lifestyle &amp; Habits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Height *</label>
                <select
                  value={form.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="">Select Height</option>
                  <option value="5 ft 0 in (152 cm)">5 ft 0 in (152 cm)</option>
                  <option value="5 ft 2 in (157 cm)">5 ft 2 in (157 cm)</option>
                  <option value="5 ft 4 in (162 cm)">5 ft 4 in (162 cm)</option>
                  <option value="5 ft 6 in (168 cm)">5 ft 6 in (168 cm)</option>
                  <option value="5 ft 8 in (173 cm)">5 ft 8 in (173 cm)</option>
                  <option value="5 ft 10 in (178 cm)">5 ft 10 in (178 cm)</option>
                  <option value="6 ft 0 in (183 cm)">6 ft 0 in (183 cm)</option>
                  <option value="6 ft 2 in (188 cm)">6 ft 2 in (188 cm)</option>
                  <option value="6 ft 4 in (193 cm)">6 ft 4 in (193 cm)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Weight (Optional)</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="e.g. 64 kg"
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
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Languages Spoken (Comma separated)</label>
                <input
                  type="text"
                  value={form.languagesSpoken}
                  onChange={(e) => updateField('languagesSpoken', e.target.value)}
                  placeholder="e.g. Urdu, English, Punjabi"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
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
                  <option value="REGULARLY">Regularly</option>
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
                  <option value="OCCASIONALLY">Occasionally</option>
                  <option value="SOCIALLY">Socially</option>
                  <option value="REGULARLY">Regularly</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* FAMILY TAB */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Family Background &amp; Values (Optional)</h3>
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
                  <option value="EXTENDED">Extended Family</option>
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
                <label className="text-xs font-semibold text-foreground block mb-1">Father&apos;s Occupation</label>
                <input
                  type="text"
                  value={form.fatherOccupation}
                  onChange={(e) => updateField('fatherOccupation', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Mother&apos;s Occupation</label>
                <input
                  type="text"
                  value={form.motherOccupation}
                  onChange={(e) => updateField('motherOccupation', e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Number of Brothers</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={form.brothersCount}
                  onChange={(e) => updateField('brothersCount', Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Number of Sisters</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={form.sistersCount}
                  onChange={(e) => updateField('sistersCount', Number(e.target.value))}
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

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">About Family</label>
                <textarea
                  rows={3}
                  value={form.aboutFamily}
                  onChange={(e) => updateField('aboutFamily', e.target.value)}
                  placeholder="Share brief background about your family..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* PARTNER PREFS TAB */}
        {activeTab === 'prefs' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-serif text-foreground mb-4">Partner Expectations (Optional)</h3>
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
                    max={80}
                    value={form.prefAgeMax}
                    onChange={(e) => updateField('prefAgeMax', Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Preferred Cities / Countries (Comma separated)</label>
                <input
                  type="text"
                  value={form.prefLocations}
                  onChange={(e) => updateField('prefLocations', e.target.value)}
                  placeholder="e.g. Lahore, Islamabad, UK"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Compatibility &amp; Partner Notes</label>
                <textarea
                  rows={4}
                  value={form.prefNotes}
                  onChange={(e) => updateField('prefNotes', e.target.value)}
                  placeholder="Describe expectations regarding character, education, family values..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Submit Footer */}
        <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Completed sections save straight to your dossier and notify the Admin team on request.
          </div>
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Save Draft
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> {isSaving ? 'Submitting...' : 'Save & Send Request to Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading your matrimonial dossier...</div>}>
      <ProfileEditorContent />
    </Suspense>
  );
}
