'use client';

import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Edit3 } from 'lucide-react';
import { getAllCountries, getCitiesForCountry, PRIORITY_COUNTRIES } from '@/lib/locations-data';

export interface CountryCitySelectProps {
  selectedCountry: string;
  selectedCity: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  layout?: 'grid' | 'stacked' | 'inline';
  includeAllOption?: boolean;
  allCountryLabel?: string;
  allCityLabel?: string;
  countryLabel?: string;
  cityLabel?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustomCity?: boolean;
  countryClassName?: string;
  cityClassName?: string;
  labelClassName?: string;
}

export function CountryCitySelect({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  layout = 'grid',
  includeAllOption = false,
  allCountryLabel = 'All Countries',
  allCityLabel = 'All Cities',
  countryLabel = 'Country',
  cityLabel = 'City',
  required = false,
  disabled = false,
  allowCustomCity = true,
  countryClassName = '',
  cityClassName = '',
  labelClassName = '',
}: CountryCitySelectProps) {
  const [isCustomCityMode, setIsCustomCityMode] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');

  const allCountries = getAllCountries();
  const availableCities = getCitiesForCountry(selectedCountry);

  // Check if current city is already custom
  useEffect(() => {
    if (!selectedCountry || selectedCountry === 'ALL') {
      setIsCustomCityMode(false);
      return;
    }

    if (
      selectedCity &&
      selectedCity !== 'ALL' &&
      availableCities.length > 0 &&
      !availableCities.includes(selectedCity)
    ) {
      setIsCustomCityMode(true);
      setCustomCityInput(selectedCity);
    } else {
      setIsCustomCityMode(false);
    }
  }, [selectedCountry, selectedCity, availableCities]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    onCountryChange(newCountry);

    if (newCountry === 'ALL' || !newCountry) {
      onCityChange(includeAllOption ? 'ALL' : '');
      setIsCustomCityMode(false);
      return;
    }

    const newCities = getCitiesForCountry(newCountry);
    if (includeAllOption) {
      onCityChange('ALL');
      setIsCustomCityMode(false);
    } else if (newCities.length > 0) {
      // Auto-select first city or keep if already valid
      onCityChange(newCities[0]);
      setIsCustomCityMode(false);
    } else {
      onCityChange('');
    }
  };

  const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomCityMode(true);
      setCustomCityInput('');
      onCityChange('');
    } else {
      setIsCustomCityMode(false);
      onCityChange(val);
    }
  };

  const handleCustomCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCityInput(val);
    onCityChange(val);
  };

  const containerClasses =
    layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
      : layout === 'inline'
      ? 'flex flex-col sm:flex-row gap-3'
      : 'space-y-4';

  const defaultLabelClass =
    labelClassName || 'text-xs font-semibold text-foreground block mb-1';
  const defaultSelectClass =
    'w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none disabled:opacity-50 transition';

  return (
    <div className={containerClasses}>
      {/* Country Selection */}
      <div className="w-full">
        {countryLabel && (
          <label className={defaultLabelClass}>
            <Globe className="h-3.5 w-3.5 inline mr-1 text-brand-600" />
            {countryLabel} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          disabled={disabled}
          required={required}
          className={`${defaultSelectClass} ${countryClassName}`}
        >
          {includeAllOption && <option value="ALL">{allCountryLabel}</option>}
          {!includeAllOption && !selectedCountry && (
            <option value="" disabled>
              Select Country...
            </option>
          )}

          <optgroup label="Popular / Diaspora Hubs">
            {PRIORITY_COUNTRIES.map((c) => (
              <option key={`prio-${c}`} value={c}>
                {c}
              </option>
            ))}
          </optgroup>

          <optgroup label="All Countries Worldwide">
            {allCountries.map((c) => (
              <option key={`all-${c}`} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* City Selection (Dynamic based on selected Country) */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          {cityLabel && (
            <label className={defaultLabelClass}>
              <MapPin className="h-3.5 w-3.5 inline mr-1 text-rose-500" />
              {cityLabel} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {allowCustomCity && selectedCountry && selectedCountry !== 'ALL' && (
            <button
              type="button"
              onClick={() => {
                const nextMode = !isCustomCityMode;
                setIsCustomCityMode(nextMode);
                if (nextMode) {
                  setCustomCityInput('');
                  onCityChange('');
                } else if (availableCities.length > 0) {
                  onCityChange(availableCities[0]);
                }
              }}
              className="text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
            >
              <Edit3 className="h-2.5 w-2.5" />
              {isCustomCityMode ? 'Choose from list' : 'Other City'}
            </button>
          )}
        </div>

        {/* If Custom City mode is active */}
        {isCustomCityMode ? (
          <div className="relative">
            <input
              type="text"
              value={customCityInput}
              onChange={handleCustomCityChange}
              placeholder={`Enter specific city in ${selectedCountry || 'country'}`}
              required={required}
              disabled={disabled}
              className={`${defaultSelectClass} ${cityClassName}`}
            />
          </div>
        ) : (
          <select
            value={selectedCity}
            onChange={handleCitySelectChange}
            disabled={disabled || (!selectedCountry && !includeAllOption)}
            required={required}
            className={`${defaultSelectClass} ${cityClassName}`}
          >
            {includeAllOption && <option value="ALL">{allCityLabel}</option>}
            {!includeAllOption && !selectedCity && (
              <option value="" disabled>
                {selectedCountry && selectedCountry !== 'ALL'
                  ? `Select city in ${selectedCountry}...`
                  : 'Select a country first...'}
              </option>
            )}

            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}

            {allowCustomCity && selectedCountry && selectedCountry !== 'ALL' && (
              <option value="__CUSTOM__">✍️ Other / Custom City...</option>
            )}
          </select>
        )}
      </div>
    </div>
  );
}
