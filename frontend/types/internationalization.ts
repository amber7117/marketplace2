/**
 * Enhanced Internationalization Types
 * Decoupled Language → Region → Currency system
 */

import type { Locale, Currency, Region } from './index';

// ==================== CORE TYPES ====================

/**
 * Language-Region mapping for automatic region detection
 */
export type LanguageRegionMapping = Partial<Record<Locale, Region>>;

/**
 * Region-Currency mapping for default currency suggestions
 */
export type RegionCurrencyMapping = Partial<Record<Region, Currency>>;

/**
 * Complete internationalization settings
 */
export interface InternationalizationSettings {
  locale: Locale;
  currency: Currency;
  region: Region;
  exchangeRates: Record<Currency, number>;
  lastExchangeUpdate: string;
}

/**
 * Exchange rate API response
 */
export interface ExchangeRateResponse {
  base: Currency;
  rates: Record<Currency, number>;
  lastUpdate: string;
}

/**
 * Currency conversion request
 */
export interface CurrencyConversionRequest {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

/**
 * Currency conversion response
 */
export interface CurrencyConversionResponse {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  convertedAmount: number;
  lastUpdate: string;
}

// ==================== DETECTION TYPES ====================

/**
 * Device/browser detection result
 */
export interface DeviceDetectionResult {
  locale: Locale;
  region: Region;
  timezone: string;
  currency?: Currency;
}

/**
 * Region detection strategy
 */
export type RegionDetectionStrategy = 
  | 'device'        // Use device/browser detection
  | 'ip'            // Use IP geolocation
  | 'param'         // Use URL parameters
  | 'manual';       // Manual selection

// ==================== STORE TYPES ====================

/**
 * Internationalization store state
 */
export interface InternationalizationState {
  // Core settings
  locale: Locale;
  currency: Currency;
  region: Region;
  
  // Exchange rates
  exchangeRates: Record<Currency, number>;
  lastExchangeUpdate: string;
  
  // Detection settings
  detectionStrategy: RegionDetectionStrategy;
  autoDetectRegion: boolean;
  
  // Actions
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  setRegion: (region: Region) => void;
  setDetectionStrategy: (strategy: RegionDetectionStrategy) => void;
  setAutoDetectRegion: (autoDetect: boolean) => void;
  updateExchangeRates: () => Promise<void>;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  formatAmount: (amount: number, currency: Currency, showConverted?: boolean) => string;
  
  // Additional helper actions
  detectAndSetRegion: () => Promise<void>;
  initialize: (initialLocale?: Locale, initialRegion?: Region, initialCurrency?: Currency) => Promise<void>;
  switchLanguage: (newLocale: Locale, preserveRegion?: boolean, preserveCurrency?: boolean) => Promise<void>;
  getExchangeRate: (fromCurrency: Currency, toCurrency: Currency) => number;
  refreshExchangeRates: () => Promise<boolean>;
}

// ==================== UTILITY TYPES ====================

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showConverted?: boolean;
  decimals?: number;
  locale?: Locale;
}

/**
 * Region detection options
 */
export interface RegionDetectionOptions {
  strategy: RegionDetectionStrategy;
  fallbackRegion?: Region;
  useIPGeolocation?: boolean;
}

/**
 * Language switching options
 */
export interface LanguageSwitchOptions {
  preserveRegion?: boolean;
  preserveCurrency?: boolean;
  updateURL?: boolean;
}
