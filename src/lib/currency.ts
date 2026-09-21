/**
 * Comprehensive Country-to-Currency Mapping and Location-Based Pricing Engine
 * Handles accurate mathematical localization of income, connection packages, and financial ledgers
 * based on candidate's country of residence or selected viewing country.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  /** Exchange rate relative to 1 PKR: Amount in Foreign Currency = Amount in PKR * rateFromPKR */
  rateFromPKR: number;
  /** Exchange rate relative to 1 Foreign Currency: Amount in PKR = Amount in Foreign Currency * rateToPKR */
  rateToPKR: number;
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Pakistan (Domestic Reference Currency)
  pakistan: { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', rateFromPKR: 1, rateToPKR: 1 },
  pk: { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', rateFromPKR: 1, rateToPKR: 1 },

  // United States (1 USD = 278 PKR)
  'united states': { code: 'USD', symbol: '$', name: 'US Dollar', rateFromPKR: 1 / 278, rateToPKR: 278 },
  usa: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromPKR: 1 / 278, rateToPKR: 278 },
  us: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromPKR: 1 / 278, rateToPKR: 278 },
  america: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromPKR: 1 / 278, rateToPKR: 278 },

  // United Kingdom (1 GBP = 358 PKR)
  'united kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', rateFromPKR: 1 / 358, rateToPKR: 358 },
  uk: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromPKR: 1 / 358, rateToPKR: 358 },
  england: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromPKR: 1 / 358, rateToPKR: 358 },
  scotland: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromPKR: 1 / 358, rateToPKR: 358 },
  wales: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromPKR: 1 / 358, rateToPKR: 358 },

  // European Union (1 EUR = 302 PKR)
  germany: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  france: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  italy: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  spain: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  netherlands: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  belgium: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  ireland: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  europe: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },
  eu: { code: 'EUR', symbol: '€', name: 'Euro', rateFromPKR: 1 / 302, rateToPKR: 302 },

  // United Arab Emirates (1 AED = 75.8 PKR)
  'united arab emirates': { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromPKR: 1 / 75.8, rateToPKR: 75.8 },
  uae: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromPKR: 1 / 75.8, rateToPKR: 75.8 },
  dubai: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromPKR: 1 / 75.8, rateToPKR: 75.8 },
  'abu dhabi': { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateFromPKR: 1 / 75.8, rateToPKR: 75.8 },

  // Saudi Arabia (1 SAR = 74.1 PKR)
  'saudi arabia': { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateFromPKR: 1 / 74.1, rateToPKR: 74.1 },
  ksa: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateFromPKR: 1 / 74.1, rateToPKR: 74.1 },
  saudi: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateFromPKR: 1 / 74.1, rateToPKR: 74.1 },

  // Canada (1 CAD = 204 PKR)
  canada: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromPKR: 1 / 204, rateToPKR: 204 },
  ca: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromPKR: 1 / 204, rateToPKR: 204 },

  // Australia (1 AUD = 182 PKR)
  australia: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateFromPKR: 1 / 182, rateToPKR: 182 },
  aus: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateFromPKR: 1 / 182, rateToPKR: 182 },

  // Qatar (1 QAR = 76.3 PKR)
  qatar: { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', rateFromPKR: 1 / 76.3, rateToPKR: 76.3 },

  // Kuwait (1 KWD = 905 PKR)
  kuwait: { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', rateFromPKR: 1 / 905, rateToPKR: 905 },

  // Oman (1 OMR = 722 PKR)
  oman: { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', rateFromPKR: 1 / 722, rateToPKR: 722 },

  // Bahrain (1 BHD = 737 PKR)
  bahrain: { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', rateFromPKR: 1 / 737, rateToPKR: 737 },
};

/**
 * Resolve currency configuration based on country name or code
 */
export function getCurrencyForCountry(country?: string): CurrencyConfig {
  if (!country) {
    return COUNTRY_CURRENCY_MAP.pakistan;
  }

  const normalized = country.trim().toLowerCase();

  if (COUNTRY_CURRENCY_MAP[normalized]) {
    return COUNTRY_CURRENCY_MAP[normalized];
  }

  for (const [key, config] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (normalized.includes(key)) {
      return config;
    }
  }

  return COUNTRY_CURRENCY_MAP.pakistan;
}

/**
 * High-precision currency converter from PKR into any foreign country currency
 */
export function convertPKRToCountryCurrency(
  amountInPKR: number,
  targetCountry?: string,
  options?: { round?: boolean }
): { amount: number; formatted: string; symbol: string; code: string } {
  const config = getCurrencyForCountry(targetCountry);

  if (config.code === 'PKR') {
    return {
      amount: amountInPKR,
      formatted: `Rs. ${amountInPKR.toLocaleString()}`,
      symbol: 'Rs.',
      code: 'PKR',
    };
  }

  const converted = amountInPKR * config.rateFromPKR;
  const shouldRound = options?.round !== false;
  const finalAmount = shouldRound ? Math.round(converted) : Math.round(converted * 100) / 100;

  return {
    amount: finalAmount,
    formatted: `${config.symbol}${finalAmount.toLocaleString()}`,
    symbol: config.symbol,
    code: config.code,
  };
}

/**
 * Format a given amount in PKR into localized currency string
 */
export function formatCurrencyByCountry(
  amountInPKR: number,
  country?: string,
  options?: { round?: boolean; showCode?: boolean }
): string {
  const res = convertPKRToCountryCurrency(amountInPKR, country, options);
  if (options?.showCode && res.code !== 'PKR') {
    return `${res.code} ${res.formatted}`;
  }
  return res.formatted;
}

/**
 * Primary Connection Packages & Additional Packs Base Prices (PKR)
 * Section 2:
 * Basic: Rs. 2,000 (30 Connections)
 * Premium: Rs. 5,000 (100 Connections)
 * VIP Royal: Rs. 10,000 (300 Connections)
 */
export const DEFAULT_PACKAGE_BASE_PRICES: Record<string, { price: number; connections: number; name: string }> = {
  BASIC: { price: 2000, connections: 30, name: 'Basic Package' },
  PREMIUM: { price: 5000, connections: 100, name: 'Premium Package' },
  VIP: { price: 10000, connections: 300, name: 'VIP Royal Package' },
  PREMIUM_PLUS: { price: 10000, connections: 300, name: 'VIP Royal Package' },
  // Extra Connection Packs (Section 38)
  PACK_10: { price: 800, connections: 10, name: '10 Extra Connections' },
  PACK_30: { price: 2000, connections: 30, name: '30 Extra Connections' },
  PACK_50: { price: 3200, connections: 50, name: '50 Extra Connections' },
  PACK_100: { price: 5500, connections: 100, name: '100 Extra Connections' },
};

/**
 * Subscription package price calculation based on country and optional custom PKR base
 */
export function getPackagePriceForCountry(
  planSlug: string,
  country?: string,
  customBasePKR?: number
): {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  billingPeriod: string;
  connections: number;
  rawPKR: number;
} {
  const config = getCurrencyForCountry(country);
  const rawKey = (planSlug || '').toUpperCase();
  const pkgMeta = DEFAULT_PACKAGE_BASE_PRICES[rawKey] || {
    price: rawKey.includes('VIP') ? 10000 : rawKey.includes('PREMIUM') ? 5000 : 2000,
    connections: rawKey.includes('VIP') ? 300 : rawKey.includes('PREMIUM') ? 100 : 30,
    name: 'Connection Package',
  };

  const pkrPrice = customBasePKR !== undefined ? customBasePKR : pkgMeta.price;

  if (pkrPrice === 0) {
    return {
      amount: 0,
      currency: config.code,
      symbol: config.symbol,
      formatted: 'Free Connections',
      billingPeriod: 'Free Starter Quota',
      connections: pkgMeta.connections,
      rawPKR: 0,
    };
  }

  if (config.code === 'PKR') {
    return {
      amount: pkrPrice,
      currency: 'PKR',
      symbol: 'Rs.',
      formatted: `Rs. ${pkrPrice.toLocaleString()}`,
      billingPeriod: `${pkgMeta.connections} Connections Included`,
      connections: pkgMeta.connections,
      rawPKR: pkrPrice,
    };
  }

  const convertedAmount = Math.round(pkrPrice * config.rateFromPKR);

  return {
    amount: convertedAmount,
    currency: config.code,
    symbol: config.symbol,
    formatted: `${config.symbol}${convertedAmount.toLocaleString()}`,
    billingPeriod: `${pkgMeta.connections} Connections Included`,
    connections: pkgMeta.connections,
    rawPKR: pkrPrice,
  };
}

/**
 * Calculates exact annual discount percentage and monthly equivalent
 */
export function calculateAnnualPricing(monthlyPKR: number, yearlyPKR: number) {
  if (monthlyPKR <= 0 || yearlyPKR <= 0) {
    return { discountPercent: 0, monthlyEquivalentPKR: 0, totalAnnualPKR: 0 };
  }

  const standardYearly = monthlyPKR * 12;
  const discountPercent = Math.max(0, Math.round(((standardYearly - yearlyPKR) / standardYearly) * 100));
  const monthlyEquivalentPKR = Math.round(yearlyPKR / 12);

  return {
    discountPercent,
    monthlyEquivalentPKR,
    totalAnnualPKR: yearlyPKR,
  };
}

/**
 * Format candidate income numbers and ranges according to candidate/viewer country
 */
export function formatIncomeByCountry(incomeText?: string, country?: string): string {
  if (!incomeText || incomeText.trim() === '' || incomeText === 'Open' || incomeText === 'Confidential') {
    return incomeText || 'Confidential';
  }

  const config = getCurrencyForCountry(country);

  if (config.code === 'PKR') {
    return incomeText;
  }

  if (incomeText.includes('PKR') || incomeText.includes('Rs.')) {
    const numbers = incomeText.match(/\d+[\d,]*/g);
    if (numbers && numbers.length > 0) {
      let localized = incomeText;
      for (const numStr of numbers) {
        const cleanNum = Number(numStr.replace(/,/g, ''));
        if (!isNaN(cleanNum) && cleanNum > 0) {
          const converted = Math.round(cleanNum * config.rateFromPKR);
          localized = localized.replace(numStr, converted.toLocaleString());
        }
      }
      return localized.replace(/PKR|Rs\./g, config.symbol).trim();
    }
  }

  return incomeText;
}
