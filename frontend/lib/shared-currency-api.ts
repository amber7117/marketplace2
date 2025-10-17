/**
 * Shared Currency API Integration
 * Connects to the shared services exchange rate system
 */

import type { Currency } from '@/types';

// Shared services API base URL
const SHARED_API_BASE_URL = process.env.NEXT_PUBLIC_SHARED_API_URL || 'http://localhost:8787';

interface ExchangeRateResponse {
  rates: Record<Currency, number>;
  lastUpdate: string;
}

interface ConvertResponse {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  convertedAmount: number;
  lastUpdate: string;
}

/**
 * Get all exchange rates from shared services
 */
export async function getAllExchangeRates(): Promise<Record<Currency, number>> {
  try {
    const response = await fetch(`${SHARED_API_BASE_URL}/api/currency/rates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get exchange rates: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates from shared services:', error);
    // Return default rates if shared service is unavailable
    return getDefaultExchangeRates();
  }
}

/**
 * Convert currency using shared services
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  try {
    const response = await fetch(`${SHARED_API_BASE_URL}/api/currency/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to convert currency: ${response.statusText}`);
    }

    const data: ConvertResponse = await response.json();
    return data.convertedAmount;
  } catch (error) {
    console.error('Error converting currency with shared services:', error);
    // Fallback to local calculation
    const rates = await getAllExchangeRates();
    const rate = rates[toCurrency] / rates[fromCurrency];
    return amount * rate;
  }
}

/**
 * Get exchange rate between two currencies from shared services
 */
export async function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  try {
    const response = await fetch(
      `${SHARED_API_BASE_URL}/api/currency/rate?from=${fromCurrency}&to=${toCurrency}`,
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

    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Error fetching exchange rate from shared services:', error);
    // Fallback to local calculation
    const rates = await getAllExchangeRates();
    return rates[toCurrency] / rates[fromCurrency];
  }
}

/**
 * Default exchange rates (fallback when shared services are unavailable)
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
 * Check if shared services are available
 */
export async function checkSharedServicesAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${SHARED_API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Shared services are not available:', error);
    return false;
  }
}

/**
 * Refresh exchange rates in shared services
 */
export async function refreshExchangeRates(): Promise<boolean> {
  try {
    const response = await fetch(`${SHARED_API_BASE_URL}/api/currency/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh exchange rates: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error refreshing exchange rates:', error);
    return false;
  }
}
