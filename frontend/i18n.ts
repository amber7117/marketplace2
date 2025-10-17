import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export const locales = ['en', 'zh', 'th', 'vi', 'ms', 'de', 'es', 'fr', 'nl', 'pt', 'ru'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
