'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Lock,
  Award,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Crown,
  Quote,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProfileCard } from '@/components/profile/profile-card';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { profiles, cms, plans } = useAuth();

  // Quick Hero Search State
  const [lookingFor, setLookingFor] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [minAge, setMinAge] = useState<number>(24);
  const [maxAge, setMaxAge] = useState<number>(34);
  const [religion, setReligion] = useState<string>('ALL');
  const [country, setCountry] = useState<string>('ALL');
  const [city, setCity] = useState<string>('ALL');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?gender=${lookingFor}&minAge=${minAge}&maxAge=${maxAge}&religion=${religion}&country=${country}&city=${city}`
    );
  };

  const featuredProfiles = profiles.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Announcement Banner */}
      {cms?.announcementBanner?.enabled && (
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-rose-900 px-4 py-2.5 text-center text-xs font-medium text-white shadow-inner">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
            <span>{cms.announcementBanner.text}</span>
            {cms.announcementBanner.link && (
              <Link
                href={cms.announcementBanner.link}
                className="inline-flex items-center underline hover:text-gold-300 font-semibold"
              >
                Learn more <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-background to-background py-16 sm:py-24 dark:from-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur-md dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-300">
                <Sparkles className="h-4 w-4 text-gold-500" />
                #1 Trusted Matrimonial Bureau for Educated Professionals
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-serif leading-[1.15]">
                Where Compatibility Meets{' '}
                <span className="bg-gradient-to-r from-brand-700 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                  Commitment
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Connect with thousands of verified doctors, engineers, executives, and accomplished individuals who share your cultural values, spiritual outlook, and lifelong marriage intentions.
              </p>

              {/* Primary Call to actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-all hover:scale-[1.02] hover:shadow-brand-600/35"
                >
                  <Heart className="h-4 w-4 fill-white" /> Find Your Life Partner
                </Link>
                <Link
                  href="/search"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-7 py-4 text-sm font-semibold text-foreground backdrop-blur-md transition hover:bg-muted"
                >
                  <Search className="h-4 w-4 text-muted-foreground" /> Browse Verified Matches
                </Link>
              </div>

              {/* Trust Metrics Pill */}
              <div className="pt-6 border-t border-border/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span><strong>100% ID Verified</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-brand-600" />
                  <span><strong>Granular Privacy</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold-600" />
                  <span><strong>45,000+</strong> Happy Marriages</span>
                </div>
              </div>
            </div>

            {/* Right Quick Matrimonial Search Widget Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-brand-100/80 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-brand-900/10 backdrop-blur-xl dark:border-brand-900/50 dark:bg-card/95">
                <div className="mb-6 border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Quick Match Search</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Live Directory
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground font-serif mt-1">Begin Your Partner Search</h2>
                </div>

                <form onSubmit={handleHeroSearch} className="space-y-4">
                  {/* Looking For Gender */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">I am looking for a</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLookingFor('FEMALE')}
                        className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                          lookingFor === 'FEMALE'
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Bride (Female)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLookingFor('MALE')}
                        className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                          lookingFor === 'MALE'
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Groom (Male)
                      </button>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">Min Age</label>
                      <select
                        value={minAge}
                        onChange={(e) => setMinAge(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        {[20, 22, 24, 26, 28, 30, 32, 35, 40].map((a) => (
                          <option key={a} value={a}>
                            {a} Years
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">Max Age</label>
                      <select
                        value={maxAge}
                        onChange={(e) => setMaxAge(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                      >
                        {[25, 28, 30, 32, 35, 38, 42, 50].map((a) => (
                          <option key={a} value={a}>
                            {a} Years
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Religion & Location */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Religion</label>
                    <select
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    >
                      <option value="ALL">All Religions</option>
                      <option value="ISLAM">Islam</option>
                      <option value="HINDUISM">Hinduism</option>
                      <option value="SIKHISM">Sikhism</option>
                      <option value="CHRISTIANITY">Christianity</option>
                      <option value="SPIRITUAL">Spiritual</option>
                    </select>
                  </div>

                  {/* Country & Dependent City Selectors */}
                  <CountryCitySelect
                    layout="grid"
                    includeAllOption
                    allCountryLabel="All Countries"
                    allCityLabel="All Cities"
                    selectedCountry={country}
                    selectedCity={city}
                    onCountryChange={(c) => {
                      setCountry(c);
                      setCity('ALL');
                    }}
                    onCityChange={(ct) => setCity(ct)}
                    allowCustomCity={false}
                  />

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-600/20 transition hover:from-brand-700 hover:to-rose-700"
                  >
                    <Search className="h-4 w-4" /> View Compatible Matches
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-16 sm:py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
                <Crown className="h-4 w-4 text-gold-500" /> Featured Spotlight
              </div>
              <h2 className="text-3xl font-bold text-foreground font-serif">Handpicked Verified Profiles</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Accomplished individuals with verified government IDs and complete family dossiers.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All 1,400+ Matches <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProfiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-brand-50/40 dark:bg-brand-950/10 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Simple & Dignified Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif mt-2 mb-4">
            How TRUEPAIR Unites Families
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mb-14">
            We blend modern computational matching with time-honored family matchmaking traditions.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Create Verified Profile',
                desc: 'Upload your photos, career credentials, lifestyle habits, and family background with strict privacy controls.',
                icon: ShieldCheck,
              },
              {
                step: '02',
                title: 'Define Partner Criteria',
                desc: 'Specify age, location, educational qualifications, profession, and religious preferences with precision.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Send & Receive Interests',
                desc: 'Explore curated matches with compatibility scores and express interest with personalized introduction notes.',
                icon: Heart,
              },
              {
                step: '04',
                title: 'Introduce & Celebrate',
                desc: 'Converse privately through secure chat, exchange contact permissions, and celebrate your union.',
                icon: Award,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-3xl border border-border bg-card p-6 shadow-sm text-left transition hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-black text-brand-200 dark:text-brand-900 font-serif">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real Success Stories Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Testimonials of Love</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif mt-2 mb-4">
              Real Couples, Everlasting Marriages
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Read how educated couples found their lifelong soulmates through TRUEPAIR's matrimonial bureau.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {cms.successStories.map((story) => (
              <div
                key={story.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img src={story.photoUrl} alt={story.coupleName} className="h-full w-full object-cover" />
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
                    💍 Married {story.weddingDate}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-1 text-gold-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-500" />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-serif">{story.coupleName}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{story.city}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">"{story.story}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-brand-50/40 dark:bg-brand-950/10 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Transparent Memberships</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif mt-2 mb-4">
            Invest in Your Life's Most Important Decision
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-14">
            Select a tailored membership plan to unlock verified contact details, direct chat, and personalized matchmaking.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto text-left">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition hover:shadow-xl ${
                  p.isPopular
                    ? 'border-brand-500 bg-white ring-2 ring-brand-500 dark:bg-card'
                    : 'border-border bg-card'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-brand-600 to-rose-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                    {p.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold text-foreground font-serif">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-6">{p.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-foreground font-serif">${p.monthlyPrice}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>

                <ul className="space-y-3 text-xs mb-8 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className={`w-full rounded-2xl py-3 text-center text-xs font-bold transition shadow-sm ${
                    p.isPopular
                      ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-brand-600/20 hover:from-brand-700'
                      : 'border border-border bg-muted/40 text-foreground hover:bg-muted'
                  }`}
                >
                  Choose {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Frequently Asked Questions</span>
            <h2 className="text-3xl font-bold text-foreground font-serif mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {cms.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center justify-between">
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Strip */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-rose-950 py-16 text-center text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold font-serif">
            Begin Your Sacred Matrimonial Journey Today
          </h2>
          <p className="text-xs sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of verified members and dignified families discovering meaningful compatibility. Registration is fast, respectful, and free.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-brand-900 shadow-xl transition hover:bg-brand-50"
            >
              <Heart className="h-4 w-4 fill-brand-900" /> Create Your Matrimonial Profile
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
