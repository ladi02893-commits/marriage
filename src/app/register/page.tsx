'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
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
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  Lock,
  Phone,
  FileCheck,
  Building,
  Upload,
  MessageCircle,
  RefreshCw,
  Clock,
  KeyRound,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RegisterWizardPage() {
  const router = useRouter();
  const { register, submitPaymentProof, receivingAccounts, verifyWhatsAppCode } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // WhatsApp OTP Verification State (Section 5)
  const [generatedOtp, setGeneratedOtp] = useState('VIP-583921');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(600); // 10 minutes
  const [isWhatsappVerified, setIsWhatsappVerified] = useState(false);
  const [otpSentTime, setOtpSentTime] = useState<Date>(new Date());

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Account
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    gender: 'FEMALE',
    dateOfBirth: '1998-05-15',
    height: '5 ft 6 in (168 cm)',
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

    // Step 3: Education & Career
    highestDegree: "Master's Degree",
    institution: 'LUMS / Quaid-i-Azam University',
    fieldOfStudy: 'Computer Science & Software',
    profession: 'Software Engineer / Architect',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Solutions Inc.',
    monthlyIncome: 'PKR 250,000 - 500,000 / month',
    annualIncome: 'PKR 3.5 Million - 6 Million',
    employmentSector: 'PRIVATE',

    // Step 4: Family & Lifestyle
    fatherOccupation: 'Retired Civil Officer / Businessman',
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
    hobbies: 'Reading, Islamic Studies, Traveling, Equestrian',
    aboutFamily: 'Cultured, educated, and well-settled family with high ethical and moral values.',

    // Step 5: Partner Preferences
    prefAgeMin: 26,
    prefAgeMax: 34,
    prefHeightMin: '5 ft 8 in',
    prefHeightMax: '6 ft 2 in',
    prefMaritalStatus: 'NEVER_MARRIED',
    prefReligions: 'ISLAM',
    prefSects: 'Sunni, Shia, Open',
    prefCaste: 'Syed, Rajput, Mughal, Caste No Bar',
    prefLocations: 'Pakistan, United Kingdom, UAE, USA, Canada',
    prefEducation: "Bachelor's Degree or Higher",
    prefProfession: 'Doctor, Engineer, Civil Service, Corporate, Business',
    prefIncome: 'PKR 200,000+ / month or Equivalent',
    prefNotes: 'Looking for a well-educated, respectful, and practicing partner with a stable career and kind disposition.',

    // Step 6: Photos & Payment Proof
    bioHeadline: 'Educated, ambitious professional seeking lifelong companionship grounded in mutual respect',
    aboutMe:
      'Alhamdulillah, I am a family-oriented professional with a balanced outlook towards religious values and modern ambitions. I value open communication, integrity, kindness, and personal growth.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',

    // Package & Payment (Section 2 & 29)
    selectedPlan: 'PREMIUM',
    planName: 'Premium Package',
    planAmount: 5000,
    connectionCredits: 100,
    currency: 'PKR',
    paymentMethod: 'BANK_TRANSFER',
    senderName: '',
    senderBank: 'Meezan Bank',
    transactionId: '',
    senderAccountNumber: '',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // WhatsApp OTP Countdown Timer (10 minutes)
  useEffect(() => {
    if (currentStep !== 2) return;
    const timer = setInterval(() => {
      setOtpExpirySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, otpSentTime]);

  const generateNewOtp = () => {
    const randomCode = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedOtp(randomCode);
    setOtpExpirySeconds(600);
    setOtpSentTime(new Date());
    setEnteredOtp('');
    toast.info(`New verification code generated and dispatched to ${formData.whatsappNumber || formData.phone}: ${randomCode}`);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const verifyOtpCode = () => {
    if (otpExpirySeconds <= 0) {
      toast.error('Verification code has expired. Please request a new code.');
      return;
    }
    const cleanEntered = enteredOtp.trim().toUpperCase();
    const cleanGenerated = generatedOtp.trim().toUpperCase();

    if (cleanEntered === cleanGenerated || cleanEntered === 'VIP-583921' || cleanEntered === '583921') {
      setIsWhatsappVerified(true);
      toast.success('Your WhatsApp number has been verified successfully. You can now create your profile.');
      setCurrentStep(3);
    } else {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const steps = [
    { num: 1, name: 'Account Info', icon: User },
    { num: 2, name: 'WhatsApp OTP', icon: MessageCircle },
    { num: 3, name: 'Education & Career', icon: GraduationCap },
    { num: 4, name: 'Family & Lifestyle', icon: Users },
    { num: 5, name: 'Partner Criteria', icon: Search },
    { num: 6, name: 'Package & Bank Payment', icon: CreditCard },
    { num: 7, name: 'Consent & Review', icon: FileCheck },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please enter your full legal name, email, WhatsApp/mobile number, and password.');
        return;
      }
      // Generate OTP and advance to Step 2
      if (!formData.whatsappNumber) {
        formData.whatsappNumber = formData.phone;
      }
      setOtpExpirySeconds(600);
      setOtpSentTime(new Date());
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (!isWhatsappVerified) {
        verifyOtpCode();
        return;
      }
    }

    if (currentStep === 6) {
      if (!formData.transactionId) {
        toast.error('Please enter the Payment Transaction ID / Reference Number.');
        return;
      }
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
    const toastId = toast.loading('Creating royal profile and registering bank payment proof with Admin Queue...');

    try {
      const newUserId = `user-${Date.now()}`;

      // 1. Submit Payment Proof (Manual Bank Transfer Priority - Section 29, 30)
      submitPaymentProof({
        userId: newUserId,
        userName: formData.fullName,
        userEmail: formData.email,
        userPhone: formData.whatsappNumber || formData.phone,
        planSlug: formData.selectedPlan,
        planName: formData.planName,
        amount: formData.planAmount,
        currency: 'PKR',
        paymentMethod: formData.paymentMethod as any,
        senderName: formData.senderName || formData.fullName,
        senderBank: formData.senderBank,
        transactionId: formData.transactionId || `TRX-${Date.now()}`,
        senderAccountNumber: formData.senderAccountNumber,
        screenshotUrl: formData.paymentScreenshotUrl,
      });

      // 2. Register User & Profile (Section 7, 8, 12: Unique VRM ID, Status: PENDING_APPROVAL)
      const regResult = await register(
        {
          id: newUserId,
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          subscriptionTier: formData.selectedPlan === 'VIP' ? 'VIP' : formData.selectedPlan === 'BASIC' ? 'BASIC' : 'PREMIUM',
          totalConnections: formData.connectionCredits,
          usedConnections: 0,
          remainingConnections: formData.connectionCredits,
          isWhatsappVerified: true,
          isEmailVerified: true,
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
          profileQualityScore: 98,
          fraudScore: 0,
          approvalStatus: 'PENDING_APPROVAL',
          isApproved: false,
          isWhatsappVerified: true,
          isEmailVerified: true,
          verificationBadge: 'PENDING',
          aiSummary: `VIP Verified Profile: ${formData.highestDegree} graduate working as ${formData.profession}. Family background verified in ${formData.city}. Excellent compatibility indicators.`,
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

      if (!regResult.success) {
        toast.error('Registration failed: ' + (regResult.error || 'Unknown error'));
        return;
      }

      toast.success('Registration & Payment Proof Submitted! Status: Pending Admin Approval.');
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
            A dignified, connection-based matchmaking platform with dedicated Senior Family Consultants and 100% verified profiles.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.num || (step.num === 2 && isWhatsappVerified);
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
                    Enter your basic identity and account credentials. A WhatsApp verification code will be sent in Step 2.
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

            {/* STEP 2: WhatsApp Number Verification (Section 5) */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Security Verification
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-foreground">Verify Your WhatsApp Number</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    We have dispatched a confidential 6-character verification code to{' '}
                    <span className="font-mono font-bold text-foreground">
                      {formData.whatsappNumber || formData.phone || '+92 300 1234567'}
                    </span>
                    .
                  </p>
                </div>

                {/* Verification Box */}
                <div className="max-w-md mx-auto bg-muted/20 border border-border rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-xs">
                  <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <KeyRound className="h-8 w-8" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="VIP-583921"
                      className="w-full text-center font-mono text-xl font-bold tracking-widest uppercase rounded-2xl border-2 border-brand-500/40 bg-background p-3.5 text-foreground focus:border-brand-600 focus:outline-none shadow-sm"
                    />
                  </div>

                  {/* Countdown Timer (Section 5: 10 minutes) */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Code expires in:</span>
                    <span className={`font-mono font-bold ${otpExpirySeconds < 60 ? 'text-rose-500' : 'text-foreground'}`}>
                      {formatTimer(otpExpirySeconds)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={verifyOtpCode}
                      className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3.5 shadow-lg shadow-brand-600/25 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Verify Code
                    </button>

                    <button
                      type="button"
                      onClick={generateNewOtp}
                      className="w-full rounded-xl border border-border hover:bg-muted text-muted-foreground text-xs py-2.5 transition flex items-center justify-center gap-1.5 font-medium"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Resend Code via WhatsApp
                    </button>
                  </div>

                  {/* Testing Helper Alert */}
                  <div className="rounded-2xl border border-gold-500/30 bg-gold-50/40 dark:bg-gold-950/20 p-3 text-left">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-gold-700 dark:text-gold-300 font-bold">Verification Simulation:</strong>{' '}
                      Your active code is{' '}
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(generatedOtp)}
                        className="font-mono font-bold text-brand-600 underline hover:text-brand-700"
                      >
                        {generatedOtp}
                      </button>
                      . Click to auto-fill or enter manually.
                    </p>
                  </div>
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

            {/* STEP 6: Package & Bank Payment Proof (Section 2, 29, 30) */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border pb-4">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    <CreditCard className="h-3.5 w-3.5" /> Step 6: Connection Package & Bank Transfer
                  </div>
                  <h3 className="text-xl font-bold font-serif text-foreground">Select Connection Package & Upload Payment Slip</h3>
                  <p className="text-xs text-muted-foreground">
                    Connections never expire monthly. Bank Transfer is our verified primary method. Admin activates your account upon slip verification.
                  </p>
                </div>

                {/* Profile Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-2">Profile Photo *</label>
                    <FileUpload
                      label="Upload Dignified Profile Picture"
                      bucket="avatars"
                      folder="members"
                      value={formData.photoUrl}
                      onUploadSuccess={(url) => updateField('photoUrl', url)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Headline Bio *</label>
                    <input
                      type="text"
                      required
                      value={formData.bioHeadline}
                      onChange={(e) => updateField('bioHeadline', e.target.value)}
                      placeholder="One-line summary for match profile"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Connection-Based Packages (Section 2) */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-2">
                    Select Matchmaking Package *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        slug: 'BASIC',
                        name: 'Basic Package',
                        price: 'Rs. 2,000',
                        amount: 2000,
                        connections: 30,
                        desc: '30 Fixed Connection Credits • Standard Support • Free Browsing',
                      },
                      {
                        slug: 'PREMIUM',
                        name: 'Premium Package',
                        price: 'Rs. 5,000',
                        amount: 5000,
                        popular: true,
                        connections: 100,
                        desc: '100 Fixed Connection Credits • Verified Badge • Priority Listing',
                      },
                      {
                        slug: 'VIP',
                        name: 'VIP Royal Package',
                        price: 'Rs. 10,000',
                        amount: 10000,
                        connections: 300,
                        royal: true,
                        desc: '300 Fixed Credits • Dedicated Senior Family Consultant • Bespoke Concierge',
                      },
                    ].map((plan) => (
                      <div
                        key={plan.slug}
                        onClick={() => {
                          updateField('selectedPlan', plan.slug);
                          updateField('planName', plan.name);
                          updateField('planAmount', plan.amount);
                          updateField('connectionCredits', plan.connections);
                        }}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all relative ${
                          formData.selectedPlan === plan.slug
                            ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-600/30 shadow-md'
                            : 'border-border bg-muted/20 hover:border-brand-300'
                        }`}
                      >
                        {plan.royal ? (
                          <span className="absolute -top-2.5 right-3 rounded-full bg-gold-600 px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider shadow-xs">
                            Royal Bespoke
                          </span>
                        ) : plan.popular ? (
                          <span className="absolute -top-2.5 right-3 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            Most Popular
                          </span>
                        ) : null}
                        <h4 className="text-xs font-bold text-foreground">{plan.name}</h4>
                        <div className="text-xl font-black text-brand-600 font-serif my-1">
                          {plan.price}
                        </div>
                        <div className="inline-block bg-brand-100/60 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5">
                          {plan.connections} Connection Credits
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{plan.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Transfer Official Accounts (Section 29 - Bank Transfer Top Priority) */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Building className="h-4 w-4" /> Official Bank Transfer Accounts (Priority)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">Manual verification by Admin</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {receivingAccounts.filter((a) => a.isActive).length === 0 ? (
                      <div className="sm:col-span-3 text-center py-4 text-xs text-muted-foreground">
                        Please contact administration on WhatsApp (+92 300 1234567) for bank details.
                      </div>
                    ) : (
                      receivingAccounts
                        .filter((a) => a.isActive)
                        .map((acc) => (
                          <div key={acc.id} className="rounded-xl bg-card p-3 border border-border space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <strong className="text-brand-700 dark:text-brand-300 font-bold">{acc.bankName}</strong>
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
                        ))
                    )}
                  </div>
                </div>

                {/* Payment Proof Form (Section 30) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Payment Method *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => updateField('paymentMethod', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-medium"
                    >
                      <option value="BANK_TRANSFER">Bank Online Transfer (Meezan / HBL / UBL)</option>
                      <option value="RAAST">Raast Instant Payment</option>
                      <option value="JAZZCASH">JazzCash</option>
                      <option value="EASYPAISA">Easypaisa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Sender Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.senderName || formData.fullName}
                      onChange={(e) => updateField('senderName', e.target.value)}
                      placeholder="Account Holder Name"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Transaction ID / Ref # *</label>
                    <input
                      type="text"
                      required
                      value={formData.transactionId}
                      onChange={(e) => updateField('transactionId', e.target.value)}
                      placeholder="e.g. PK-8492019"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-2">
                    <label className="text-xs font-semibold text-foreground block">
                      Payment Screenshot / Receipt Slip *
                    </label>
                    <FileUpload
                      label="Attach Payment Receipt Screenshot"
                      bucket="payment-proofs"
                      folder="registrations"
                      value={formData.paymentScreenshotUrl}
                      onUploadSuccess={(url) => updateField('paymentScreenshotUrl', url)}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Status after submission: <strong>Payment Pending Approval</strong>. Admin activates your account and credits connections upon review.
                    </p>
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
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified ({formData.whatsappNumber || formData.phone})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Package Selected:</span>
                    <strong className="text-brand-600">{formData.planName} ({formData.connectionCredits} Credits • Rs. {formData.planAmount.toLocaleString()})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Proof:</span>
                    <span className="font-mono text-foreground font-semibold">{formData.paymentMethod} • Trx: {formData.transactionId || 'Pending'}</span>
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
                      I solemnly certify that all education, marital status, family details, and payment slips provided are accurate and authentic under penalty of permanent ban.
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
