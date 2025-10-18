import Cookies from 'js-cookie';
import type { Locale, Currency } from './schemas';

export const COOKIE_KEYS = {
  CURRENCY: 'currency',
  LOCALE: 'locale',
} as const;

export function getCurrency(): Currency {
  const currency = Cookies.get(COOKIE_KEYS.CURRENCY) as Currency;
  return currency || 'MYR';
}

export function setCurrency(currency: Currency): void {
  Cookies.set(COOKIE_KEYS.CURRENCY, currency, { 
    expires: 365,
    path: '/',
    sameSite: 'lax'
  });
}

export function getLocale(): Locale | null {
  const locale = Cookies.get(COOKIE_KEYS.LOCALE) as Locale;
  return locale || null;
}

export function setLocale(locale: Locale): void {
  Cookies.set(COOKIE_KEYS.LOCALE, locale, {
    expires: 365,
    path: '/',
    sameSite: 'lax'
  });
}
