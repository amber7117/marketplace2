/**
 * Currency API Client
 * Handles currency conversion and exchange rate operations
 */

import type { Currency } from '@/types';

// API base URL - adjust based on your deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface ExchangeRateResponse {
  rate: number;
  lastUpdate: string;
}

interface ConvertResponse {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  convertedAmount: number;
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/currency/rate?from=${fromCurrency}&to=${toCurrency}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get exchange rate: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback to default rates if API fails
    return getDefaultExchangeRate(fromCurrency, toCurrency);
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/currency/convert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          fromCurrency,
          toCurrency,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to convert currency: ${response.statusText}`);
    }

    const data: ConvertResponse = await response.json();
    return data.convertedAmount;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Fallback to default conversion if API fails
    const rate = getDefaultExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }
}

/**
 * Get all available exchange rates
 */
export async function getAllExchangeRates(): Promise<Record<Currency, number>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/currency/rates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get exchange rates: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return default rates if API fails
    return getDefaultExchangeRates();
  }
}

/**
 * Default exchange rates (fallback when API is unavailable)
 */
function getDefaultExchangeRates(): Record<Currency, number> {
  return {
    USD: 1.0,
    MYR: 4.72,
    THB: 35.80,
    VND: 24500,
    PHP: 56.50,
    SGD: 1.35,
    IDR: 15600,
    CNY: 7.25,
    JPY: 150,
    KRW: 1330,
    INR: 83,
    AED: 3.67,
    SAR: 3.75,
    EUR: 0.92,
    GBP: 0.79,
    RUB: 92,
    AUD: 1.52,
  };
}

/**
 * Get default exchange rate between two currencies
 */
function getDefaultExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  const rates = getDefaultExchangeRates();
  
  if (fromCurrency === toCurrency) return 1.0;
  
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    return 1.0;
  }

  // Convert through USD as base
  return rates[toCurrency] / rates[fromCurrency];
}

/**
 * Format currency with proper symbol and conversion
 */
export function formatCurrencyWithConversion(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rate?: number
): string {
  if (fromCurrency === toCurrency) {
    return formatCurrency(amount, toCurrency);
  }

  const convertedAmount = rate ? amount * rate : amount;
  return formatCurrency(convertedAmount, toCurrency);
}

/**
 * Format currency amount with symbol
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
 * Get currency symbol
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
