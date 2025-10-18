import { Currency } from '@/lib/types';

// Static exchange rates (MYR as base currency)
const EXCHANGE_RATES: Record<Currency, number> = {
  MYR: 1,
  USD: 0.21, // 1 MYR = 0.21 USD
  SGD: 0.29, // 1 MYR = 0.29 SGD
};

export class RatesProvider {
  private static instance: RatesProvider;
  private rates = EXCHANGE_RATES;
  private lastUpdated = Date.now();
  private cacheDuration = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): RatesProvider {
    if (!RatesProvider.instance) {
      RatesProvider.instance = new RatesProvider();
    }
    return RatesProvider.instance;
  }

  async getRates(): Promise<Record<Currency, number>> {
    // Check if cache is expired
    if (Date.now() - this.lastUpdated > this.cacheDuration) {
      await this.refreshRates();
    }
    return this.rates;
  }

  async convertAmount(amount: number, from: Currency, to: Currency): Promise<number> {
    const rates = await this.getRates();
    
    if (from === to) return amount;
    
    // Convert from source currency to MYR (base), then to target currency
    const amountInMYR = amount / rates[from];
    const convertedAmount = amountInMYR * rates[to];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  async formatAmount(amount: number, currency: Currency): Promise<string> {
    const rates = await this.getRates();
    const convertedAmount = await this.convertAmount(amount, 'MYR', currency);
    
    return new Intl.NumberFormat(this.getLocaleForCurrency(currency), {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  }

  private getLocaleForCurrency(currency: Currency): string {
    const localeMap: Record<Currency, string> = {
      MYR: 'ms-MY',
      USD: 'en-US',
      SGD: 'en-SG',
    };
    return localeMap[currency];
  }

  private async refreshRates(): Promise<void> {
    // In a real application, this would fetch from an API
    // For now, we'll just update the timestamp
    this.lastUpdated = Date.now();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // For testing purposes
  setRates(newRates: Record<Currency, number>): void {
    this.rates = { ...newRates };
    this.lastUpdated = Date.now();
  }

  // Get supported currencies
  getSupportedCurrencies(): Currency[] {
    return Object.keys(this.rates) as Currency[];
  }
}

// Singleton instance
export const ratesProvider = RatesProvider.getInstance();
