'use client';

import { useState, useEffect } from 'react';
import { Currency } from '@/lib/types';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('MYR');

  useEffect(() => {
    const cookieCurrency = document.cookie
      .split('; ')
      .find(row => row.startsWith('currency='))
      ?.split('=')[1] as Currency;
    
    if (cookieCurrency) {
      setCurrency(cookieCurrency);
    }
  }, []);

  const updateCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    document.cookie = `currency=${newCurrency}; path=/; max-age=31536000`;
  };

  return { currency, setCurrency: updateCurrency };
}
