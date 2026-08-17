'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  User,
  GraduationCap,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Camera,
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  Lock,
  Phone,
  FileCheck,
  Building,
  Upload,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RegisterWizardPage() {
  const router = useRouter();
  const { register, submitPaymentProof, receivingAccounts } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Location
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'FEMALE',
    dateOfBirth: '1998-05-15',
    height: "5 ft 6 in (168 cm)",
    weight: '58 kg',
    maritalStatus: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sectOrCommunity: 'Sunni',
    caste: 'Syed',
    subClan: '',
    motherTongue: 'Urdu',
    citizenship: 'Pakistani',
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Lahore',
    area: 'DHA Phase 5',

    // Step 2: Education & Career
    highestDegree: "Master's Degree",
    institution: 'LUMS / Quaid-i-Azam University',
    fieldOfStudy: 'Computer Science & Software',
    profession: 'Software Engineer / Architect',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Solutions Inc.',
    monthlyIncome: 'PKR 250,000 - 400,000 / month',
    annualIncome: 'PKR 3.5 Million - 5 Million',
    employmentSector: 'PRIVATE',

    // Step 3: Family & Lifestyle
    fatherOccupation: 'Retired Civil Servant / Businessman',
    motherOccupation: 'Educator & Homemaker',
    brothersCount: 1,
    sistersCount: 2,
    familyType: 'NUCLEAR',
    familyValues: 'MODERATE',
    livingStatus: 'Living in Own House (Family Residence)',
    familyLocation: 'Lahore, Pakistan',
    diet: 'HALAL_ONLY',
    smoking: 'NO',
    drinking: 'NO',
    languagesSpoken: 'Urdu, English, Punjabi',
    hobbies: 'Reading, Islamic Studies, Traveling, Gourmet Cooking',
    aboutFamily: 'Cultured, educated, and well-settled family with high ethical and moral values.',

    // Step 4: Partner Preferences
    prefAgeMin: 26,
    prefAgeMax: 34,
    prefHeightMin: "5 ft 8 in",
    prefHeightMax: "6 ft 2 in",
    prefMaritalStatus: 'NEVER_MARRIED',
    prefReligions: 'ISLAM',
    prefSects: 'Sunni, Shia, Open',
    prefCaste: 'Syed, Rajput, Mughal, No Bar',
    prefLocations: 'Pakistan, United Kingdom, UAE, USA, Canada',
    prefEducation: "Bachelor's Degree or Higher",
    prefProfession: 'Doctor, Engineer, Civil Service, Corporate, Business',
    prefIncome: 'PKR 200,000+ / month or Equivalent',
    prefNotes: 'Looking for a well-educated, respectful, and practicing partner with a stable career and kind disposition.',

    // Step 5: Photos & Payment Proof (Workflow v1.0)
    bioHeadline: 'Educated, ambitious professional seeking lifelong companionship grounded in mutual respect',
    aboutMe:
      'Alhamdulillah, I am a family-oriented professional with a balanced outlook towards religious values and modern ambitions. I value open communication, integrity, kindness, and personal growth.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    
    // Package & Payment
    selectedPlan: 'PREMIUM',
    planName: 'Elite Executive Plan',
    planAmount: 15000,
    currency: 'PKR',
    paymentMethod: 'JAZZCASH',
    transactionId: '',
    senderAccountNumber: '',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',

    // Step 6: Consents
    agreeTerms: true,
    agreeAiMatching: true,
    agreeTruthfulness: true,
  });

  // Calculate Age Dynamically
  const calculatedAge = useMemo(() => {
    if (!formData.dateOfBirth) return 26;
    const dob = new Date(formData.dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970) || 26;
  }, [formData.dateOfBirth]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    { num: 1, name: 'Personal & Location', icon: User },
    { num: 2, name: 'Education & Career', icon: GraduationCap },
    { num: 3, name: 'Family Background', icon: Users },
    { num: 4, name: 'Partner Criteria', icon: Search },
    { num: 5, name: 'Photos & Payment', icon: CreditCard },
    { num: 6, name: 'Consent & Review', icon: FileCheck },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please enter your full name, email, and WhatsApp/Phone number.');
        return;
      }
    }
    if (currentStep === 5) {
      if (!formData.transactionId) {
        toast.error('Please enter the Payment Transaction ID / Trx code from your receipt.');
        return;
      }
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmit();
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    if (!formData.agreeTerms || !formData.agreeAiMatching || !formData.agreeTruthfulness) {
      toast.error('Please accept all consent checkboxes before submitting.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting profile & registering payment proof with admin queue...');

    try {
      // 1. Submit Payment Proof to Data Store & Context
      submitPaymentProof({
        userId: `user-${Date.now()}`,
        userName: formData.fullName,
        userEmail: formData.email,
        userPhone: formData.phone,
        planSlug: formData.selectedPlan,
        planName: formData.selectedPlan === 'VIP' ? 'VIP Bespoke Matchmaking' : formData.selectedPlan === 'BASIC' ? 'Basic Member' : 'Elite Executive Plan',
        amount: formData.selectedPlan === 'VIP' ? 35000 : formData.selectedPlan === 'BASIC' ? 5000 : 15000,
        currency: 'PKR',
        paymentMethod: formData.paymentMethod as any,
        transactionId: formData.transactionId || `TRX-${Date.now()}`,
        senderAccountNumber: formData.senderAccountNumber,
        screenshotUrl: formData.paymentScreenshotUrl,
      });

      // 2. Register User & Matrimonial Profile in Auth Context
      register(
        {
          name: formData.fullName,
          email: formData.email,
        },
        {
          fullName: formData.fullName,
          displayName: formData.fullName.split(' ')[0] + (formData.fullName.split(' ')[1] ? ' ' + formData.fullName.split(' ')[1][0] + '.' : ''),
          gender: formData.gender as any,
          dateOfBirth: formData.dateOfBirth,
          age: calculatedAge,
          phone: formData.phone,
          maritalStatus: formData.maritalStatus as any,
          religion: formData.religion as any,
          sectOrCommunity: formData.sectOrCommunity,
          caste: formData.caste,
          subClan: formData.subClan,
          motherTongue: formData.motherTongue,
          city: formData.city,
          country: formData.country,
          province: formData.province,
          area: formData.area,
          citizenship: formData.citizenship,
          bioHeadline: formData.bioHeadline,
          aboutMe: formData.aboutMe,
          profileQualityScore: 98,
          fraudScore: 0,
          aiSummary: `AI Verified Profile: ${formData.highestDegree} graduate working as ${formData.profession}. Family background verified in ${formData.city}. Excellent compatibility indicators.`,
          photos: [
            {
              id: `p-${Date.now()}`,
              url: formData.photoUrl,
              isPrimary: true,
              isApproved: true,
              order: 1,
            },
          ],
          educationCareer: {
            highestDegree: formData.highestDegree,
            institution: formData.institution,
            fieldOfStudy: formData.fieldOfStudy,
            profession: formData.profession,
            jobTitle: formData.jobTitle,
            company: formData.company,
            annualIncome: formData.annualIncome,
            monthlyIncome: formData.monthlyIncome,
            employmentSector: formData.employmentSector as any,
            workingLocation: formData.city,
          },
          lifestyle: {
            height: formData.height,
            weight: formData.weight,
            diet: formData.diet as any,
            smoking: formData.smoking as any,
            drinking: formData.drinking as any,
            motherTongue: formData.motherTongue,
            languagesSpoken: formData.languagesSpoken.split(',').map((s) => s.trim()),
            hobbies: formData.hobbies.split(',').map((s) => s.trim()),
            livingStatus: formData.livingStatus,
          },
          familyInfo: {
            familyType: formData.familyType as any,
            familyValues: formData.familyValues as any,
            fatherOccupation: formData.fatherOccupation,
            motherOccupation: formData.motherOccupation,
            brothersCount: Number(formData.brothersCount),
            sistersCount: Number(formData.sistersCount),
            familyLocation: formData.familyLocation,
            livingStatus: formData.livingStatus,
            aboutFamily: formData.aboutFamily,
          },
          partnerPreferences: {
            ageRange: { min: Number(formData.prefAgeMin), max: Number(formData.prefAgeMax) },
            heightRange: { min: formData.prefHeightMin, max: formData.prefHeightMax },
            maritalStatus: [formData.prefMaritalStatus as any],
            religions: [formData.prefReligions as any],
            sects: [formData.prefSects],
            caste: [formData.prefCaste],
            educationLevels: [formData.prefEducation],
            professions: [formData.prefProfession],
            preferredLocations: formData.prefLocations.split(',').map((s) => s.trim()),
            monthlyIncome: formData.prefIncome,
            expectationsNotes: formData.prefNotes,
          },
        }
      );

      setIsSubmitting(false);
      toast.dismiss(toastId);
      toast.success('Registration & Payment Submission Complete! Welcome to Compatible Matrimonials.');
      router.push('/dashboard');
    } catch (err: any) {
      setIsSubmitting(false);
      toast.dismiss(toastId);
      toast.error('Registration failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 border border-brand-200/50">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" /> Compatible Matrimonials • Workflow v1.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Confidential Matrimonial Registration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Join the high-trust matchmaking network. 100% verified profiles with privacy-first mutual contact sharing.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-6 gap-2 sm:gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col items-center p-2 rounded-2xl transition text-center ${
                    isCurrent
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-muted/40 text-muted-foreground opacity-60'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 mb-1">
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-[10px] font-bold hidden sm:block truncate w-full">
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Container */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleNext} className="space-y-8">
            {/* STEP 1: Personal & Location Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 1: Personal Information & Location</h3>
                  <p className="text-xs text-muted-foreground">
                    Basic identity details. Contact numbers remain locked until mutual consent.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="e.g. Dr. Zainab Qureshi"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="e.g. zainab@example.com"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp / Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Account Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="FEMALE">Female (Bride / Rishta)</option>
                      <option value="MALE">Male (Groom / Rishta)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Date of Birth * <span className="text-brand-600 font-bold">(Age: {calculatedAge} Yrs)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Height *</label>
                    <select
                      value={formData.height}
                      onChange={(e) => updateField('height', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="5 ft 0 in (152 cm)">5 ft 0 in (152 cm)</option>
                      <option value="5 ft 2 in (157 cm)">5 ft 2 in (157 cm)</option>
                      <option value="5 ft 4 in (162 cm)">5 ft 4 in (162 cm)</option>
                      <option value="5 ft 6 in (168 cm)">5 ft 6 in (168 cm)</option>
                      <option value="5 ft 8 in (173 cm)">5 ft 8 in (173 cm)</option>
                      <option value="5 ft 10 in (178 cm)">5 ft 10 in (178 cm)</option>
                      <option value="6 ft 0 in (183 cm)">6 ft 0 in (183 cm)</option>
                      <option value="6 ft 2 in (188 cm)">6 ft 2 in (188 cm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Weight (Optional)</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                      placeholder="e.g. 65 kg"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Marital Status *</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => updateField('maritalStatus', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="NEVER_MARRIED">Never Married (Single)</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
                      <option value="ANNULLED">Annulled</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Religion & Sect *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.religion}
                        onChange={(e) => updateField('religion', e.target.value)}
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        <option value="ISLAM">Islam</option>
                        <option value="CHRISTIANITY">Christianity</option>
                        <option value="HINDUISM">Hinduism</option>
                        <option value="SIKHISM">Sikhism</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <select
                        value={formData.sectOrCommunity}
                        onChange={(e) => updateField('sectOrCommunity', e.target.value)}
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        <option value="Sunni">Sunni</option>
                        <option value="Shia">Shia</option>
                        <option value="Ahle-Hadith">Ahle-Hadith</option>
                        <option value="Deobandi">Deobandi</option>
                        <option value="Barelvi">Barelvi</option>
                        <option value="Ismaili">Ismaili</option>
                        <option value="Other">Other / Non-sectarian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Caste / Zaat *</label>
                    <select
                      value={formData.caste}
                      onChange={(e) => updateField('caste', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Syed">Syed / Gilani / Kazmi</option>
                      <option value="Rajput">Rajput / Rana</option>
                      <option value="Mughal">Mughal / Mirza</option>
                      <option value="Arain">Arain / Chaudhry</option>
                      <option value="Jatt">Jatt / Cheema / Warraich</option>
                      <option value="Malik">Malik / Awan</option>
                      <option value="Sheikh">Sheikh / Siddiqui</option>
                      <option value="Gujjar">Gujjar</option>
                      <option value="Abbasi">Abbasi</option>
                      <option value="Memon">Memon</option>
                      <option value="Niazi">Niazi / Pathan / Khan</option>
                      <option value="Butt">Butt / Kashmiri</option>
                      <option value="Other">Other / Caste No Bar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Mother Tongue & Citizenship</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.motherTongue}
                        onChange={(e) => updateField('motherTongue', e.target.value)}
                        placeholder="Mother Tongue (e.g. Urdu)"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={formData.citizenship}
                        onChange={(e) => updateField('citizenship', e.target.value)}
                        placeholder="Citizenship"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Country & City Dropdowns */}
                <div className="pt-2">
                  <CountryCitySelect
                    selectedCountry={formData.country}
                    selectedCity={formData.city}
                    onCountryChange={(c) => updateField('country', c)}
                    onCityChange={(ct) => updateField('city', ct)}
                    countryLabel="Country of Residence *"
                    cityLabel="City of Residence *"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">State / Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => updateField('province', e.target.value)}
                      placeholder="e.g. Punjab / Sindh / Ontario"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Residential Area / Sector</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => updateField('area', e.target.value)}
                      placeholder="e.g. DHA Phase 5 / Gulberg"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Education & Career */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 2: Education & Profession</h3>
                  <p className="text-xs text-muted-foreground">
                    Academic qualifications and professional achievements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Highest Qualification *</label>
                    <select
                      value={formData.highestDegree}
                      onChange={(e) => updateField('highestDegree', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Doctorate / PhD">Doctorate / PhD</option>
                      <option value="Medical Doctor (MBBS / MD / FCPS)">Medical Doctor (MBBS / MD / FCPS)</option>
                      <option value="Master's Degree">Master's Degree (MS / MPhil / MBA / MSc)</option>
                      <option value="Bachelor's Degree">Bachelor's Degree (BS / BE / BBA / BSc)</option>
                      <option value="Chartered Accountant (CA / ACCA / CFA)">Chartered Accountant (CA / ACCA / CFA)</option>
                      <option value="Law Graduate (LLB / LLM)">Law Graduate (LLB / LLM)</option>
                      <option value="Other">Other Higher Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">University / Institution *</label>
                    <input
                      type="text"
                      required
                      value={formData.institution}
                      onChange={(e) => updateField('institution', e.target.value)}
                      placeholder="e.g. LUMS / King Edward / UCL"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Profession / Occupation *</label>
                    <input
                      type="text"
                      required
                      value={formData.profession}
                      onChange={(e) => updateField('profession', e.target.value)}
                      placeholder="e.g. Software Engineer / Consultant Physician"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Current Job Title & Company</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => updateField('jobTitle', e.target.value)}
                        placeholder="Job Title"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        placeholder="Company / Org"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Monthly Income Bracket</label>
                    <select
                      value={formData.monthlyIncome}
                      onChange={(e) => updateField('monthlyIncome', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="PKR 100,000 - 250,000 / month">PKR 100,000 - 250,000 / month</option>
                      <option value="PKR 250,000 - 500,000 / month">PKR 250,000 - 500,000 / month</option>
                      <option value="PKR 500,000 - 1,000,000 / month">PKR 500,000 - 1,000,000 / month</option>
                      <option value="PKR 1,000,000+ / month">PKR 1,000,000+ / month</option>
                      <option value="$3,000 - $6,000 / month ($ USD)">$3,000 - $6,000 / month ($ USD)</option>
                      <option value="$6,000 - $12,000+ / month ($ USD)">$6,000 - $12,000+ / month ($ USD)</option>
                      <option value="Not Disclosed">Prefer not to disclose</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Employment Sector</label>
                    <select
                      value={formData.employmentSector}
                      onChange={(e) => updateField('employmentSector', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="PRIVATE">Private Sector / Corporate</option>
                      <option value="GOVERNMENT">Government / Civil Services</option>
                      <option value="BUSINESS">Business / Entrepreneur</option>
                      <option value="SELF_EMPLOYED">Self Employed / Practitioner</option>
                      <option value="NOT_WORKING">Currently Not Working</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Family & Lifestyle */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 3: Family Background & Lifestyle</h3>
                  <p className="text-xs text-muted-foreground">
                    Culturally grounded family background and living values.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Father's Profession *</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherOccupation}
                      onChange={(e) => updateField('fatherOccupation', e.target.value)}
                      placeholder="e.g. Senior Civil Officer / Businessman"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Mother's Profession</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => updateField('motherOccupation', e.target.value)}
                      placeholder="e.g. Homemaker / Educator"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Number of Brothers & Sisters</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={0}
                        value={formData.brothersCount}
                        onChange={(e) => updateField('brothersCount', e.target.value)}
                        placeholder="Brothers"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={formData.sistersCount}
                        onChange={(e) => updateField('sistersCount', e.target.value)}
                        placeholder="Sisters"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Family Type & Living Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.familyType}
                        onChange={(e) => updateField('familyType', e.target.value)}
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        <option value="NUCLEAR">Nuclear Family</option>
                        <option value="JOINT">Joint Family</option>
                        <option value="EXTENDED">Extended Family</option>
                      </select>
                      <select
                        value={formData.livingStatus}
                        onChange={(e) => updateField('livingStatus', e.target.value)}
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        <option value="Living in Own House">Own House</option>
                        <option value="Living with Parents">With Parents</option>
                        <option value="Rented House">Rented</option>
                        <option value="Independent Apartment">Independent</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">About Family</label>
                    <textarea
                      rows={2}
                      value={formData.aboutFamily}
                      onChange={(e) => updateField('aboutFamily', e.target.value)}
                      placeholder="Brief note about family values, origins, and lifestyle..."
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Partner Criteria */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 4: Partner Preferences</h3>
                  <p className="text-xs text-muted-foreground">
                    Define ideal match parameters for AI-powered compatibility scoring.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Preferred Age Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={formData.prefAgeMin}
                        onChange={(e) => updateField('prefAgeMin', e.target.value)}
                        placeholder="Min Age"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={formData.prefAgeMax}
                        onChange={(e) => updateField('prefAgeMax', e.target.value)}
                        placeholder="Max Age"
                        className="rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Preferred Caste / Zaat</label>
                    <input
                      type="text"
                      value={formData.prefCaste}
                      onChange={(e) => updateField('prefCaste', e.target.value)}
                      placeholder="e.g. Syed, Rajput, or Caste No Bar"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Preferred Education</label>
                    <input
                      type="text"
                      value={formData.prefEducation}
                      onChange={(e) => updateField('prefEducation', e.target.value)}
                      placeholder="e.g. Masters, Doctor, Engineer"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Preferred Locations / Countries</label>
                    <input
                      type="text"
                      value={formData.prefLocations}
                      onChange={(e) => updateField('prefLocations', e.target.value)}
                      placeholder="e.g. Pakistan, UK, UAE, USA, Canada"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">Specific Expectations & Notes</label>
                    <textarea
                      rows={2}
                      value={formData.prefNotes}
                      onChange={(e) => updateField('prefNotes', e.target.value)}
                      placeholder="Special expectations or personal values..."
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Photos & Payment Verification (Workflow Version 1.0) */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    <CreditCard className="h-3.5 w-3.5" /> Step 4 & 5: Membership & Payment Verification
                  </div>
                  <h3 className="text-xl font-bold font-serif text-foreground">Membership Package & Payment Slip Upload</h3>
                  <p className="text-xs text-muted-foreground">
                    Select your membership tier and attach your Easypaisa, JazzCash, or Bank Transfer receipt.
                  </p>
                </div>

                {/* Profile Photo & Bio Headline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Profile Photo URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.photoUrl}
                      onChange={(e) => updateField('photoUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Headline Bio *</label>
                    <input
                      type="text"
                      required
                      value={formData.bioHeadline}
                      onChange={(e) => updateField('bioHeadline', e.target.value)}
                      placeholder="One-line summary for match card"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Membership Packages Selection */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-2">
                    Select Membership Package *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        slug: 'BASIC',
                        name: 'Basic Match',
                        price: 'PKR 5,000',
                        amount: 5000,
                        features: '10 Profile Intros • AI Compatibility • Standard Support',
                      },
                      {
                        slug: 'PREMIUM',
                        name: 'Elite Executive',
                        price: 'PKR 15,000',
                        amount: 15000,
                        popular: true,
                        features: 'Unlimited Matches • Contact Unlocking • Verified Shield Badge',
                      },
                      {
                        slug: 'VIP',
                        name: 'VIP Bespoke',
                        price: 'PKR 35,000',
                        amount: 35000,
                        features: 'Dedicated Matchmaker • Priority Intros • 100% Confidentiality',
                      },
                    ].map((plan) => (
                      <div
                        key={plan.slug}
                        onClick={() => {
                          updateField('selectedPlan', plan.slug);
                          updateField('planName', plan.name);
                          updateField('planAmount', plan.amount);
                        }}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all relative ${
                          formData.selectedPlan === plan.slug
                            ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-600/30'
                            : 'border-border bg-muted/20 hover:border-brand-300'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-3 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            Most Popular
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-foreground">{plan.name}</h4>
                        <div className="text-lg font-black text-brand-600 font-serif my-1">
                          {plan.price}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{plan.features}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Bank / Payment Account Details Card */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Building className="h-4 w-4" /> Official Payment Receiving Accounts
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">Send fee & upload receipt</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {receivingAccounts.filter((a) => a.isActive).length === 0 ? (
                      <div className="sm:col-span-3 text-center py-4 text-xs text-muted-foreground">
                        Please contact administration on WhatsApp (+92 300 1234567) for payment details.
                      </div>
                    ) : (
                      receivingAccounts
                        .filter((a) => a.isActive)
                        .map((acc) => {
                          const isJazz = acc.provider === 'JAZZCASH';
                          const isEasy = acc.provider === 'EASYPAISA';
                          const isRaast = acc.provider === 'RAAST';
                          const isSada = acc.provider === 'SADAPAY';
                          const isNaya = acc.provider === 'NAYAPAY';

                          return (
                            <div key={acc.id} className="rounded-xl bg-card p-3 border border-border space-y-1.5 shadow-xs">
                              <div className="flex items-center justify-between text-[11px]">
                                <strong
                                  className={
                                    isJazz
                                      ? 'text-red-600'
                                      : isEasy
                                      ? 'text-emerald-600'
                                      : isRaast
                                      ? 'text-purple-600'
                                      : isSada
                                      ? 'text-teal-600'
                                      : isNaya
                                      ? 'text-orange-600'
                                      : 'text-blue-600'
                                  }
                                >
                                  {acc.bankName}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(acc.accountNumber, `${acc.bankName} Number`)}
                                  className="text-[10px] text-brand-600 flex items-center gap-0.5 hover:underline font-semibold"
                                >
                                  {copiedKey === `${acc.bankName} Number` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                                </button>
                              </div>
                              <div>
                                <p className="font-mono font-bold text-foreground text-xs">{acc.accountNumber}</p>
                                <p className="text-[10px] text-muted-foreground">Title: {acc.accountTitle}</p>
                              </div>
                              {acc.iban && (
                                <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-emerald-600 font-bold truncate pr-1">
                                    {acc.iban}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(acc.iban!, `${acc.bankName} IBAN`)}
                                    className="text-brand-600 hover:underline shrink-0 text-[10px] font-semibold"
                                  >
                                    {copiedKey === `${acc.bankName} IBAN` ? 'Copied' : 'IBAN'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Transaction Submission Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Payment Method Used *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => updateField('paymentMethod', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="JAZZCASH">JazzCash</option>
                      <option value="EASYPAISA">Easypaisa</option>
                      <option value="BANK_TRANSFER">Bank Online Transfer / Meezan</option>
                      <option value="RAAST">Raast Instant Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Transaction ID / Trx Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.transactionId}
                      onChange={(e) => updateField('transactionId', e.target.value)}
                      placeholder="e.g. JC-984210459"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Sender Mobile / Account</label>
                    <input
                      type="text"
                      value={formData.senderAccountNumber}
                      onChange={(e) => updateField('senderAccountNumber', e.target.value)}
                      placeholder="e.g. 0300-1234567"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-2">
                    <label className="text-xs font-semibold text-foreground block">
                      Payment Slip / Receipt Screenshot *
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-center cursor-pointer hover:bg-muted/50 transition">
                        <Upload className="h-4 w-4 text-brand-600" />
                        <span className="text-xs font-medium text-foreground">
                          Upload receipt image / slip
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (loadEvt) => {
                                if (loadEvt.target?.result) {
                                  updateField('paymentScreenshotUrl', loadEvt.target.result as string);
                                  toast.success(`Attached ${file.name}`);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-muted-foreground">or</span>
                      <input
                        type="text"
                        value={formData.paymentScreenshotUrl}
                        onChange={(e) => updateField('paymentScreenshotUrl', e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      * Admins will cross-verify your transaction slip on the admin control panel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Consent & Final Confirmation */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 6: Privacy Consent & Review</h3>
                  <p className="text-xs text-muted-foreground">
                    Confirm your registration and agree to matrimonial privacy standards.
                  </p>
                </div>

                {/* Summary Snapshot */}
                <div className="rounded-2xl bg-muted/30 p-4 border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Applicant Name:</span>
                    <strong className="text-foreground">{formData.fullName} ({calculatedAge} Yrs)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Selected Package:</span>
                    <strong className="text-brand-600">{formData.planName} ({formData.currency} {formData.planAmount.toLocaleString()})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Proof:</span>
                    <strong className="text-foreground">{formData.paymentMethod} (Trx ID: {formData.transactionId})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">{formData.city}, {formData.country}</span>
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateField('agreeTerms', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-muted-foreground">
                      I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. I understand contact details are shared strictly upon mutual consent.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeAiMatching}
                      onChange={(e) => updateField('agreeAiMatching', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-muted-foreground">
                      I consent to <strong>AI-Powered Compatibility Matching</strong> and automated profile verification screening.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTruthfulness}
                      onChange={(e) => updateField('agreeTruthfulness', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-muted-foreground">
                      I certify that all education, marital, and personal background details provided are accurate and authentic under penalty of account suspension.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous Step
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground hover:text-brand-600 transition font-medium"
                >
                  Already registered? Sign In
                </Link>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Processing Registration...'
                ) : currentStep === 6 ? (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Complete Registration & Submit
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
