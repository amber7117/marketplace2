/**
 * Backward Compatibility Layer for Locale Settings
 * Maintains compatibility with existing code while using the new internationalization system
 */

import { useInternationalization, useInternationalizationActions } from './useInternationalization';
import type { Locale, Currency, Region } from '@/types';

/**
 * Legacy locale settings store (compatibility layer)
 * @deprecated Use useInternationalization instead
 */
export const useLocaleSettings = () => {
  const { 
    locale, 
    currency, 
    region 
  } = useInternationalization();
  
  const { 
    setLocale, 
    setCurrency, 
    setRegion
  } = useInternationalizationActions();

  // Legacy setRegionAndCurrency function for backward compatibility
  const legacySetRegionAndCurrency = (newRegion: Region) => {
    setRegion(newRegion);
    // Note: Currency is automatically set based on region in the new system
  };

  return {
    // State
    locale,
    currency,
    region,
    
    // Actions
    setLocale,
    setCurrency,
    setRegion,
    setRegionAndCurrency: legacySetRegionAndCurrency,
    
    // Additional legacy compatibility
    getCurrencyByRegion: (region: Region) => {
      // This would typically come from region-detection utilities
      // For now, return the current currency
      return currency;
    }
  };
};

// Re-export the new store for migration
export { useInternationalization, useInternationalizationActions };

// Export convenience hooks for migration
export const useLocale = () => useInternationalization((state) => state.locale);
export const useCurrency = () => useInternationalization((state) => state.currency);
export const useRegion = () => useInternationalization((state) => state.region);
