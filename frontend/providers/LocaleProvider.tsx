'use client';

/**
 * Locale Provider
 * 提供区域设置上下文和事件监听
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocaleSettings, useLocaleChangeListener, type LocaleSettings } from '@/hooks/useLocaleSettings';
import { preloadCommonRates } from '@/lib/exchange';

// Context for locale settings
interface LocaleContextType {
  locale: string;
  currency: string;
  region: string;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  setRegion: (region: string) => void;
  setRegionAndCurrency: (region: string) => void;
  getCurrencyByRegion: (region: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

/**
 * Locale Provider Component
 * 区域设置提供者组件
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const localeSettings = useLocaleSettings();

  // Preload exchange rates when currency changes
  useEffect(() => {
    preloadCommonRates(localeSettings.currency as any).catch(error => {
      console.warn('Failed to preload exchange rates:', error);
    });
  }, [localeSettings.currency]);

  // Listen for locale changes and update document attributes
  useLocaleChangeListener((settings: LocaleSettings) => {
    // Update HTML lang attribute
    document.documentElement.lang = settings.locale;
    
    // Update data attributes for CSS/styling
    document.documentElement.setAttribute('data-locale', settings.locale);
    document.documentElement.setAttribute('data-currency', settings.currency);
    document.documentElement.setAttribute('data-region', settings.region);
  });

  const contextValue = useMemo(() => ({
    locale: localeSettings.locale,
    currency: localeSettings.currency,
    region: localeSettings.region,
    setLocale: (locale: string) => localeSettings.setLocale(locale as any),
    setCurrency: (currency: string) => localeSettings.setCurrency(currency as any),
    setRegion: (region: string) => localeSettings.setRegion(region as any),
    setRegionAndCurrency: (region: string) => localeSettings.setRegionAndCurrency(region as any),
    getCurrencyByRegion: (region: string) => localeSettings.getCurrencyByRegion(region as any),
  }), [localeSettings]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to use locale context
 * 使用区域设置上下文的 Hook
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * Hook to get current locale
 * 获取当前语言的 Hook
 */
export function useCurrentLocale() {
  const { locale } = useLocale();
  return locale;
}

/**
 * Hook to get current currency
 * 获取当前货币的 Hook
 */
export function useCurrentCurrency() {
  const { currency } = useLocale();
  return currency;
}

/**
 * Hook to get current region
 * 获取当前区域的 Hook
 */
export function useCurrentRegion() {
  const { region } = useLocale();
  return region;
}

/**
 * Hook to change locale with side effects
 * 切换语言并处理副作用的 Hook
 */
export function useChangeLocale() {
  const { setLocale, locale } = useLocale();
  
  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    
    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent('language:changed', {
      detail: { from: locale, to: newLocale }
    }));
  };
  
  return changeLocale;
}

/**
 * Hook to change currency with side effects
 * 切换货币并处理副作用的 Hook
 */
export function useChangeCurrency() {
  const { setCurrency, currency } = useLocale();
  
  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    
    // Clear exchange rate cache when currency changes
    import('@/lib/exchange').then(({ clearExchangeRateCache }) => {
      clearExchangeRateCache();
    }).catch(console.error);
    
    // Dispatch custom event for price components to update
    window.dispatchEvent(new CustomEvent('currency:changed', {
      detail: { from: currency, to: newCurrency }
    }));
  };
  
  return changeCurrency;
}

/**
 * Hook to listen for currency changes
 * 监听货币变化的 Hook
 */
export function useCurrencyChangeListener(callback: (event: CustomEvent<{ from: string; to: string }>) => void) {
  useEffect(() => {
    const handleCurrencyChanged = (event: Event) => {
      callback(event as CustomEvent<{ from: string; to: string }>);
    };

    window.addEventListener('currency:changed', handleCurrencyChanged);

    return () => {
      window.removeEventListener('currency:changed', handleCurrencyChanged);
    };
  }, [callback]);
}

/**
 * Hook to listen for language changes
 * 监听语言变化的 Hook
 */
export function useLanguageChangeListener(callback: (event: CustomEvent<{ from: string; to: string }>) => void) {
  useEffect(() => {
    const handleLanguageChanged = (event: Event) => {
      callback(event as CustomEvent<{ from: string; to: string }>);
    };

    window.addEventListener('language:changed', handleLanguageChanged);

    return () => {
      window.removeEventListener('language:changed', handleLanguageChanged);
    };
  }, [callback]);
}
