import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh', 'th', 'vi', 'ms', 'de', 'es', 'fr', 'nl', 'pt', 'ru'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always show locale prefix in URL
  localePrefix: 'always',

  // Redirect to default locale when visiting root
  localeDetection: true
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
