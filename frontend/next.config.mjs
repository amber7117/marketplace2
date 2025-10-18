import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: [ 'localhost' ],
        unoptimized: process.env.NODE_ENV === 'development',
    },
    env: {
        DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'MYR',
        SUPPORTED_CURRENCIES: process.env.SUPPORTED_CURRENCIES || 'MYR,USD,SGD',
        DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en',
        SUPPORTED_LOCALES: process.env.SUPPORTED_LOCALES || 'en,zh',
        RATES_PROVIDER: process.env.RATES_PROVIDER || 'static',
    },
};

export default withNextIntl( nextConfig );
