/**
 * Locale Settings Hook
 * 读取/变更 localeSettings，并派发 locale:changed 事件
 */

import { useState, useEffect, useCallback } from 'react';
import type { Locale, Currency, Region } from '@/types';

export interface LocaleSettings {
  locale: Locale;
  currency: Currency;
  region: Region;
}

// Default settings
const DEFAULT_SETTINGS: LocaleSettings = {
  locale: 'en',
  currency: 'USD',
  region: 'US',
};

// Event name for locale changes
export const LOCALE_CHANGED_EVENT = 'locale:changed';

/**
 * Hook for managing locale settings with event dispatching
 * 管理区域设置并派发事件的 Hook
 */
export function useLocaleSettings() {
  const [settings, setSettings] = useState<LocaleSettings>(DEFAULT_SETTINGS);

  // Initialize from localStorage or cookies on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Try localStorage first (CSR)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('locale-settings');
          if (stored) {
            const parsed = JSON.parse(stored);
            setSettings(parsed);
            return;
          }
        }

        // Fallback to cookies (SSR compatible)
        const cookieSettings = getSettingsFromCookies();
        if (cookieSettings) {
          setSettings(cookieSettings);
        }
      } catch (error) {
        console.warn('Failed to load locale settings:', error);
      }
    };

    loadSettings();

    // Listen for locale change events from other components
    const handleLocaleChanged = (event: CustomEvent<LocaleSettings>) => {
      setSettings(event.detail);
    };

    window.addEventListener(LOCALE_CHANGED_EVENT as any, handleLocaleChanged as EventListener);

    return () => {
      window.removeEventListener(LOCALE_CHANGED_EVENT as any, handleLocaleChanged as EventListener);
    };
  }, []);

  // Save settings and dispatch event
  const updateSettings = useCallback((newSettings: Partial<LocaleSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage (CSR)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('locale-settings', JSON.stringify(updated));
        } catch (error) {
          console.warn('Failed to save locale settings to localStorage:', error);
        }
      }

      // Save to cookies (SSR compatible)
      setSettingsToCookies(updated);

      // Dispatch change event
      window.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: updated }));

      return updated;
    });
  }, []);

  // Individual setters
  const setLocale = useCallback((locale: Locale) => {
    updateSettings({ locale });
  }, [updateSettings]);

  const setCurrency = useCallback((currency: Currency) => {
    updateSettings({ currency });
  }, [updateSettings]);

  const setRegion = useCallback((region: Region) => {
    updateSettings({ region });
  }, [updateSettings]);

  // Get currency by region (from regions.ts)
  const getCurrencyByRegion = useCallback((region: Region): Currency => {
    // This would typically come from regions.ts utilities
    // For now, return the current currency or default based on region
    return settings.currency;
  }, [settings.currency]);

  return {
    // State
    locale: settings.locale,
    currency: settings.currency,
    region: settings.region,
    
    // Actions
    setLocale,
    setCurrency,
    setRegion,
    setRegionAndCurrency: (region: Region) => {
      // When region changes, optionally update currency based on region
      const currency = getCurrencyByRegion(region);
      updateSettings({ region, currency });
    },
    
    // Utilities
    getCurrencyByRegion,
  };
}

/**
 * Get locale settings from cookies (SSR compatible)
 * 从 cookies 获取区域设置（SSR 兼容）
 */
function getSettingsFromCookies(): LocaleSettings | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  try {
    const locale = cookies.locale as Locale;
    const currency = cookies.currency as Currency;
    const region = cookies.region as Region;

    if (locale && currency && region) {
      return { locale, currency, region };
    }
  } catch (error) {
    console.warn('Failed to parse locale settings from cookies:', error);
  }

  return null;
}

/**
 * Set locale settings to cookies (SSR compatible)
 * 设置区域设置到 cookies（SSR 兼容）
 */
function setSettingsToCookies(settings: LocaleSettings): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry

  document.cookie = `locale=${settings.locale}; expires=${expires.toUTCString()}; path=/`;
  document.cookie = `currency=${settings.currency}; expires=${expires.toUTCString()}; path=/`;
  document.cookie = `region=${settings.region}; expires=${expires.toUTCString()}; path=/`;
}

/**
 * Hook to listen for locale changes
 * 监听区域设置变化的 Hook
 */
export function useLocaleChangeListener(callback: (settings: LocaleSettings) => void) {
  useEffect(() => {
    const handleLocaleChanged = (event: CustomEvent<LocaleSettings>) => {
      callback(event.detail);
    };

    window.addEventListener(LOCALE_CHANGED_EVENT as any, handleLocaleChanged as EventListener);

    return () => {
      window.removeEventListener(LOCALE_CHANGED_EVENT as any, handleLocaleChanged as EventListener);
    };
  }, [callback]);
}
