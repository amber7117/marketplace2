'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/currencies';
import Image from 'next/image';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const { items, removeItem, updateQuantity, getTotal, currency } = useCartStore();

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <ShoppingCart className="h-24 w-24 text-muted-foreground" />
          <h2 className="text-2xl font-bold">{t('emptyCart')}</h2>
          <p className="text-muted-foreground">{t('emptyCartDescription')}</p>
          <Link href="/products">
            <Button size="lg">{tCommon('continueShopping')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemName = (item as { name?: string }).name ?? 'Product';
            const rawId =
              (item as { id?: string | number }).id ??
              (item as { productId?: string | number }).productId;

            if (rawId == null) {
              return null;
            }

            const itemId = String(rawId);

            return (
              <Card key={itemId}>
                <CardContent className="flex gap-4 p-4">
                  <Image
                    src={item.image}
                    alt={itemName}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{itemName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price, currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(itemId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <p className="font-bold">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">{t('orderSummary')}</h2>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tax')}</span>
                  <span>{formatCurrency(0, currency)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>{t('total')}</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  {t('proceedToCheckout')}
                </Button>
              </Link>

              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  {tCommon('continueShopping')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
