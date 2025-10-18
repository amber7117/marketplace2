import { Product, Offer, Currency } from '@/lib/types';
import { ratesProvider } from './rates/provider';

export class PricingService {
  static async getProductPriceRange(product: Product, currency: Currency): Promise<{ min: number; max: number }> {
    const prices = await Promise.all(
      product.offers.map(offer => this.convertOfferPrice(offer, currency))
    );
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  static async convertOfferPrice(offer: Offer, toCurrency: Currency): Promise<number> {
    return ratesProvider.convertAmount(offer.price, 'MYR', toCurrency);
  }

  static async formatPrice(amount: number, currency: Currency): Promise<string> {
    return ratesProvider.formatAmount(amount, currency);
  }

  static async calculateCartTotals(
    items: Array<{ offer: Offer; quantity: number }>,
    currency: Currency,
    taxRate: number = 0.06 // 6% default tax
  ): Promise<{
    subtotal: number;
    tax: number;
    total: number;
  }> {
    let subtotal = 0;

    for (const item of items) {
      const price = await this.convertOfferPrice(item.offer, currency);
      subtotal += price * item.quantity;
    }

    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  static async getLowestPrice(product: Product, currency: Currency): Promise<number> {
    const prices = await Promise.all(
      product.offers.map(offer => this.convertOfferPrice(offer, currency))
    );
    return Math.min(...prices);
  }

  static async getHighestPrice(product: Product, currency: Currency): Promise<number> {
    const prices = await Promise.all(
      product.offers.map(offer => this.convertOfferPrice(offer, currency))
    );
    return Math.max(...prices);
  }

  static calculateDiscount(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  static async formatPriceRange(product: Product, currency: Currency): Promise<string> {
    const range = await this.getProductPriceRange(product, currency);
    
    if (range.min === range.max) {
      return await this.formatPrice(range.min, currency);
    }
    
    const minFormatted = await this.formatPrice(range.min, currency);
    const maxFormatted = await this.formatPrice(range.max, currency);
    
    return `${minFormatted} - ${maxFormatted}`;
  }

  // For product cards and lists
  static async getDisplayPrice(product: Product, currency: Currency): Promise<{
    price: string;
    originalPrice?: string;
    discount?: number;
  }> {
    const lowestPrice = await this.getLowestPrice(product, currency);
    const lowestOffer = product.offers.reduce((lowest, offer) => 
      offer.price < lowest.price ? offer : lowest
    );

    const result: {
      price: string;
      originalPrice?: string;
      discount?: number;
    } = {
      price: await this.formatPrice(lowestPrice, currency),
    };

    if (lowestOffer.originalPrice && lowestOffer.originalPrice > lowestOffer.price) {
      const originalPriceConverted = await this.convertOfferPrice(
        { ...lowestOffer, price: lowestOffer.originalPrice },
        currency
      );
      result.originalPrice = await this.formatPrice(originalPriceConverted, currency);
      result.discount = this.calculateDiscount(lowestOffer.originalPrice, lowestOffer.price);
    }

    return result;
  }
}

// Helper function for client components
export const formatCurrency = (amount: number, currency: Currency): string => {
  const localeMap: Record<Currency, string> = {
    MYR: 'ms-MY',
    USD: 'en-US',
    SGD: 'en-SG',
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Price component helper for consistent formatting
export const Price = {
  format: formatCurrency,
  
  async fromMYR(amount: number, toCurrency: Currency): Promise<string> {
    const converted = await ratesProvider.convertAmount(amount, 'MYR', toCurrency);
    return formatCurrency(converted, toCurrency);
  },
  
  async range(min: number, max: number, currency: Currency): Promise<string> {
    const minFormatted = await Price.fromMYR(min, currency);
    const maxFormatted = await Price.fromMYR(max, currency);
    
    if (min === max) return minFormatted;
    return `${minFormatted} - ${maxFormatted}`;
  },
};
