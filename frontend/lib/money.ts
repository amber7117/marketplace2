/**
 * Money utilities for currency formatting and conversion
 * 货币工具：格式化、转换、符号获取
 */

import type { Currency } from '@/types';
import { getExchangeRate } from './exchange';

/**
 * Get currency symbol for display
 * 获取货币符号
 */
export function currencySymbolOf(currency: Currency): string {
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

/**
 * Format price with proper symbol and formatting
 * 格式化价格，包含货币符号和格式
 */
export function formatPrice(amount: number, currency: Currency, locale: string = 'en'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Convert price between currencies using exchange rates
 * 使用汇率转换货币
 */
export async function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const rate = await getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    throw new Error(`Failed to convert ${fromCurrency} to ${toCurrency}`);
  }
}

/**
 * Format converted price with original price in parentheses
 * 格式化转换后的价格，包含原价括号显示
 */
export async function formatConvertedPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  locale: string = 'en'
): Promise<string> {
  if (fromCurrency === toCurrency) {
    return formatPrice(amount, toCurrency, locale);
  }

  try {
    const convertedAmount = await convertPrice(amount, fromCurrency, toCurrency);
    const convertedFormatted = formatPrice(convertedAmount, toCurrency, locale);
    const originalFormatted = formatPrice(amount, fromCurrency, locale);
    
    return `${convertedFormatted} (${originalFormatted})`;
  } catch (error) {
    console.error('Failed to format converted price:', error);
    return formatPrice(amount, fromCurrency, locale);
  }
}

/**
 * Get currency info with symbol and formatting options
 * 获取货币信息，包含符号和格式化选项
 */
export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showConverted?: boolean;
  locale?: string;
  decimals?: number;
}

export function getCurrencyInfo(currency: Currency, options: CurrencyFormatOptions = {}) {
  const {
    showSymbol = true,
    showConverted = false,
    locale = 'en',
    decimals = 2
  } = options;

  return {
    symbol: currencySymbolOf(currency),
    format: (amount: number) => {
      const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency : undefined,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return formatter.format(amount);
    },
    showConverted,
    locale,
    decimals
  };
}
