'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, DollarSign, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/currencies';
import { orderAPI, paymentAPI } from '@/lib/api';

// Type definitions
interface CartItem {
  id?: string;
  productId?: string;
  name?: string;
  title?: string;
  productName?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderData {
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

type PaymentRequestPayload = Parameters<typeof paymentAPI.initiate>[0];

interface FormData {
  email: string;
  phone: string;
  notes: string;
}

type PaymentMethod = 'card' | 'wallet' | 'crypto';

/**
 * Checkout page for placing an order and initiating payment
 * Works with Zustand store + API layer + next-intl
 */
export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const { items, getTotal, currency, clearCart } = useCartStore((state) => ({
    items: state.items,
    getTotal: state.getTotal,
    currency: state.currency,
    clearCart: state.clearCart,
  }));

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    notes: '',
  });

  const total = getTotal();
  const tax = 0; // Digital products no tax
  const finalTotal = total + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !items || items.length === 0) return;
    
    setLoading(true);

    try {
      // Step 1: Create order
      const orderData: OrderData = {
        items: items.map((item: CartItem) => {
          const productId = item.productId ?? item.id;
          if (!productId) {
            throw new Error('Cart item missing product identifier');
          }

          return {
            productId,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        totalAmount: finalTotal,
        currency,
        contactEmail: formData.email.trim(),
        contactPhone: formData.phone.trim(),
        notes: formData.notes.trim(),
      };

      const orderResponse = await orderAPI.createOrder(orderData);
      const createdOrder = orderResponse?.data?.data;

      const orderPayload =
        createdOrder as Partial<Record<'id' | '_id', string>> | undefined;
      const orderId = orderPayload?.id ?? orderPayload?._id;

      if (!orderId) {
        throw new Error('Invalid order response: Missing order ID');
      }

      // Step 2: Initiate payment
      const paymentRequest: PaymentRequestPayload = {
        orderId,
        totalAmount: finalTotal,
        currency,
        paymentMethod,
        items: items.map((item: CartItem) => ({
          productId: item.productId ?? item.id ?? '',
          productName: getItemName(item),
          productSlug: item.productId ?? item.id ?? '',
          image: getItemImage(item),
          sku: item.productId ?? item.id ?? '',
          quantity: item.quantity,
          price: item.price,
          currency,
          region: 'US',
        })),
      };

      const paymentResponse = await paymentAPI.initiate(paymentRequest);
      const redirectUrl = paymentResponse?.data?.paymentUrl;

      // Step 3: Clear cart
      clearCart();

      // Step 4: Redirect
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        router.push(`/orders/${orderId}?success=true`);
      }
    } catch (err: unknown) {
      console.error('Checkout failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(t('checkoutFailed') || `Checkout failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: CartItem): string => {
    return (
      item?.name ||
      item?.title ||
      item?.productName ||
      tCommon('unknownProduct') ||
      'Product'
    );
  };

  const getItemImage = (item: CartItem): string => {
    return item.image || '/images/placeholder-product.png';
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-2xl font-bold">{t('emptyCart')}</h2>
          <p className="text-muted-foreground">{t('emptyCartDescription')}</p>
          <Link href="/products">
            <Button size="lg">{tCommon('continueShopping')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      key: 'card' as PaymentMethod,
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      label: t('creditCard'),
      desc: t('creditCardDescription'),
    },
    {
      key: 'wallet' as PaymentMethod,
      icon: <Wallet className="h-6 w-6 text-primary" />,
      label: t('wallet'),
      desc: t('walletDescription'),
    },
    {
      key: 'crypto' as PaymentMethod,
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      label: t('cryptocurrency'),
      desc: t('cryptocurrencyDescription'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Section: Form */}
          <div className="lg:col-div-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('email')} <div className="text-destructive">*</div>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('emailDescription')}
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    {t('phone')}
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+60 12-345 6789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    {t('notes')}
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder={t('notesPlaceholder')}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>{t('paymentMethod')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map(({ key, icon, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                      paymentMethod === key
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setPaymentMethod(key)}
                  >
                    {icon}
                    <div className="flex-1">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    {paymentMethod === key && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Section: Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item: CartItem, index) => {
                    const name = getItemName(item);
                    const imgSrc = getItemImage(item);
                    const itemKey = item.id ?? item.productId ?? `item-${index}`;

                    return (
                      <div key={itemKey} className="flex gap-3">
                        <Image
                          src={imgSrc}
                          alt={name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded object-cover bg-muted"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('qty')}: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(item.price * item.quantity, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">{t('subtotal')}</div>
                    <div>{formatCurrency(total, currency)}</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">{t('tax')}</div>
                    <div>{formatCurrency(tax, currency)}</div>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <div>{t('total')}</div>
                    <div>{formatCurrency(finalTotal, currency)}</div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? tCommon('processing') : t('placeOrder')}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t('secureCheckout')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
