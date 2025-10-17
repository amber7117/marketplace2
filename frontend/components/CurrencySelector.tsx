'use client';

import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/store';
import { CURRENCIES } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencyApi';
import { useRouter } from 'next/navigation';

type CurrencyCode = keyof typeof CURRENCIES;

export function CurrencySelector() {
  const { currency, setCurrency } = useCartStore();
  const router = useRouter();

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    // Force a re-render of the page to update prices with new currency
    router.refresh();
  };

  const currencyEntries = Object.entries(CURRENCIES) as Array<[CurrencyCode, (typeof CURRENCIES)[CurrencyCode]]>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <div className="hidden sm:inline">
            {currency} ({getCurrencySymbol(currency)})
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencyEntries.map(([code, curr]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleCurrencyChange(code)}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="mr-2 font-medium">{getCurrencySymbol(code)}</div>
              <div>
                <span className="font-medium">{code}</span>
                <span className="text-xs text-muted-foreground ml-1">- {curr.name}</span>
              </div>
            </div>
            {code === currency && (
              <div className="text-xs text-green-600 font-medium">当前</div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
