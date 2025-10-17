// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const SUPPORTED_LOCALES = ['en', 'zh', 'th', 'vi', 'ms', 'de', 'es', 'fr', 'nl', 'pt', 'ru'] as const;
const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number] = 'en';

const resolveLocale = (locale?: string) =>
  SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])
    ? (locale as (typeof SUPPORTED_LOCALES)[number])
    : DEFAULT_LOCALE;

export default getRequestConfig(async ({ requestLocale }: { requestLocale: Promise<string | undefined> }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
