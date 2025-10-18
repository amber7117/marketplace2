import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  // This is a workaround until `getRequestConfig` supports cookies and headers
  const cookieStore = cookies();
  const headerStore = headers();
  
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 
                headerStore.get('accept-language')?.split(',')[0]?.split('-')[0] || 
                'en';

  const currency = cookieStore.get('currency')?.value || 'MYR';

  return {
    locale: ['en', 'zh'].includes(locale) ? locale : 'en',
    messages: (await import(`./messages/${locale}.json`)).default,
    now: new Date(),
    timeZone: 'Asia/Kuala_Lumpur'
  };
});
