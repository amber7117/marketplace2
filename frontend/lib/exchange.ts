/**
 * Exchange rate service with caching and fallback
 * 汇率服务：带缓存和容错
 */

import type { Currency } from '@/types';

// Cache for exchange rates
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default exchange rates (fallback)
const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
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

/**
 * Get exchange rate between two currencies with caching and fallback
 * 获取两种货币之间的汇率，带缓存和容错
 */
export async function getRate(base: Currency, quote: Currency): Promise<number> {
  if (base === quote) return 1;

  const cacheKey = `${base}-${quote}`;
  const cached = exchangeRateCache.get(cacheKey);
  
  // Return cached rate if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rate;
  }

  try {
    // Try to fetch from shared services first
    const rate = await fetchFromSharedServices(base, quote);
    
    // Cache the successful result
    exchangeRateCache.set(cacheKey, {
      rate,
      timestamp: Date.now()
    });
    
    return rate;
  } catch (error) {
    console.warn('Failed to fetch exchange rate from shared services, using default rates:', error);
    
    // Fallback to default rates
    const defaultRate = calculateDefaultRate(base, quote);
    
    // Cache the fallback result with shorter duration
    exchangeRateCache.set(cacheKey, {
      rate: defaultRate,
      timestamp: Date.now() - (CACHE_DURATION - 60000) // Cache for 1 minute only
    });
    
    return defaultRate;
  }
}

/**
 * Fetch exchange rate from shared services
 * 从共享服务获取汇率
 */
async function fetchFromSharedServices(base: Currency, quote: Currency): Promise<number> {
  const SHARED_API_BASE_URL = process.env.NEXT_PUBLIC_SHARED_API_URL || 'http://localhost:8787';
  
  const response = await fetch(
    `${SHARED_API_BASE_URL}/api/currency/rate?from=${base}&to=${quote}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) {
    throw new Error(`Shared services returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (typeof data.rate !== 'number' || data.rate <= 0) {
    throw new Error('Invalid exchange rate received from shared services');
  }

  return data.rate;
}

/**
 * Calculate exchange rate using default rates
 * 使用默认汇率计算
 */
function calculateDefaultRate(base: Currency, quote: Currency): number {
  if (!DEFAULT_EXCHANGE_RATES[base] || !DEFAULT_EXCHANGE_RATES[quote]) {
    throw new Error(`Exchange rate not available for ${base} to ${quote}`);
  }

  return DEFAULT_EXCHANGE_RATES[quote] / DEFAULT_EXCHANGE_RATES[base];
}

/**
 * Clear exchange rate cache
 * 清除汇率缓存
 */
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear();
}

/**
 * Get all available exchange rates
 * 获取所有可用汇率
 */
export async function getAllRates(): Promise<Record<Currency, number>> {
  try {
    const SHARED_API_BASE_URL = process.env.NEXT_PUBLIC_SHARED_API_URL || 'http://localhost:8787';
    const response = await fetch(`${SHARED_API_BASE_URL}/api/currency/rates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Failed to get all rates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rates || DEFAULT_EXCHANGE_RATES;
  } catch (error) {
    console.warn('Failed to fetch all rates, using defaults:', error);
    return DEFAULT_EXCHANGE_RATES;
  }
}

/**
 * Preload exchange rates for common currency pairs
 * 预加载常用货币对的汇率
 */
export async function preloadCommonRates(baseCurrency: Currency = 'USD'): Promise<void> {
  const commonCurrencies: Currency[] = ['EUR', 'GBP', 'JPY', 'CNY', 'MYR', 'THB', 'VND', 'PHP', 'SGD'];
  
  await Promise.allSettled(
    commonCurrencies.map(currency => 
      getRate(baseCurrency, currency).catch(() => undefined)
    )
  );
}

// Export for compatibility
export { getRate as getExchangeRate };
