'use client';

import { useEffect, useState } from 'react';
import { Currency } from '@/lib/types';
import { PricingService } from '@/lib/pricing';

interface PriceProps {
  amount: number;
  currency?: Currency;
  className?: string;
  showCurrency?: boolean;
}

export default function Price({ 
  amount, 
  currency, 
  className = '', 
  showCurrency = true 
}: PriceProps) {
  const [formattedPrice, setFormattedPrice] = useState<string>('');
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currency || 'MYR');

  useEffect(() => {
    const getCurrency = () => {
      if (currency) return currency;
      
      const cookieCurrency = document.cookie
        .split('; ')
        .find(row => row.startsWith('currency='))
        ?.split('=')[1] as Currency || 'MYR';
      
      return cookieCurrency;
    };

    const formatPrice = async () => {
      const curr = getCurrency();
      setCurrentCurrency(curr);
      const formatted = await PricingService.formatPrice(amount, curr);
      setFormattedPrice(formatted);
    };

    formatPrice();
  }, [amount, currency]);

  if (!formattedPrice) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {showCurrency ? formattedPrice : formattedPrice.replace(/[A-Z$€£¥]+\s?/g, '')}
    </span>
  );
}
