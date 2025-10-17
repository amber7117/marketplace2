'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Globe2, MapPin, ShieldCheck, Sparkles, Truck, Warehouse } from 'lucide-react';

import { productAPI } from '@/lib/api';
import type { Currency, Denomination, Product, Region } from '@/types';
import { Gallery } from '@/components/product/Gallery';
import { DenominationPills } from '@/components/product/DenominationPills';
import { PriceBlock } from '@/components/product/PriceBlock';
import { BuyActions } from '@/components/product/BuyActions';
import { TrustBadges } from '@/components/product/TrustBadges';
import { Tabs } from '@/components/product/Tabs';

function resolveLocalizedField(
  field: string | Record<string, string> | undefined,
  locale: string
): string | null {
  if (!field) return null;

  if (typeof field === 'string') {
    return field.trim() || null;
  }

  const localized = field[locale as keyof typeof field];
  if (localized && localized.trim()) {
    return localized.trim();
  }

  if (field.en && field.en.trim()) {
    return field.en.trim();
  }

  const firstValue = Object.values(field).find((value) => value && value.trim());
  return firstValue ? firstValue.trim() : null;
}

type ProductDenominationOption = Denomination & {
  stock: number;
  isInstantDelivery: boolean;
  displayName: string;
};

interface MetaCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'success' | 'warning';
}

function MetaCard({ icon: Icon, label, value, helper, tone = 'default' }: MetaCardProps) {
  const toneStyles: Record<NonNullable<MetaCardProps['tone']>, string> = {
    default: 'border-slate-100 bg-slate-50 text-slate-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-100 bg-amber-50 text-amber-700',
  };

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${toneStyles[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md shadow-black/5">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
      {helper ? <p className="text-sm leading-relaxed opacity-80">{helper}</p> : null}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('product');
  const commonT = useTranslations('common');

  const slug = params.slug as string;
  const locale = params.locale as string;
  const regionFromQuery = searchParams.get('region');
  const normalizedRegionFromQuery = regionFromQuery
    ? (regionFromQuery.toUpperCase() as Region)
    : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDenomination, setSelectedDenomination] =
    useState<ProductDenominationOption | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await productAPI.getProduct(slug);

        if (!isMounted) return;

        if (response.data?.success && response.data.data) {
          const productData = response.data.data;
          const normalizedPricing = (productData.regionalPricing || [])
            .map((rp: Product['regionalPricing'][number]) => ({
              ...rp,
              isAvailable: Boolean(rp.isAvailable),
              isInstantDelivery: Boolean(rp.isInstantDelivery),
              stock: Number(rp.stock ?? 0),
              price: Number(rp.price ?? productData.pricing ?? 0),
              discountPrice:
                rp.discountPrice !== undefined && rp.discountPrice !== null
                  ? Number(rp.discountPrice)
                  : undefined,
              currency: (rp.currency ?? 'USD') as Currency,
              displayOrder:
                rp.displayOrder !== undefined && rp.displayOrder !== null
                  ? Number(rp.displayOrder)
                  : undefined,
            }))
            .sort((a, b) => {
              const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
              const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

              if (orderA !== orderB) {
                return orderA - orderB;
              }

              const priceA = a.discountPrice ?? a.price;
              const priceB = b.discountPrice ?? b.price;
              return priceA - priceB;
            });

          setProduct({
            ...productData,
            regionalPricing: normalizedPricing,
          });
        } else {
          setProduct(null);
          setErrorMessage(t('productNotFound'));
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        if (!isMounted) return;
        setProduct(null);
        setErrorMessage(t('productNotFound'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, t]);

  const availableRegions = useMemo<Region[]>(() => {
    if (!product?.regionalPricing?.length) return [];

    return product.regionalPricing
      .filter((rp) => Boolean(rp.isAvailable) && Number(rp.stock ?? 0) > 0)
      .map((rp) => rp.region as Region);
  }, [product]);

  const denominationOptions = useMemo<ProductDenominationOption[]>(() => {
    if (!product?.regionalPricing?.length) return [];

    return product.regionalPricing.map((rp, index) => {
      const basePrice = Number(rp.price ?? product.pricing ?? 0);
      const discount =
        rp.discountPrice !== undefined && rp.discountPrice !== null
          ? Number(rp.discountPrice)
          : undefined;
      const stock = Number(rp.stock ?? 0);
      const currency = (rp.currency ?? 'USD') as Currency;

      return {
        id: rp._id ?? `${rp.region}-${index}`,
        value: basePrice,
        currency,
        isAvailable: Boolean(rp.isAvailable) && stock > 0,
        discountPrice: discount,
        originalPrice: discount ? basePrice : undefined,
        region: (rp.region as Region) ?? 'GLOBAL',
        stock,
        isInstantDelivery: Boolean(rp.isInstantDelivery),
        displayName: rp.denomination ?? `${discount ?? basePrice} ${currency}`,
      } satisfies ProductDenominationOption;
    });
  }, [product]);

  useEffect(() => {
    if (!denominationOptions.length) {
      setSelectedDenomination(null);
      return;
    }

    const preferredRegion =
      normalizedRegionFromQuery &&
      denominationOptions.some((option) => option.region === normalizedRegionFromQuery)
        ? normalizedRegionFromQuery
        : undefined;

    const nextSelection = preferredRegion
      ? denominationOptions.find(
          (option) => option.region === preferredRegion && option.isAvailable
        ) || denominationOptions.find((option) => option.region === preferredRegion)
      : denominationOptions.find((option) => option.isAvailable) || denominationOptions[0];

    setSelectedDenomination((current) => {
      if (current?.id === nextSelection?.id) {
        return current;
      }
      return nextSelection ?? null;
    });
  }, [denominationOptions, normalizedRegionFromQuery]);

  const currentRegion = useMemo<Region | undefined>(() => {
    if (selectedDenomination?.region) {
      return selectedDenomination.region;
    }

    if (
      normalizedRegionFromQuery &&
      availableRegions.includes(normalizedRegionFromQuery)
    ) {
      return normalizedRegionFromQuery;
    }

    return availableRegions[0];
  }, [availableRegions, normalizedRegionFromQuery, selectedDenomination]);

  const activeDenomination = useMemo(() => {
    if (selectedDenomination) {
      return selectedDenomination;
    }

    if (!currentRegion) return null;

    return (
      denominationOptions.find((option) => option.region === currentRegion) ?? null
    );
  }, [currentRegion, denominationOptions, selectedDenomination]);

  const currency: Currency = useMemo(() => {
    if (activeDenomination?.currency) {
      return activeDenomination.currency;
    }

    if (currentRegion && product?.regionalPricing) {
      const regionPrice = product.regionalPricing.find(
        (rp) => rp.region === currentRegion
      );
      if (regionPrice?.currency) {
        return regionPrice.currency as Currency;
      }
    }

    if (product?.regionalPricing?.[0]?.currency) {
      return product.regionalPricing[0].currency as Currency;
    }

    return 'USD';
  }, [activeDenomination, currentRegion, product]);

  const price = activeDenomination
    ? activeDenomination.discountPrice ?? activeDenomination.value
    : product?.pricing ?? 0;

  const originalPrice = activeDenomination?.discountPrice
    ? activeDenomination.value
    : undefined;

  const isInStock = Boolean(activeDenomination?.isAvailable);
  const stock = activeDenomination?.stock ?? 0;

  const stockValueLabel = isInStock
    ? new Intl.NumberFormat(locale).format(stock)
    : t('notAvailable');

  const stockHelperText = isInStock
    ? stock > 0 && stock <= 10
      ? t('onlyLeft', { count: stock })
      : t('inStock')
    : t('currentlyUnavailable');

  const productName = useMemo(() => {
    return (
      resolveLocalizedField(product?.name as Product['name'], locale) ||
      product?.slug ||
      'Product'
    );
  }, [locale, product]);

  const productDescription = useMemo(() => {
    return resolveLocalizedField(product?.description as Product['description'], locale);
  }, [locale, product]);

  const regionStats = useMemo(
    () => {
      if (!product?.regionalPricing?.length) return [] as Array<{
        region: Region;
        stock: number;
        currency: Currency;
        isAvailable: boolean;
      }>;

      const map = new Map<Region, { stock: number; currency: Currency; isAvailable: boolean }>();

      product.regionalPricing.forEach((rp) => {
        const regionKey = (rp.region as Region) ?? 'GLOBAL';
        const currencyValue = (rp.currency ?? 'USD') as Currency;
        const stockValue = Number(rp.stock ?? 0);
        const isAvailableValue = Boolean(rp.isAvailable) && stockValue > 0;

        const currentValue = map.get(regionKey);

        if (currentValue) {
          map.set(regionKey, {
            stock: currentValue.stock + stockValue,
            currency: currencyValue,
            isAvailable: currentValue.isAvailable || isAvailableValue,
          });
        } else {
          map.set(regionKey, {
            stock: stockValue,
            currency: currencyValue,
            isAvailable: isAvailableValue,
          });
        }
      });

      return Array.from(map.entries()).map(([region, info]) => ({
        region,
        ...info,
      }));
    },
    [product]
  );

  const handleDenominationSelect = useCallback(
    (denomination: Denomination) => {
      const option = denominationOptions.find((item) => item.id === denomination.id);
      if (!option) {
        return;
      }

      setSelectedDenomination(option);

      const params = new URLSearchParams(searchParams.toString());
      params.set('region', option.region);

      const query = params.toString();
      const href = query
        ? `/${locale}/products/${slug}?${query}`
        : `/${locale}/products/${slug}`;

      router.replace(href, { scroll: false });
    },
    [denominationOptions, locale, router, searchParams, slug]
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !activeDenomination) return;

    console.log('Add to cart:', {
      productId: product._id,
      productSlug: product.slug,
      region: activeDenomination.region,
      denomination: activeDenomination.displayName,
      price: activeDenomination.discountPrice ?? activeDenomination.value,
      currency: activeDenomination.currency,
    });
  }, [activeDenomination, product]);

  const handleBuyNow = useCallback(() => {
    if (!product || !activeDenomination) return;

    console.log('Buy now:', {
      productId: product._id,
      productSlug: product.slug,
      region: activeDenomination.region,
      denomination: activeDenomination.displayName,
      price: activeDenomination.discountPrice ?? activeDenomination.value,
      currency: activeDenomination.currency,
    });
  }, [activeDenomination, product]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            {commonT('loadingProductDetails')}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">{t('productNotFound')}</h1>
          {errorMessage ? (
            <p className="mt-3 text-sm text-slate-600">{errorMessage}</p>
          ) : null}
          <button
            onClick={() => router.push(`/${locale}/products`)}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            {commonT('backToProducts')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-blue-100/70 via-white to-white blur-3xl" />

      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="space-y-10">
              <section className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_45px_120px_-70px_rgba(37,99,235,0.55)] backdrop-blur">
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700">
                  <span className="rounded-full bg-blue-100/70 px-3 py-1">
                    {t('productDetails')}
                  </span>
                  {product.category ? (
                    <span className="rounded-full border border-blue-200/70 px-3 py-1 text-blue-500">
                      {product.category}
                    </span>
                  ) : null}
                  {currentRegion ? (
                    <span className="rounded-full border border-emerald-200/70 px-3 py-1 text-emerald-600">
                      {currentRegion}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {productName}
                </h1>

                {productDescription ? (
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">
                    {productDescription}
                  </p>
                ) : null}

                {product.tags?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-900/5 px-4 py-1 text-sm font-medium text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl">
                <Gallery
                  images={
                    product.images?.length
                      ? product.images
                      : ['/images/placeholder-card.png']
                  }
                  productName={productName}
                />
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <MetaCard
                  icon={ShieldCheck}
                  label={t('securePayment')}
                  value={t('securePaymentDesc')}
                  helper="3D Secure & SSL encrypted checkout"
                />
                <MetaCard
                  icon={Truck}
                  label={t('instantDelivery')}
                  value={activeDenomination?.isInstantDelivery ? t('instantDeliveryDesc') : commonT('processing')}
                  helper={activeDenomination?.isInstantDelivery ? 'Codes delivered within minutes' : 'Manual review required before delivery'}
                  tone={activeDenomination?.isInstantDelivery ? 'success' : 'warning'}
                />
                <MetaCard
                  icon={Warehouse}
                  label={isInStock ? t('inStock') : t('outOfStock')}
                  value={stockValueLabel}
                  helper={stockHelperText}
                  tone={isInStock ? 'success' : 'warning'}
                />
                <MetaCard
                  icon={Globe2}
                  label={t('availableRegions')}
                  value={`${regionStats.length || 0} ${t('regions')}`}
                  helper={
                    regionStats.length
                      ? regionStats
                          .slice(0, 3)
                          .map((region) => region.region)
                          .join(' • ')
                      : t('notAvailable')
                  }
                />
              </section>

              {regionStats.length ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {t('availableRegions')}
                    </h2>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {regionStats.length}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {regionStats.map((region) => (
                      <div
                        key={region.region}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              region.isAvailable
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{region.region}</p>
                            <p className="text-xs text-slate-500">
                              {region.isAvailable ? t('inStock') : t('outOfStock')} •{' '}
                              {new Intl.NumberFormat(locale).format(region.stock)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold uppercase tracking-widest ${
                            region.isAvailable ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {region.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <PriceBlock
                  price={price}
                  currency={currency}
                  originalPrice={originalPrice}
                  locale={locale}
                />

                {activeDenomination?.displayName ? (
                  <div className="mt-4 rounded-2xl bg-blue-50/80 p-4 text-sm text-blue-700">
                    <p className="font-semibold">{t('selectDenomination')}</p>
                    <p className="mt-1 text-blue-600">{activeDenomination.displayName}</p>
                  </div>
                ) : null}

                {denominationOptions.length ? (
                  <div className="mt-8">
                    <DenominationPills
                      denominations={denominationOptions}
                      selectedDenomination={activeDenomination}
                      onSelect={handleDenominationSelect}
                      locale={locale}
                    />
                  </div>
                ) : null}

                <BuyActions
                  price={price}
                  currency={currency}
                  isInStock={isInStock}
                  maxQuantity={isInStock ? Math.max(1, Math.min(stock, 10)) : 0}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  className="mt-10"
                />

                <div className="mt-8 space-y-4">
                  <TrustBadges />
                  <ul className="grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    <li className="flex items-center gap-3">
                      <BadgeCheck className="h-5 w-5 text-blue-600" />
                      {t('securePaymentDesc')}
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      {t('instantDelivery')}
                    </li>
                    <li className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      24/7 multilingual support
                    </li>
                  </ul>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900">How to redeem</h2>
                <ol className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-blue-600 text-center text-xs font-bold leading-6 text-white">
                      1
                    </span>
                    <span>Complete your purchase and receive the digital code in your inbox.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-blue-600 text-center text-xs font-bold leading-6 text-white">
                      2
                    </span>
                    <span>Visit the official redemption page for your region and log in to your game account.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-blue-600 text-center text-xs font-bold leading-6 text-white">
                      3
                    </span>
                    <span>Enter the code to instantly credit the balance to your account.</span>
                  </li>
                </ol>
                <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-xs text-slate-500">
                  Keep your code safe. Once redeemed, codes cannot be refunded or reused.
                </p>
              </section>
            </aside>
          </div>

          <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <Tabs product={product} locale={locale} />
          </section>
        </div>
      </main>
    </div>
  );
}
