import type { Locale } from '@/types';

export const LOCALES: Locale[] = ['en', 'zh', 'th', 'vi', 'ms', 'id', 'fr', 'ar', 'es', 'tl', 'ru', 'pt', 'ro', 'it', 'nl', 'ja', 'hi', 'de', 'ko'];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  ms: 'Bahasa Malaysia',
  id: 'Bahasa Indonesia',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  tl: 'Tagalog',
  ru: 'Русский',
  pt: 'Português',
  ro: 'Română',
  it: 'Italiano',
  nl: 'Nederlands',
  ja: '日本語',
  hi: 'हिन्दी',
  de: 'Deutsch',
  ko: '한국어',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  zh: '🇨🇳',
  th: '🇹🇭',
  vi: '🇻🇳',
  ms: '🇲🇾',
  id: '🇮🇩',
  fr: '🇫🇷',
  ar: '🇸🇦',
  es: '🇪🇸',
  tl: '🇵🇭',
  ru: '🇷🇺',
  pt: '🇵🇹',
  ro: '🇷🇴',
  it: '🇮🇹',
  nl: '🇳🇱',
  ja: '🇯🇵',
  hi: '🇮🇳',
  de: '🇩🇪',
  ko: '🇰🇷',
};

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Get locale display name
 */
export function getLocaleName(locale: Locale): string {
  return LOCALE_NAMES[locale] || LOCALE_NAMES[DEFAULT_LOCALE];
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
  return LOCALE_FLAGS[locale] || LOCALE_FLAGS[DEFAULT_LOCALE];
}

/**
 * Validate locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  const browserLang = navigator.language.split('-')[0];
  return isValidLocale(browserLang) ? browserLang : DEFAULT_LOCALE;
}
