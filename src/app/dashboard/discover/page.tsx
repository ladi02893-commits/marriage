'use client';

import React, { useState } from 'react';
import { Sparkles, Filter, Users, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';
import { CountryCitySelect } from '@/components/ui/country-city-select';
import { MatchingService } from '@/lib/matching-service';

export default function DiscoverMatchesPage() {
  const { profiles, currentProfile } = useAuth();
  const [filterReligion, setFilterReligion] = useState<string>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterCity, setFilterCity] = useState<string>('ALL');

  // Filter out own profile & same gender
  const candidates = profiles
    .filter((p) => {
      if (currentProfile && p.id === currentProfile.id) return false;
      if (currentProfile && p.gender === currentProfile.gender) return false;
      if (filterReligion !== 'ALL' && p.religion !== filterReligion) return false;
      if (filterCountry !== 'ALL' && !p.country.toLowerCase().includes(filterCountry.toLowerCase())) return false;
      if (filterCity !== 'ALL' && !p.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (!currentProfile) return 0;
      const scoreA = MatchingService.calculateCompatibility(currentProfile, a).overallScore;
      const scoreB = MatchingService.calculateCompatibility(currentProfile, b).overallScore;
      return scoreB - scoreA;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Sparkles className="h-4 w-4 text-gold-500" /> AI Compatibility Engine
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Discover Handpicked Matches</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Profiles dynamically ordered by compatibility with your education, lifestyle, and partner expectations.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Filter Religion</label>
            <select
              value={filterReligion}
              onChange={(e) => setFilterReligion(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Religions</option>
              <option value="ISLAM">Islam</option>
              <option value="HINDUISM">Hinduism</option>
              <option value="SIKHISM">Sikhism</option>
              <option value="CHRISTIANITY">Christianity</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <CountryCitySelect
              layout="grid"
              includeAllOption
              allCountryLabel="All Countries"
              allCityLabel="All Cities"
              countryLabel="Filter Country"
              cityLabel="Filter City"
              selectedCountry={filterCountry}
              selectedCity={filterCity}
              onCountryChange={(c) => {
                setFilterCountry(c);
                setFilterCity('ALL');
              }}
              onCityChange={(ct) => setFilterCity(ct)}
              allowCustomCity={false}
            />
          </div>
        </div>
      </div>

      {/* Grid of Candidate Profiles */}
      {candidates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No matches found for this filter</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Try setting filter to 'All Religions' to explore more profiles.
          </p>
          <button
            onClick={() => setFilterReligion('ALL')}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Show All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <ProfileCard key={candidate.id} profile={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}
