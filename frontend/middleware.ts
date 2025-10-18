import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'zh'];
const DEFAULT_LOCALE = 'en';
const SUPPORTED_CURRENCIES = ['MYR', 'USD', 'SGD'];
const DEFAULT_CURRENCY = 'MYR';

const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // First, handle the locale with next-intl
  const response = intlMiddleware(request);

  // Handle currency detection and setting
  const { pathname } = request.nextUrl;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api/') || pathname.includes('.')) {
    return response;
  }

  // Get currency from cookie or detect from Accept-Language/Geo
  let currency = request.cookies.get('currency')?.value;
  
  if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
    // Detect currency based on locale or geo (simplified)
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 
                   request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
    
    if (locale === 'zh') {
      currency = 'SGD'; // Default to SGD for Chinese
    } else {
      currency = DEFAULT_CURRENCY;
    }
    
    // Set currency cookie
    response.cookies.set('currency', currency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'
  ]
};
