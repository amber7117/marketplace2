/**
 * Region Detection Utilities
 * Handles automatic region detection from device, IP, or parameters
 */

import type { Locale, Region, Currency } from '@/types';
import type { 
  DeviceDetectionResult,
  RegionDetectionStrategy,
  LanguageRegionMapping,
  RegionCurrencyMapping 
} from '@/types/internationalization';

// ==================== MAPPING CONFIGURATIONS ====================

/**
 * Language to Region mapping for automatic detection
 */
export const LANGUAGE_REGION_MAPPING: Record<string, Region> = {
  // English variants
  'en': 'US',    // US English
  'en-US': 'US',
  'en-GB': 'UK',
  'en-AU': 'AU',
  'en-CA': 'US', // Default to US for Canada English
  
  // Asian languages
  'zh': 'CN',    // Chinese
  'zh-CN': 'CN',
  'zh-TW': 'CN', // Default to mainland China
  'zh-HK': 'CN',
  'th': 'TH',    // Thai
  'vi': 'VN',    // Vietnamese
  'ms': 'MY',    // Malay
  'id': 'ID',    // Indonesian
  'ja': 'JP',    // Japanese
  'ko': 'KR',    // Korean
  'hi': 'IN',    // Hindi
  
  // European languages
  'fr': 'EU',    // French
  'de': 'EU',    // German
  'es': 'EU',    // Spanish
  'it': 'EU',    // Italian
  'nl': 'EU',    // Dutch
  'pt': 'EU',    // Portuguese
  'ru': 'RU',    // Russian
  'ro': 'EU',    // Romanian
  
  // Middle Eastern languages
  'ar': 'AE',    // Arabic
  'tl': 'PH',    // Tagalog (Philippines)
};

/**
 * Region to Currency mapping for default suggestions
 */
export const REGION_CURRENCY_MAPPING: RegionCurrencyMapping = {
  'US': 'USD',
  'MY': 'MYR',
  'TH': 'THB',
  'VN': 'VND',
  'PH': 'PHP',
  'SG': 'SGD',
  'ID': 'IDR',
  'CN': 'CNY',
  'JP': 'JPY',
  'KR': 'KRW',
  'IN': 'INR',
  'AE': 'AED',
  'SA': 'SAR',
  'EU': 'EUR',
  'UK': 'GBP',
  'RU': 'RUB',
  'AU': 'AUD',
  'GLOBAL': 'USD',
};

// ==================== DETECTION UTILITIES ====================

/**
 * Detect device/browser locale and region
 */
export function detectDeviceRegion(): DeviceDetectionResult {
  if (typeof window === 'undefined') {
    return {
      locale: 'en' as Locale,
      region: 'US' as Region,
      timezone: 'UTC',
    };
  }

  const navigator = window.navigator;
  const locale = (navigator.language || 'en') as Locale;
  
  // Extract base locale (e.g., 'en-US' -> 'en')
  const baseLocale = locale.split('-')[0] as Locale;
  
  // Detect region from locale
  const region = detectRegionFromLocale(locale);
  
  // Get timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Suggest currency based on region
  const currency = REGION_CURRENCY_MAPPING[region];
  
  return {
    locale: baseLocale,
    region,
    timezone,
    currency,
  };
}

/**
 * Detect region from locale string
 */
export function detectRegionFromLocale(locale: string): Region {
  // Try exact match first
  if (LANGUAGE_REGION_MAPPING[locale as Locale]) {
    return LANGUAGE_REGION_MAPPING[locale as Locale]!;
  }
  
  // Try base locale (e.g., 'en-US' -> 'en')
  const baseLocale = locale.split('-')[0] as Locale;
  if (LANGUAGE_REGION_MAPPING[baseLocale]) {
    return LANGUAGE_REGION_MAPPING[baseLocale]!;
  }
  
  // Fallback to US
  return 'US';
}

/**
 * Detect region from IP address (mock implementation)
 * In production, this would call a geolocation API
 */
export async function detectRegionFromIP(): Promise<Region> {
  try {
    // Mock implementation - in production, call a geolocation API
    // For now, return device-detected region
    const deviceDetection = detectDeviceRegion();
    return deviceDetection.region;
  } catch (error) {
    console.warn('IP-based region detection failed, falling back to device detection');
    const deviceDetection = detectDeviceRegion();
    return deviceDetection.region;
  }
}

/**
 * Detect region from URL parameters
 */
export function detectRegionFromURL(): Region | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const regionParam = urlParams.get('region') as Region | null;
  
  if (regionParam && isValidRegion(regionParam)) {
    return regionParam;
  }
  
  return null;
}

/**
 * Get default currency for a region
 */
export function getDefaultCurrencyForRegion(region: Region): Currency {
  return REGION_CURRENCY_MAPPING[region] || 'USD';
}

/**
 * Check if a region is valid
 */
export function isValidRegion(region: string): region is Region {
  return Object.keys(REGION_CURRENCY_MAPPING).includes(region);
}

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return Object.keys(LANGUAGE_REGION_MAPPING).includes(locale);
}

/**
 * Get all available regions
 */
export function getAvailableRegions(): Region[] {
  return Object.keys(REGION_CURRENCY_MAPPING) as Region[];
}

/**
 * Get regions for a specific locale
 */
export function getRegionsForLocale(locale: Locale): Region[] {
  const regions: Region[] = [];
  
  // Find all regions that map to this locale
  Object.entries(LANGUAGE_REGION_MAPPING).forEach(([loc, reg]) => {
    if (loc === locale || loc.startsWith(locale + '-')) {
      regions.push(reg!);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(regions)];
}

/**
 * Get suggested currency based on region and locale
 */
export function getSuggestedCurrency(region: Region, locale: Locale): Currency {
  // Priority: region-based currency > locale-based suggestion
  const regionCurrency = REGION_CURRENCY_MAPPING[region];
  if (regionCurrency) {
    return regionCurrency;
  }
  
  // Fallback to locale-based region detection
  const localeRegion = detectRegionFromLocale(locale);
  return REGION_CURRENCY_MAPPING[localeRegion] || 'USD';
}

/**
 * Main region detection function
 */
export async function detectRegion(
  strategy: RegionDetectionStrategy = 'device',
  fallbackRegion: Region = 'US'
): Promise<Region> {
  try {
    switch (strategy) {
      case 'device':
        const deviceResult = detectDeviceRegion();
        return deviceResult.region;
        
      case 'ip':
        return await detectRegionFromIP();
        
      case 'param':
        const urlRegion = detectRegionFromURL();
        return urlRegion || fallbackRegion;
        
      case 'manual':
        return fallbackRegion;
        
      default:
        return fallbackRegion;
    }
  } catch (error) {
    console.warn(`Region detection failed with strategy ${strategy}, using fallback:`, error);
    return fallbackRegion;
  }
}

/**
 * Initialize internationalization settings with automatic detection
 */
export async function initializeInternationalization(
  initialLocale?: Locale,
  initialRegion?: Region,
  initialCurrency?: Currency,
  detectionStrategy: RegionDetectionStrategy = 'device'
): Promise<{
  locale: Locale;
  region: Region;
  currency: Currency;
}> {
  // Detect region based on strategy
  const detectedRegion = await detectRegion(detectionStrategy, initialRegion || 'US');
  
  // Use provided locale or detect from device
  const locale = initialLocale || detectDeviceRegion().locale;
  
  // Use provided currency or get default for region
  const currency = initialCurrency || getDefaultCurrencyForRegion(detectedRegion);
  
  return {
    locale,
    region: detectedRegion,
    currency,
  };
}
