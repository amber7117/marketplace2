import type { Region, Currency } from '@/types';

export interface RegionInfo {
  code: Region;
  name: string;
  currency: Currency;
  locale: string;
  flag: string;
}

export const REGIONS: Record<Region, RegionInfo> = {
    US: {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        locale: 'en',
        flag: '🇺🇸',
    },
    MY: {
        code: 'MY',
        name: 'Malaysia',
        currency: 'MYR',
        locale: 'ms',
        flag: '🇲🇾',
    },
    TH: {
        code: 'TH',
        name: 'Thailand',
        currency: 'THB',
        locale: 'th',
        flag: '🇹🇭',
    },
    VN: {
        code: 'VN',
        name: 'Vietnam',
        currency: 'VND',
        locale: 'vi',
        flag: '🇻🇳',
    },
    PH: {
        code: 'PH',
        name: 'Philippines',
        currency: 'PHP',
        locale: 'en',
        flag: '🇵🇭',
    },
    SG: {
        code: 'SG',
        name: 'Singapore',
        currency: 'SGD',
        locale: 'en',
        flag: '🇸🇬',
    },
    ID: {
        code: 'ID',
        name: 'Indonesia',
        currency: 'IDR',
        locale: 'id',
        flag: '🇮🇩',
    },
    CN: {
        code: 'CN',
        name: 'China',
        currency: 'CNY',
        locale: 'zh',
        flag: '🇨🇳',
    },
    JP: {
        code: 'JP',
        name: 'Japan',
        currency: 'JPY',
        locale: 'ja',
        flag: '🇯🇵',
    },
    KR: {
        code: 'KR',
        name: 'South Korea',
        currency: 'KRW',
        locale: 'ko',
        flag: '🇰🇷',
    },
    IN: {
        code: 'IN',
        name: 'India',
        currency: 'INR',
        locale: 'hi',
        flag: '🇮🇳',
    },
    AE: {
        code: 'AE',
        name: 'United Arab Emirates',
        currency: 'AED',
        locale: 'ar',
        flag: '🇦🇪',
    },
    SA: {
        code: 'SA',
        name: 'Saudi Arabia',
        currency: 'SAR',
        locale: 'ar',
        flag: '🇸🇦',
    },
    EU: {
        code: 'EU',
        name: 'European Union',
        currency: 'EUR',
        locale: 'en',
        flag: '🇪🇺',
    },
    UK: {
        code: 'UK',
        name: 'United Kingdom',
        currency: 'GBP',
        locale: 'en',
        flag: '🇬🇧',
    },
    RU: {
        code: 'RU',
        name: 'Russia',
        currency: 'RUB',
        locale: 'ru',
        flag: '🇷🇺',
    },
    AU: {
        code: 'AU',
        name: 'Australia',
        currency: 'AUD',
        locale: 'en',
        flag: '🇦🇺',
    },
    GLOBAL: {
        code: 'GLOBAL',
        name: 'Global Market',
        currency: 'USD',
        locale: 'en',
        flag: '🌐',
    }
};

/**
 * Get region info by code
 */
export function getRegionInfo(region: Region): RegionInfo {
  return REGIONS[region];
}

/**
 * Get currency by region
 */
export function getCurrencyByRegion(region: Region): Currency {
  return REGIONS[region].currency;
}

/**
 * Get region by currency
 */
export function getRegionByCurrency(currency: Currency): Region | undefined {
  return Object.values(REGIONS).find(region => region.currency === currency)?.code;
}

/**
 * Get all available regions
 */
export function getAvailableRegions(): RegionInfo[] {
  return Object.values(REGIONS);
}

/**
 * Get regions by locale
 */
export function getRegionsByLocale(locale: string): RegionInfo[] {
  return Object.values(REGIONS).filter(region => region.locale === locale);
}

/**
 * Get default region for locale
 */
export function getDefaultRegionForLocale(locale: string): Region | undefined {
  const regions = getRegionsByLocale(locale);
  return regions.length > 0 ? regions[0].code : undefined;
}

/**
 * Get region flag emoji
 */
export function getRegionFlag(region: Region): string {
  return REGIONS[region].flag;
}

/**
 * Get region name
 */
export function getRegionName(region: Region): string {
  return REGIONS[region].name;
}

/**
 * Get region locale
 */
export function getRegionLocale(region: Region): string {
  return REGIONS[region].locale;
}
