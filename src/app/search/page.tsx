'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Filter,
  Bookmark,
  Users,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProfileCard } from '@/components/profile/profile-card';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { useAuth } from '@/lib/auth-context';
import { MatchingService } from '@/lib/matching-service';
import { toast } from 'sonner';

function SearchContent() {
  const searchParams = useSearchParams();
  const { profiles, currentProfile, currentUser, connectionQuota } = useAuth();

  // Initial params from URL
  const initialGender = searchParams.get('gender') || 'ALL';
  const initialReligion = searchParams.get('religion') || 'ALL';
  const initialCountry = searchParams.get('country') || 'ALL';
  const initialCity = searchParams.get('city') || 'ALL';
  const initialMinAge = Number(searchParams.get('minAge')) || 20;
  const initialMaxAge = Number(searchParams.get('maxAge')) || 45;

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [gender, setGender] = useState<string>(initialGender);
  const [minAge, setMinAge] = useState<number>(initialMinAge);
  const [maxAge, setMaxAge] = useState<number>(initialMaxAge);
  const [religion, setReligion] = useState<string>(initialReligion);
  const [sect, setSect] = useState<string>('ALL');
  const [caste, setCaste] = useState<string>('ALL');
  const [maritalStatus, setMaritalStatus] = useState<string>('ALL');
  const [country, setCountry] = useState<string>(initialCountry);
  const [city, setCity] = useState<string>(initialCity);
  const [profession, setProfession] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('COMPATIBILITY');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        // Exclude current user's own profile
        if (currentProfile && p.id === currentProfile.id) return false;

        // Gender filter
        if (gender !== 'ALL' && p.gender !== gender) return false;

        // Age filter
        if (p.age < minAge || p.age > maxAge) return false;

        // Religion filter
        if (religion !== 'ALL' && p.religion !== religion) return false;

        // Sect filter
        if (sect !== 'ALL' && p.sectOrCommunity && !p.sectOrCommunity.toLowerCase().includes(sect.toLowerCase())) return false;

        // Caste filter
        if (caste !== 'ALL' && p.caste && !p.caste.toLowerCase().includes(caste.toLowerCase())) return false;

        // Marital status filter
        if (maritalStatus !== 'ALL' && p.maritalStatus !== maritalStatus) return false;

        // Country filter
        if (country !== 'ALL' && !p.country.toLowerCase().includes(country.toLowerCase())) return false;

        // City filter
        if (city !== 'ALL' && !p.city.toLowerCase().includes(city.toLowerCase())) return false;

        // Profession filter
        if (
          profession !== 'ALL' &&
          !p.educationCareer?.profession.toLowerCase().includes(profession.toLowerCase())
        )
          return false;

        // Verified filter
        if (verifiedOnly && p.verificationBadge !== 'APPROVED') return false;

        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = p.fullName.toLowerCase().includes(term);
          const matchCity = p.city.toLowerCase().includes(term);
          const matchProf = p.educationCareer?.profession?.toLowerCase().includes(term);
          const matchBio = p.aboutMe.toLowerCase().includes(term);
          if (!matchName && !matchCity && !matchProf && !matchBio) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'COMPATIBILITY' && currentProfile) {
          const scoreA = MatchingService.calculateCompatibility(currentProfile, a).overallScore;
          const scoreB = MatchingService.calculateCompatibility(currentProfile, b).overallScore;
          return scoreB - scoreA;
        }
        if (sortBy === 'AGE_ASC') return a.age - b.age;
        if (sortBy === 'AGE_DESC') return b.age - a.age;
        if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [
    profiles,
    currentProfile,
    gender,
    minAge,
    maxAge,
    religion,
    maritalStatus,
    country,
    city,
    profession,
    verifiedOnly,
    searchTerm,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setGender('ALL');
    setMinAge(20);
    setMaxAge(45);
    setReligion('ALL');
    setSect('ALL');
    setCaste('ALL');
    setMaritalStatus('ALL');
    setCountry('ALL');
    setCity('ALL');
    setProfession('ALL');
    setVerifiedOnly(false);
    setSortBy('COMPATIBILITY');
    toast.info('Search filters reset to default.');
  };

  const handleSaveSearch = () => {
    toast.success('Search criteria saved! You will receive weekly alerts for new matching profiles.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Connection Quota Exhaustion Alert */}
      {currentUser && connectionQuota.isReached && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2.5 text-xs font-semibold shadow-md">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              🔒 <strong>Connection Limit Reached ({connectionQuota.used}/{connectionQuota.total} Used):</strong> You have exhausted your {connectionQuota.planName} quota. Unconnected candidate profiles are locked.
            </span>
            <a
              href="/pricing"
              className="rounded-xl bg-white px-3.5 py-1 text-xs font-bold text-amber-900 hover:bg-zinc-100 shadow-sm shrink-0"
            >
              ⚡ Upgrade Plan to Unlock All
            </a>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-border bg-brand-50/40 py-8 dark:bg-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-600">
                  <Sparkles className="h-3.5 w-3.5" /> Matrimonial Member Directory
                </span>
                {currentUser && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    connectionQuota.isReached
                      ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    🎯 Quota: {connectionQuota.used}/{connectionQuota.total} Connections
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
                Discover Compatible Life Partners
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing <strong>{filteredProfiles.length}</strong> verified matrimonial profiles matching your criteria.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSearch}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 dark:border-brand-900 dark:bg-card dark:text-brand-300"
              >
                <Bookmark className="h-3.5 w-3.5" /> Save Search Alert
              </button>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
            </div>
          </div>

          {/* Search bar & Sorting bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, city, profession, or keyword..."
                className="w-full rounded-2xl border border-border bg-white pl-10 pr-4 py-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none dark:bg-card"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto rounded-2xl border border-border bg-white px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-brand-500 focus:outline-none dark:bg-card"
              >
                <option value="COMPATIBILITY">Highest Compatibility %</option>
                <option value="NEWEST">Newly Joined</option>
                <option value="AGE_ASC">Age: Youngest First</option>
                <option value="AGE_DESC">Age: Senior First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm self-start sticky top-24">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
                <Filter className="h-4 w-4 text-brand-600" /> Filters
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'All', val: 'ALL' },
                  { label: 'Female', val: 'FEMALE' },
                  { label: 'Male', val: 'MALE' },
                ].map((g) => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => setGender(g.val)}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      gender === g.val
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950 dark:text-brand-300'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range Slider / Inputs */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Age Range</span>
                <span className="text-brand-600">
                  {minAge} - {maxAge} yrs
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={18}
                  max={maxAge}
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-2 text-xs text-foreground focus:outline-none"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={minAge}
                  max={70}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-2 text-xs text-foreground focus:outline-none"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Religion */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Religion</label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All Religions</option>
                <option value="ISLAM">Islam</option>
                <option value="HINDUISM">Hinduism</option>
                <option value="SIKHISM">Sikhism</option>
                <option value="CHRISTIANITY">Christianity</option>
                <option value="SPIRITUAL">Spiritual</option>
              </select>
            </div>

            {/* Sect / Community */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Sect / Firqa</label>
              <select
                value={sect}
                onChange={(e) => setSect(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All Sects / Firqas</option>
                <option value="Sunni">Sunni</option>
                <option value="Shia">Shia</option>
                <option value="Ahle-Hadith">Ahle-Hadith</option>
                <option value="Deobandi">Deobandi</option>
                <option value="Barelvi">Barelvi</option>
                <option value="Ismaili">Ismaili</option>
              </select>
            </div>

            {/* Caste / Zaat */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Caste / Zaat</label>
              <select
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All Castes (No Bar)</option>
                <option value="Syed">Syed</option>
                <option value="Rajput">Rajput</option>
                <option value="Mughal">Mughal</option>
                <option value="Arain">Arain</option>
                <option value="Jatt">Jatt</option>
                <option value="Malik">Malik / Awan</option>
                <option value="Sheikh">Sheikh</option>
                <option value="Gujjar">Gujjar</option>
                <option value="Abbasi">Abbasi</option>
                <option value="Memon">Memon</option>
                <option value="Niazi">Niazi / Pathan</option>
                <option value="Butt">Butt / Kashmiri</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">Any Marital Status</option>
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
              </select>
            </div>

            {/* Country & Dynamic City Filters */}
            <CountryCitySelect
              layout="stacked"
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

            {/* Profession */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Profession Sector</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All Professions</option>
                <option value="Doctor">Healthcare / Doctors</option>
                <option value="Engineer">Software / Engineering</option>
                <option value="Finance">Finance & Investment</option>
                <option value="Architect">Architecture & Design</option>
                <option value="Professor">Academia / Research</option>
                <option value="Business">Business / Entrepreneur</option>
              </select>
            </div>

            {/* Verified Badge Checkbox */}
            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                />
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Show ID Verified Only</span>
              </label>
            </div>
          </div>

          {/* Results Grid */}
          <div className="md:col-span-3">
            {filteredProfiles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/40">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-serif mt-4">No Profiles Matched</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                  Try broadening your age range, location, or religion criteria to discover more compatible matches.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden">
          <div className="ml-auto w-full max-w-xs h-full bg-card p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-sm text-foreground">Filter Profiles</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Filter Options */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['ALL', 'FEMALE', 'MALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-xl border py-2 text-xs font-medium ${
                      gender === g ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-border'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md"
            >
              Apply Filters ({filteredProfiles.length} Results)
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading matrimonial directory...</div>}>
      <SearchContent />
    </Suspense>
  );
}
