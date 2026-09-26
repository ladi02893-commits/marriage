'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Search,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  PhoneCall,
  BadgeCheck,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProfileCard } from '@/components/profile/profile-card';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, profiles, cms, plans, consultants } = useAuth();

  React.useEffect(() => {
    if (currentUser && ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      router.replace('/admin');
    }
  }, [currentUser, router]);

  // Quick Hero Search State
  const [lookingFor, setLookingFor] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [city, setCity] = useState<string>('ALL');
  const [education, setEducation] = useState<string>('ALL');
  const [quickProfileId, setQuickProfileId] = useState<string>('');

  const handleResetHero = () => {
    setLookingFor('FEMALE');
    setMinAge('');
    setMaxAge('');
    setCity('ALL');
    setEducation('ALL');
    setQuickProfileId('');
    toast.info('Search filters reset to default.');
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      toast.error('Age From cannot be greater than Age To.');
      return;
    }
    const params = new URLSearchParams();
    if (lookingFor) params.set('gender', lookingFor);
    if (minAge) params.set('minAge', minAge);
    if (maxAge) params.set('maxAge', maxAge);
    if (city && city !== 'ALL') params.set('city', city);
    if (education && education !== 'ALL') params.set('education', education);
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : '/search');
  };

  const handleQuickIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProfileId.trim()) return;
    router.push(`/search?profileId=${encodeURIComponent(quickProfileId.trim().toUpperCase())}`);
  };

  const verifiedProfiles = profiles
    .filter((p) => p.verificationBadge === 'APPROVED' || p.isWhatsappVerified || p.isVIPVerified || p.isVerified)
    .slice(0, 4);

  if (currentUser && ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span>Redirecting to Admin Control Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-background to-background py-16 sm:py-24">
        {/* Decorative ambient elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-gold-300/20 via-brand-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/90 px-4 py-1.5 text-xs font-bold text-brand-900 shadow-sm backdrop-blur-md">
                <Crown className="h-4 w-4 text-gold-600" />
                #1 Connection-Based Royal Matrimonial Platform for Pakistani Families
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-serif leading-[1.12]">
                Where Nobility Meets{' '}
                <span className="bg-gradient-to-r from-brand-900 via-brand-700 to-gold-600 bg-clip-text text-transparent">
                  Lifelong Matrimony
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Connect with thousands of verified doctors, engineers, executives, and respected families across Pakistan & overseas. Powered by **fixed connection credits, dedicated senior family consultants, and strict privacy safeguards**.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-rose-900 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-900/25 transition-all hover:scale-[1.02] border border-gold-400/40"
                >
                  <Crown className="h-4 w-4 text-gold-300" /> Register Matrimonial Profile
                </Link>
                <Link
                  href="/search"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-7 py-4 text-sm font-bold text-foreground transition hover:bg-muted shadow-sm"
                >
                  <Search className="h-4 w-4 text-muted-foreground" /> Search by Profile ID
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-border flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  <span>Unique <strong>VRM Profile IDs</strong></span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-gold-600" />
                  <span><strong>Zero Expiry</strong> Connection Credits</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Crown className="h-4 w-4 text-brand-800" />
                  <span>Senior Family Matchmakers</span>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Search Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gold-300/40 bg-card p-6 sm:p-8 shadow-xl shadow-brand-900/5">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-foreground">Find Your Match</h3>
                    <p className="text-xs text-muted-foreground">Search verified Pakistani candidates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetHero}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 hover:underline px-2 py-1 rounded-lg border border-border bg-muted/30 transition"
                      title="Reset filters"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-800">
                      <Search className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <form onSubmit={handleHeroSearch} className="space-y-4">
                  {/* Looking For */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Seeking Partner</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLookingFor('FEMALE')}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          lookingFor === 'FEMALE'
                            ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                            : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Bride (Female)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLookingFor('MALE')}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          lookingFor === 'MALE'
                            ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                            : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Groom (Male)
                      </button>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Age From</label>
                      <select
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="">Select Age</option>
                        {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 45, 50, 55, 60, 65, 70].map((a) => (
                          <option key={a} value={String(a)}>{a} Years</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Age To</label>
                      <select
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="">Select Age</option>
                        {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 45, 50, 55, 60, 65, 70].map((a) => (
                          <option key={a} value={String(a)}>{a} Years</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">City / Region</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-medium"
                    >
                      <option value="ALL">All Cities (Pakistan & Overseas)</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="UAE">UAE / Dubai</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Education Level</label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-medium"
                    >
                      <option value="ALL">Any Education Level</option>
                      <option value="DOCTORATE">Doctorate / MBBS / Specialist</option>
                      <option value="MASTERS">Masters / MS / MPhil</option>
                      <option value="BACHELORS">Bachelors (Engg / BS / BBA)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-brand-900 to-brand-800 py-3 text-xs font-bold text-white shadow-md transition hover:scale-[1.01]"
                  >
                    View Compatible Profiles
                  </button>
                </form>

                {/* Direct Profile ID Lookup */}
                <div className="mt-4 pt-4 border-t border-border">
                  <form onSubmit={handleQuickIdSearch} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Profile ID (e.g. VRM-000002)"
                      value={quickProfileId}
                      onChange={(e) => setQuickProfileId(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono uppercase text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-gold-500 hover:bg-gold-600 px-4 py-2 text-xs font-bold text-brand-950 transition"
                    >
                      Go
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (7 DISTINCT STEPS - Section 86) */}
      <section className="py-16 sm:py-20 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-mono">
              7-Step Matrimonial Journey
            </span>
            <h2 className="text-3xl font-bold font-serif text-foreground mt-1">
              How VIP Royal Matchmaking Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              A dignified, structured pathway engineered for genuine lifelong commitment and family consensus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">01</span>
              <h4 className="text-sm font-bold text-foreground">Register Account</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide basic personal and family background information securely.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">02</span>
              <h4 className="text-sm font-bold text-foreground">WhatsApp Verification</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                WhatsApp verification will be available when the messaging provider integration is enabled.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">03</span>
              <h4 className="text-sm font-bold text-foreground">Create Profile & ID</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive your permanent unique Profile ID (VRM-000001) upon admin verification.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">04</span>
              <h4 className="text-sm font-bold text-foreground">Connection Credits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select a package with fixed connection credits that never expire monthly.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">05</span>
              <h4 className="text-sm font-bold text-foreground">Discover Matches</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review verified profiles and compatibility breakdown without deducting credits.
              </p>
            </div>

            {/* Step 6 */}
            <div className="rounded-2xl border border-border bg-background p-5 space-y-3 relative">
              <span className="text-xs font-bold font-mono text-gold-600">06</span>
              <h4 className="text-sm font-bold text-foreground">Connect & Reveal</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send interest or unlock contact details (1 credit per unique profile unlock).
              </p>
            </div>

            {/* Step 7 */}
            <div className="rounded-2xl border border-gold-300 bg-gold-50/30 dark:bg-gold-950/20 p-5 space-y-3 relative lg:col-span-2">
              <span className="text-xs font-bold font-mono text-gold-700">07 • Royal Concierge</span>
              <h4 className="text-sm font-bold text-foreground">Dedicated Senior Family Consultant</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For VIP Royal members, an experienced matchmaker coordinates direct family introductions, conducts background verifications, and manages discrete meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFIED PROFILES SHOWCASE (Section 85) */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-mono">
                Verified Directory
              </span>
              <h2 className="text-3xl font-bold font-serif text-foreground mt-1">
                Featured Matrimonial Profiles
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Authentic profiles with verified education, family backgrounds, and unique VRM IDs.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-900 hover:text-gold-700 transition"
            >
              Browse all candidates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {verifiedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. DEDICATED SENIOR FAMILY CONSULTANT (Section 24 & 85) */}
      <section id="consultant" className="py-16 sm:py-20 bg-gradient-to-r from-brand-950 via-brand-900 to-navy-950 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-gold-300 backdrop-blur-md border border-white/20">
                <Crown className="h-3.5 w-3.5 text-gold-400" /> Exclusive VIP Matchmaking Service
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
                Dedicated Senior Family Consultants for Discerning Families
              </h2>

              <p className="text-xs sm:text-sm text-brand-100 leading-relaxed max-w-xl">
                Unlike casual dating websites, VIP Royal Matchmaking provides dedicated Senior Family Consultants who personally understand your family values, conduct discreet background checks, handpick compatible doctor/executive rishtas, and assist in setting up formal family introductions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-gold-300">Handpicked Recommendations</h4>
                  <p className="text-[11px] text-white/70">Personalized proposals aligned with family standing.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-gold-300">Family Background Verification</h4>
                  <p className="text-[11px] text-white/70">Confidential authentication of moral and financial standing.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-gold-300">Direct Introduction Concierge</h4>
                  <p className="text-[11px] text-white/70">Coordinate respectable meetings between parents and elders.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-gold-300">Continuous Consultation</h4>
                  <p className="text-[11px] text-white/70">Regular follow-ups and guidance until a successful match is finalized.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-3.5 text-xs font-bold text-brand-950 shadow-lg hover:bg-gold-400 transition"
                >
                  <Crown className="h-4 w-4" /> Upgrade to VIP Royal Concierge
                </Link>
              </div>
            </div>

            {/* Consultant Showcase Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gold-400/40 bg-white/10 p-6 sm:p-8 backdrop-blur-md space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300 ring-2 ring-gold-400">
                    <Crown className="h-10 w-10" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300 font-mono">Concierge service</span>
                    <h3 className="text-lg font-bold font-serif text-white">Consultant assignment</h3>
                    <p className="text-xs text-brand-200">Real consultant details appear only after an administrator assigns one to your account.</p>
                  </div>
                </div>

                <p className="text-xs text-white/80 italic border-l-2 border-gold-400 pl-3">
                  Consultant availability and contact details are never fabricated; assignment status is shown transparently in the member dashboard.
                </p>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-white/90">
                  <span>Support and consultant coordination</span>
                  <span className="font-bold text-gold-300">Subject to assignment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONNECTION-BASED PACKAGES (Section 2 & 87) */}
      <section className="py-16 sm:py-24 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-mono">
              Transparent Investment
            </span>
            <h2 className="text-3xl font-bold font-serif text-foreground mt-1">
              Connection-Based Packages
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Fixed connection credits with <strong>no monthly expiration</strong>. Unlock contacts and introduce families at your own pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Package */}
            <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Essential Tier</span>
                <h3 className="text-xl font-bold font-serif text-foreground">Basic Package</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground font-serif">Rs. 2,000</span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-xs font-bold text-brand-900 border border-border">
                  ✨ 30 Direct Connection Credits Included
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unique VRM Profile ID</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlock Full Phone & WhatsApp Contacts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Incoming Interest Inquiries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Bank Transfer Payment Verification</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-border">
                <Link
                  href="/pricing"
                  className="block w-full rounded-2xl border border-brand-900 py-3 text-center text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                >
                  Select Basic
                </Link>
              </div>
            </div>

            {/* Premium Package */}
            <div className="rounded-3xl border-2 border-brand-900 bg-background p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-900 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-gold-700 uppercase tracking-wider font-mono">Executive Outreach</span>
                <h3 className="text-xl font-bold font-serif text-foreground">Premium Package</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-900 font-serif">Rs. 5,000</span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </div>
                <div className="rounded-xl bg-gold-50 p-3 text-xs font-bold text-brand-900 border border-gold-300">
                  ✨ 100 Direct Connection Credits Included
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>100 Full Contact Unlocks (Phone & WhatsApp)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Profile Boosted on Search Directory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Priority Identity Verification Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp & Email Alert Notifications</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-border">
                <Link
                  href="/pricing"
                  className="block w-full rounded-2xl bg-brand-900 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-brand-950"
                >
                  Select Premium
                </Link>
              </div>
            </div>

            {/* VIP Royal Package */}
            <div className="rounded-3xl border border-gold-400 bg-gradient-to-b from-gold-50/50 to-background p-6 sm:p-8 flex flex-col justify-between shadow-lg relative">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-200 px-3 py-0.5 text-[10px] font-bold text-brand-900">
                  <Crown className="h-3 w-3 text-gold-700" /> Royal Concierge
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">VIP Royal Package</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-950 font-serif">Rs. 10,000</span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </div>
                <div className="rounded-xl bg-gold-100 p-3 text-xs font-bold text-brand-950 border border-gold-400">
                  👑 300 Connections + Dedicated Consultant
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Dedicated Senior Family Consultant</strong> Assigned</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Handpicked Doctor / Bureaucrat / Executive Rishtas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>300 Direct Connection Credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Confidential Family Background Verifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Direct Introduction Meetings Arranged</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-border">
                <Link
                  href="/pricing"
                  className="block w-full rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 py-3 text-center text-xs font-bold text-brand-950 shadow-md transition hover:bg-gold-400"
                >
                  Join VIP Royal Concierge
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUCCESS STORIES (Section 62 & 85) */}
      <section className="py-16 sm:py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-mono">
              Testimonials of Trust
            </span>
            <h2 className="text-3xl font-bold font-serif text-foreground mt-1">
              Royal Success Stories
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Only consented and administrator-approved stories appear here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cms.successStories.length === 0 ? (
              <div className="md:col-span-2 rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No verified success stories have been published yet.
              </div>
            ) : cms.successStories.map((story) => (
              <div key={story.id} className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm flex flex-col sm:flex-row">
                <img
                  src={story.photoUrl}
                  alt={story.coupleName}
                  className="h-56 sm:h-auto sm:w-48 object-cover shrink-0"
                />
                <div className="p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase font-mono text-gold-600">{story.weddingDate} • {story.city}</span>
                    <h3 className="text-lg font-bold font-serif text-foreground mt-0.5">{story.coupleName}</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">
                      “{story.story}”
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="h-4 w-4" /> Verified Matrimonial Union
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION (Section 88) */}
      <section className="py-16 sm:py-20 bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-mono">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-bold font-serif text-foreground mt-1">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {cms.faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-border bg-background p-5 open:bg-brand-50/20 transition">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-foreground">
                  <span>{faq.question}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ROYAL CONCIERGE CONTACT (Section 85) */}
      <section className="py-16 sm:py-20 bg-background text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Crown className="h-10 w-10 text-gold-600 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Experience Dignified Matrimonial Consultation
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Our Senior Family Consultants and Administrative Desk are available 6 days a week to answer your inquiries and assist your family.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="rounded-2xl bg-brand-900 px-8 py-4 text-xs font-bold text-white shadow-lg transition hover:bg-brand-950"
            >
              Begin Your Journey
            </Link>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-emerald-600 text-emerald-700 px-7 py-4 text-xs font-bold transition hover:bg-emerald-50"
            >
              <PhoneCall className="h-4 w-4" /> WhatsApp Concierge Desk
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
