/**
 * Enhanced Internationalization Store
 * Decoupled Language → Region → Currency system with real-time exchange rates
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, Currency, Region } from '@/types';
import type { InternationalizationState } from '@/types/internationalization';
import { 
  detectDeviceRegion, 
  detectRegion,
  getDefaultCurrencyForRegion,
  getSuggestedCurrency,
  initializeInternationalization 
} from '@/lib/region-detection';
import { formatCurrency } from '@/lib/currencyApi';
import { getAllExchangeRates } from '@/lib/shared-currency-api';

// Default exchange rates (fallback when API is unavailable)
const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  MYR: 4.72,
  THB: 35.80,
  VND: 24500,
  PHP: 56.50,
  SGD: 1.35,
  IDR: 15600,
  CNY: 7.25,
  JPY: 150,
  KRW: 1330,
  INR: 83,
  AED: 3.67,
  SAR: 3.75,
  EUR: 0.92,
  GBP: 0.79,
  RUB: 92,
  AUD: 1.52,
};

export const useInternationalization = create<InternationalizationState>()(
  persist(
    (set, get) => ({
      // Core settings with defaults
      locale: 'en',
      currency: 'USD',
      region: 'US',
      
      // Exchange rates
      exchangeRates: DEFAULT_EXCHANGE_RATES,
      lastExchangeUpdate: new Date().toISOString(),
      
      // Detection settings
      detectionStrategy: 'device',
      autoDetectRegion: true,
      
      // Actions
      setLocale: (locale: Locale) => {
        const state = get();
        
        // If auto-detect is enabled and region is not manually set, suggest region
        let newRegion = state.region;
        let newCurrency = state.currency;
        
        if (state.autoDetectRegion) {
          const deviceDetection = detectDeviceRegion();
          const suggestedRegion = deviceDetection.region;
          
          // Only update region if it's not manually set
          if (suggestedRegion !== state.region) {
            newRegion = suggestedRegion;
            newCurrency = getSuggestedCurrency(newRegion, locale);
          }
        }
        
        set({ 
          locale,
          region: newRegion,
          currency: newCurrency 
        });
      },
      
      setCurrency: (currency: Currency) => {
        set({ currency });
        
        // Optionally refresh exchange rates when currency changes
        const state = get();
        if (state.autoDetectRegion) {
          // Update exchange rates in background
          get().updateExchangeRates();
        }
      },
      
      setRegion: (region: Region) => {
        const state = get();
        const newCurrency = getDefaultCurrencyForRegion(region);
        
        set({ 
          region, 
          currency: newCurrency 
        });
        
        // Update exchange rates when region changes
        if (state.autoDetectRegion) {
          get().updateExchangeRates();
        }
      },
      
      setDetectionStrategy: (strategy) => {
        set({ detectionStrategy: strategy });
        
        // Re-detect region if strategy changes and auto-detect is enabled
        const state = get();
        if (state.autoDetectRegion) {
          get().detectAndSetRegion();
        }
      },
      
      setAutoDetectRegion: (autoDetect) => {
        set({ autoDetectRegion: autoDetect });
        
        // If enabling auto-detect, perform detection
        if (autoDetect) {
          get().detectAndSetRegion();
        }
      },
      
      updateExchangeRates: async () => {
        try {
          const rates = await getAllExchangeRates();
          set({ 
            exchangeRates: rates,
            lastExchangeUpdate: new Date().toISOString()
          });
        } catch (error) {
          console.warn('Failed to update exchange rates, using defaults:', error);
          // Keep existing rates on failure
        }
      },
      
      convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
        const state = get();
        
        if (fromCurrency === toCurrency) {
          return amount;
        }
        
        try {
          // Use store exchange rates first
          const rate = state.exchangeRates[toCurrency] / state.exchangeRates[fromCurrency];
          return amount * rate;
        } catch (error) {
          console.warn('Currency conversion failed, falling back to default rates:', error);
          
          // Final fallback: direct rate calculation
          const defaultRate = DEFAULT_EXCHANGE_RATES[toCurrency] / DEFAULT_EXCHANGE_RATES[fromCurrency];
          return amount * defaultRate;
        }
      },
      
      formatAmount: (amount: number, currency: Currency, showConverted: boolean = false): string => {
        const state = get();
        
        if (!showConverted || currency === state.currency) {
          return formatCurrency(amount, currency);
        }
        
        // Show converted amount with original in parentheses
        const convertedAmount = get().convertAmount(amount, currency, state.currency);
        const originalFormatted = formatCurrency(amount, currency);
        const convertedFormatted = formatCurrency(convertedAmount, state.currency);
        
        return `${convertedFormatted} (${originalFormatted})`;
      },
      
      // Additional helper actions
      detectAndSetRegion: async () => {
        const state = get();
        if (!state.autoDetectRegion) return;
        
        try {
          const detectedRegion = await detectRegion(state.detectionStrategy, state.region);
          const suggestedCurrency = getSuggestedCurrency(detectedRegion, state.locale);
          
          set({
            region: detectedRegion,
            currency: suggestedCurrency
          });
        } catch (error) {
          console.warn('Region detection failed:', error);
        }
      },
      
      initialize: async (initialLocale?: Locale, initialRegion?: Region, initialCurrency?: Currency) => {
        const state = get();
        
        try {
          const settings = await initializeInternationalization(
            initialLocale,
            initialRegion,
            initialCurrency,
            state.detectionStrategy
          );
          
          set({
            locale: settings.locale,
            region: settings.region,
            currency: settings.currency
          });
          
          // Update exchange rates in background
          get().updateExchangeRates();
        } catch (error) {
          console.warn('Internationalization initialization failed:', error);
        }
      },
      
      switchLanguage: async (newLocale: Locale, preserveRegion: boolean = true, preserveCurrency: boolean = false) => {
        const state = get();
        
        const newRegion = preserveRegion ? state.region : undefined;
        const newCurrency = preserveCurrency ? state.currency : undefined;
        
        await get().initialize(newLocale, newRegion, newCurrency);
      },
      
      getExchangeRate: (fromCurrency: Currency, toCurrency: Currency): number => {
        const state = get();
        
        if (fromCurrency === toCurrency) return 1;
        
        try {
          return state.exchangeRates[toCurrency] / state.exchangeRates[fromCurrency];
        } catch (error) {
          console.warn('Exchange rate calculation failed:', error);
          return DEFAULT_EXCHANGE_RATES[toCurrency] / DEFAULT_EXCHANGE_RATES[fromCurrency];
        }
      },
      
      refreshExchangeRates: async (): Promise<boolean> => {
        try {
          await get().updateExchangeRates();
          return true;
        } catch (error) {
          console.error('Failed to refresh exchange rates:', error);
          return false;
        }
      }
    }),
    {
      name: 'internationalization-settings',
      // Only persist core settings, not exchange rates (they should be fresh)
      partialize: (state) => ({
        locale: state.locale,
        currency: state.currency,
        region: state.region,
        detectionStrategy: state.detectionStrategy,
        autoDetectRegion: state.autoDetectRegion,
      }),
    }
  )
);

// Export convenience hooks
export const useLocale = () => useInternationalization((state) => state.locale);
export const useCurrency = () => useInternationalization((state) => state.currency);
export const useRegion = () => useInternationalization((state) => state.region);
export const useExchangeRates = () => useInternationalization((state) => state.exchangeRates);

// Export actions
export const useInternationalizationActions = () => useInternationalization((state) => ({
  setLocale: state.setLocale,
  setCurrency: state.setCurrency,
  setRegion: state.setRegion,
  setDetectionStrategy: state.setDetectionStrategy,
  setAutoDetectRegion: state.setAutoDetectRegion,
  updateExchangeRates: state.updateExchangeRates,
  convertAmount: state.convertAmount,
  formatAmount: state.formatAmount,
  detectAndSetRegion: state.detectAndSetRegion,
  initialize: state.initialize,
  switchLanguage: state.switchLanguage,
  getExchangeRate: state.getExchangeRate,
  refreshExchangeRates: state.refreshExchangeRates,
}));
