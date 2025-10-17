import type { Currency } from '@/types';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        decimals: 2,
    },
    MYR: {
        code: 'MYR',
        symbol: 'RM',
        name: 'Malaysian Ringgit',
        decimals: 2,
    },
    THB: {
        code: 'THB',
        symbol: '฿',
        name: 'Thai Baht',
        decimals: 2,
    },
    VND: {
        code: 'VND',
        symbol: '₫',
        name: 'Vietnamese Dong',
        decimals: 0,
    },
    PHP: {
        code: 'PHP',
        symbol: '₱',
        name: 'Philippine Peso',
        decimals: 2,
    },
    SGD: {
        code: 'SGD',
        symbol: 'S$',
        name: 'Singapore Dollar',
        decimals: 2,
    },
    IDR: {
        code: 'IDR',
        symbol: 'Rp',
        name: 'Indonesian Rupiah',
        decimals: 0,
    },
    CNY: {
        code: 'CNY',
        symbol: '¥',
        name: 'Chinese Yuan',
        decimals: 2,
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        decimals: 2,
    },
    JPY: {
        code: 'JPY',
        symbol: '¥',
        name: 'Japanese Yen',
        decimals: 0,
    },
    KRW: {
        code: 'KRW',
        symbol: '₩',
        name: 'South Korean Won',
        decimals: 0,
    },
    INR: {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        decimals: 2,
    },
    SAR: {
        code: 'SAR',
        symbol: '﷼',
        name: 'Saudi Riyal',
        decimals: 2,
    },
    AED: {
        code: 'AED',
        symbol: 'د.إ',
        name: 'UAE Dirham',
        decimals: 2,
    },
    RUB: {
        code: 'RUB',
        symbol: '₽',
        name: 'Russian Ruble',
        decimals: 2,
    },
    GBP: {
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        decimals: 2,
    },
    AUD: {
        code: 'AUD',
        symbol: 'A$',
        name: 'Australian Dollar',
        decimals: 2,
    }
};

// Mock exchange rates (should be fetched from API in production)
export const EXCHANGE_RATES: Record<Currency, number> = {
    USD: 1,
    MYR: 4.7,
    THB: 35.5,
    VND: 24000,
    PHP: 56.5,
    SGD: 1.35,
    IDR: 15600,
    CNY: 7.2,
    EUR: 0.92,
    JPY: 150,
    KRW: 1300,
    INR: 83,
    SAR: 3.75,
    AED: 3.67,
    RUB: 90,
    GBP: 0.79,
    AUD: 1.52
};

/**
 * Convert amount between currencies using exchange rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  return usdAmount * EXCHANGE_RATES[toCurrency];
}

/**
 * Format converted currency with proper symbol and decimals
 */
export function formatConvertedCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): string {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(convertedAmount, toCurrency);
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: Currency): CurrencyInfo {
  return CURRENCIES[currency];
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES);
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return 1;
  return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: Currency): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Extract symbol from formatted string
  const parts = formatter.formatToParts(0);
  const symbolPart = parts.find(part => part.type === 'currency');
  return symbolPart?.value || currency;
}
