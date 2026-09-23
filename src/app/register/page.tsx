'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  User,
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileCheck,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RegisterWizardPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Account
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    height: '',
    weight: '',
    maritalStatus: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sectOrCommunity: '',
    caste: '',
    subClan: '',
    motherTongue: 'Urdu',
    citizenship: 'Pakistani',
    country: '',
    province: '',
    city: '',
    area: '',

    // Step 3: Education & Career
    highestDegree: '',
    institution: '',
    fieldOfStudy: '',
    profession: '',
    jobTitle: '',
    company: '',
    monthlyIncome: '',
    annualIncome: '',
    employmentSector: 'PRIVATE',

    // Step 4: Family & Lifestyle
    fatherOccupation: '',
    motherOccupation: '',
    brothersCount: 0,
    sistersCount: 0,
    familyType: 'NUCLEAR',
    familyValues: 'MODERATE',
    livingStatus: '',
    familyLocation: '',
    diet: 'HALAL_ONLY',
    smoking: 'NO',
    drinking: 'NO',
    languagesSpoken: '',
    hobbies: '',
    aboutFamily: '',

    // Step 5: Partner Preferences
    prefAgeMin: 26,
    prefAgeMax: 34,
    prefHeightMin: '',
    prefHeightMax: '',
    prefMaritalStatus: 'NEVER_MARRIED',
    prefReligions: 'ISLAM',
    prefSects: '',
    prefCaste: '',
    prefLocations: '',
    prefEducation: '',
    prefProfession: '',
    prefIncome: '',
    prefNotes: '',

    // Profile summary
    bioHeadline: '',
    aboutMe: '',
    photoUrl: '',

    // Step 7: Consents
    agreeTerms: true,
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

  const steps = [
    { num: 1, name: 'Account Info', icon: User },
    { num: 3, name: 'Education & Career', icon: GraduationCap },
    { num: 4, name: 'Family & Lifestyle', icon: Users },
    { num: 5, name: 'Partner Criteria', icon: Search },
    { num: 7, name: 'Consent & Review', icon: FileCheck },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.dateOfBirth || !formData.country || !formData.city) {
        toast.error('Please complete your name, email, mobile, birth date, location, and password.');
        return;
      }
      if (calculatedAge < 18 || calculatedAge > 100) {
        toast.error('Registration is available only to adults aged 18 to 100.');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Password must contain at least 8 characters.');
        return;
      }
      if (!formData.whatsappNumber) {
        updateField('whatsappNumber', formData.phone);
      }
      toast.info('WhatsApp verification will remain pending until the delivery provider is connected.');
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(7);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmit();
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    if (!formData.agreeTerms || !formData.agreeTruthfulness) {
      toast.error('Please accept all consent checkboxes before submitting.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating your account and profile securely...');

    try {
      // Create the free account first. Payment evidence is submitted from the
      // authenticated dashboard so it can be bound to the real server user ID.
      const regResult = await register(
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.whatsappNumber || formData.phone,
          whatsappNumber: formData.whatsappNumber || formData.phone,
        },
        {
          fullName: formData.fullName,
          displayName: formData.fullName.split(' ')[0] + (formData.fullName.split(' ')[1] ? ' ' + formData.fullName.split(' ')[1][0] + '.' : ''),
          gender: formData.gender as any,
          dateOfBirth: formData.dateOfBirth,
          age: calculatedAge,
          phone: formData.whatsappNumber || formData.phone,
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
          approvalStatus: 'PENDING_APPROVAL',
          isApproved: false,
          isWhatsappVerified: false,
          isEmailVerified: false,
          verificationBadge: 'UNVERIFIED',
          photos: [],
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

      if (!regResult.success) {
        toast.error('Registration failed: ' + (regResult.error || 'Unknown error'));
        return;
      }

      toast.success('Account created. Identity and contact verification remain pending. Submit payment from your dashboard if you want to upgrade.');
      router.push(regResult.redirectUrl || '/dashboard');
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 border border-brand-200/50 shadow-xs">
            <Crown className="h-3.5 w-3.5 text-gold-500" /> VIP Royal Matchmaking • Member Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Confidential Royal Matchmaking Registration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            A dignified, connection-based matchmaking platform with profile review and optional identity verification.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
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
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 ring-2 ring-brand-400/40'
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
            {/* STEP 1: Personal & Account Information (Section 5 - Step 1) */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 1: Basic Information</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter your basic identity and account credentials. Contact verification remains pending until the delivery provider is connected.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="e.g. Dr. Bilal Tariq"
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
                      placeholder="e.g. bilal@example.com"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Mobile Number *</label>
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
                    <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsappNumber || formData.phone}
                      onChange={(e) => updateField('whatsappNumber', e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Password *</label>
                    <input
                      type="password"
                      required
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
                      <option value="FEMALE">Female (Bride Candidate)</option>
                      <option value="MALE">Male (Groom Candidate)</option>
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
                      <option value="6 ft 4 in (193 cm)">6 ft 4 in (193 cm)</option>
                    </select>
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
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Caste / Zaat *</label>
                    <select
                      value={formData.caste}
                      onChange={(e) => updateField('caste', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Syed">Syed / Gilani / Bukhari</option>
                      <option value="Rajput">Rajput / Rana / Bhatti</option>
                      <option value="Mughal">Mughal / Mirza / Baig</option>
                      <option value="Arain">Arain / Chaudhry</option>
                      <option value="Jatt">Jatt / Cheema / Warraich</option>
                      <option value="Malik">Malik / Awan</option>
                      <option value="Sheikh">Sheikh / Siddiqui</option>
                      <option value="Gujjar">Gujjar</option>
                      <option value="Abbasi">Abbasi</option>
                      <option value="Memon">Memon</option>
                      <option value="Niazi">Niazi / Khan / Pathan</option>
                      <option value="Kashmiri">Kashmiri / Butt / Dar</option>
                      <option value="Other">Other / Caste No Bar</option>
                    </select>
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
              </div>
            )}


            {/* STEP 3: Education & Career (Section 8) */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 3: Education & Profession</h3>
                  <p className="text-xs text-muted-foreground">
                    Academic qualifications and career standing. Income brackets can be kept confidential upon request.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Education Level *</label>
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
                    <label className="text-xs font-semibold text-foreground block mb-1">Degree Name & University *</label>
                    <input
                      type="text"
                      required
                      value={formData.institution}
                      onChange={(e) => updateField('institution', e.target.value)}
                      placeholder="e.g. MS Computer Science (LUMS / IBA)"
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
                      placeholder="e.g. Senior Software Architect / Consultant Physician"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="e.g. Tech Solutions / Private Hospital"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Monthly Income Bracket (PKR)</label>
                    <select
                      value={formData.monthlyIncome}
                      onChange={(e) => updateField('monthlyIncome', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="PKR 150,000 - 300,000 / month">PKR 150,000 - 300,000 / month</option>
                      <option value="PKR 300,000 - 600,000 / month">PKR 300,000 - 600,000 / month</option>
                      <option value="PKR 600,000 - 1,200,000 / month">PKR 600,000 - 1,200,000 / month</option>
                      <option value="PKR 1,200,000+ / month">PKR 1,200,000+ / month</option>
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
                      <option value="PRIVATE">Private Corporate</option>
                      <option value="GOVERNMENT">Government / Civil Services</option>
                      <option value="BUSINESS">Family Business / Entrepreneur</option>
                      <option value="SELF_EMPLOYED">Independent Practitioner</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Family & Lifestyle (Section 8) */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 4: Family Background & Values</h3>
                  <p className="text-xs text-muted-foreground">
                    Culturally grounded family background, parental occupations, and living arrangements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Father's Occupation *</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherOccupation}
                      onChange={(e) => updateField('fatherOccupation', e.target.value)}
                      placeholder="e.g. Retired Civil Servant / Businessman"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Mother's Details</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => updateField('motherOccupation', e.target.value)}
                      placeholder="e.g. Homemaker / Educator"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Brothers & Sisters Count</label>
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
                        <option value="Living in Own House">Own Residence</option>
                        <option value="Living with Parents">With Parents</option>
                        <option value="Rented House">Rented</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">About Family Background</label>
                    <textarea
                      rows={2}
                      value={formData.aboutFamily}
                      onChange={(e) => updateField('aboutFamily', e.target.value)}
                      placeholder="Noble origins, values, ancestral roots..."
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Looking For / Partner Criteria (Section 8) */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 5: Looking For (Partner Preferences)</h3>
                  <p className="text-xs text-muted-foreground">
                    Define preferences used by Senior Family Consultants and compatibility algorithms to suggest matching candidates.
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
                    <label className="text-xs font-semibold text-foreground block mb-1">Preferred Cities / Countries</label>
                    <input
                      type="text"
                      value={formData.prefLocations}
                      onChange={(e) => updateField('prefLocations', e.target.value)}
                      placeholder="e.g. Lahore, Islamabad, Karachi, UK, UAE"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">Specific Expectations & Notes</label>
                    <textarea
                      rows={2}
                      value={formData.prefNotes}
                      onChange={(e) => updateField('prefNotes', e.target.value)}
                      placeholder="Religious commitment, family expectations, values..."
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* STEP 7: Consent & Final Confirmation (Section 12, 31) */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold font-serif text-foreground">Step 7: Final Review & Submission</h3>
                  <p className="text-xs text-muted-foreground">
                    Confirm your registration. Your profile will be queued for Admin Approval before appearing publicly.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl bg-muted/30 p-5 border border-border space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Applicant:</span>
                    <strong className="text-foreground">{formData.fullName} ({calculatedAge} Yrs, {formData.caste})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">WhatsApp Verified:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                      <MessageCircle className="h-3.5 w-3.5" /> Pending provider setup ({formData.whatsappNumber || formData.phone})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Plan:</span>
                    <strong className="text-brand-600">Free registration — upgrade securely after sign-in</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Initial Profile Status:</span>
                    <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                      Pending Admin Approval
                    </span>
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
                      I agree to the <strong>Terms of Service</strong>, <strong>Matrimonial Privacy Policy</strong>, and <strong>Community Guidelines</strong>. I understand contact details are unlocked only through mutual connection requests or authorized credit deductions.
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
                      I solemnly certify that all education, marital status, and family details provided are accurate and authentic under penalty of permanent ban.
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
                  onClick={() => setCurrentStep((prev) => prev === 7 ? 5 : prev === 3 ? 1 : prev - 1)}
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
                  'Submitting Registration...'
                ) : currentStep === 7 ? (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Submit Profile for Approval
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
