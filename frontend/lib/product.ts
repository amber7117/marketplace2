// lib/product.ts
import type { Product, Region, Currency, ProductRegionPrice } from '@/types';

/**
 * ✅ 获取产品的本地化名称
 */
export function getProductName(product: Product, locale: string = 'en'): string {
  if (!product?.name) return 'Unknown Product';
  if (typeof product.name === 'string') return product.name;

  const localized = product.name[locale as keyof typeof product.name];
  if (localized) return localized as string;

  if (product.name.en) return product.name.en;

  const firstAvailable = Object.values(product.name)[0];
  return (firstAvailable as string) || 'Unknown Product';
}

/**
 * ✅ 获取产品的本地化描述
 */
export function getProductDescription(product: Product, locale: string = 'en'): string {
  if (!product?.description) return '';
  if (typeof product.description === 'string') return product.description;

  const localized = product.description[locale as keyof typeof product.description];
  if (localized) return localized as string;

  if (product.description.en) return product.description.en;

  const firstAvailable = Object.values(product.description)[0];
  return (firstAvailable as string) || '';
}

/**
 * ✅ 获取产品的主要价格（含回退到 product.pricing）
 */
export function getProductPrice(
  product: Product,
  options?: { region?: Region; currency?: Currency }
): number {
  const region = options?.region;
  const currency = options?.currency;

  if (Array.isArray(product?.regionalPricing) && product.regionalPricing.length > 0) {
    if (region) {
      const regional = product.regionalPricing.find((r) => r.region === region);
      if (regional) return regional.discountPrice ?? regional.price;
    }
    if (currency) {
      const byCurrency = product.regionalPricing.find((r) => r.currency === currency);
      if (byCurrency) return byCurrency.discountPrice ?? byCurrency.price;
    }
    const first = product.regionalPricing[0];
    return (first?.discountPrice ?? first?.price ?? 0) as number;
  }

  if (typeof (product as any)?.pricing === 'number') {
    return (product as any).pricing as number;
  }

  return 0;
}

/**
 * ✅ 获取产品的基础价格（USD）
 */
export function getProductBasePrice(product: Product): number {
  // 查找 USD 定价，如果没有则使用第一个定价
  const usdPricing = product.regionalPricing?.find(rp => rp.currency === 'USD');
  if (usdPricing) {
    return usdPricing.discountPrice ?? usdPricing.price;
  }
  
  // 如果没有 USD 定价，使用第一个定价
  const firstPricing = product.regionalPricing?.[0];
  if (firstPricing) {
    return firstPricing.discountPrice ?? firstPricing.price;
  }
  
  return 0;
}

/**
 * ✅ 获取产品的基础货币
 */
export function getProductBaseCurrency(product: Product): Currency {
  // 优先使用 USD 作为基础货币
  const usdPricing = product.regionalPricing?.find(rp => rp.currency === 'USD');
  if (usdPricing) return 'USD';
  
  // 如果没有 USD，使用第一个定价的货币
  const firstPricing = product.regionalPricing?.[0];
  if (firstPricing) return firstPricing.currency as Currency;
  
  return 'USD';
}

/**
 * ✅ 获取产品库存（汇总/特定 region）
 */
export function getProductStock(product: Product, region?: Region): number {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) {
    const direct = (product as any)?.stock;
    return typeof direct === 'number' ? direct : 0;
  }

  if (region) {
    const regional = product.regionalPricing.find((r) => r.region === region);
    return regional?.stock ?? 0;
  }

  return product.regionalPricing.reduce((sum, r) => sum + (r?.stock ?? 0), 0);
}

/**
 * ✅ 检查产品是否有库存
 */
export function isProductInStock(product: Product, region?: Region): boolean {
  return getProductStock(product, region) > 0;
}

/* ------------------- Region → Currency 映射（基于你的 Currency 类型） ------------------- */
// Currency: 'USD' | 'MYR' | 'THB' | 'VND' | 'PHP' | 'SGD' | 'IDR' | 'CNY' | 'EUR' | 'JPY' | 'KRW' | 'INR' | 'SAR' | 'AED' | 'RUB' | 'GBP' | 'AUD'
// Region:   'US'  | 'MY'  | 'TH'  | 'VN'  | 'PH'  | 'SG'  | 'ID'  | 'CN'  | 'EU'  | 'JP'  | 'KR'  | 'IN'  | 'SA'  | 'AE'  | 'RU'  | 'UK'  | 'AU' | 'GLOBAL'
const REGION_TO_CURRENCY: Record<Region, Currency> = {
  US: 'USD',
  MY: 'MYR',
  TH: 'THB',
  VN: 'VND',
  PH: 'PHP',
  SG: 'SGD',
  ID: 'IDR',
  CN: 'CNY',
  EU: 'EUR',
  JP: 'JPY',
  KR: 'KRW',
  IN: 'INR',
  SA: 'SAR',
  AE: 'AED',
  RU: 'RUB',
  UK: 'GBP',
  AU: 'AUD',
  GLOBAL: 'USD',  // 全局回退
};

type CurrencyOpts =
  | Region
  | {
      selectedCurrency?: Currency; // 当前选择货币（最高优先）
      region?: Region;             // 其次按地区
    };

/**
 * ✅ 返回“当前选择的货币”或按 region 推断的货币
 * 优先级：selectedCurrency → regionalPricing 匹配 region → REGION_TO_CURRENCY → 第一条定价 → 'USD'
 */
export function getProductCurrency(product: Product, opts?: CurrencyOpts): Currency {
  let selectedCurrency: Currency | undefined;
  let region: Region | undefined;

  if (typeof opts === 'string') {
    region = opts as Region;
  } else if (opts && typeof opts === 'object') {
    selectedCurrency = opts.selectedCurrency;
    region = opts.region;
  }

  // 1) 用户当前选择的货币
  if (selectedCurrency) return selectedCurrency;

  const hasRegional = Array.isArray(product?.regionalPricing) && product.regionalPricing.length > 0;

  // 2) 在产品定价里按 region 匹配
  if (hasRegional && region) {
    const byRegion = product.regionalPricing.find((r) => r.region === region);
    if (byRegion?.currency) return byRegion.currency as Currency;
  }

  // 3) 用 Region→Currency 表回退（严格基于 region）
  if (region && REGION_TO_CURRENCY[region]) {
    return REGION_TO_CURRENCY[region];
  }

  // 4) 没提供 region，就用产品第一条定价的货币
  if (hasRegional && product.regionalPricing[0]?.currency) {
    return product.regionalPricing[0].currency as Currency;
  }

  // 5) 最终兜底（类型要求）
  return 'USD';
}

/**
 * ✅ 获取特定区域的价格信息
 */
export function getProductRegionPrice(product: Product, region: Region): ProductRegionPrice | null {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return null;
  return product.regionalPricing.find((r) => r.region === region) || null;
}

/**
 * ✅ 获取所有可用区域
 */
export function getAvailableRegions(product: Product): Region[] {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return [];
  return product.regionalPricing
    .filter((r) => (r?.isAvailable ?? true) && (r?.stock ?? 0) > 0)
    .map((r) => r.region);
}

/**
 * ✅ 获取所有可用货币
 */
export function getAvailableCurrencies(product: Product): Currency[] {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return [];
  const currencies = product.regionalPricing
    .filter((r) => (r?.isAvailable ?? true) && (r?.stock ?? 0) > 0)
    .map((r) => r.currency as Currency);
  return Array.from(new Set(currencies));
}

/**
 * ✅ 检查产品是否有折扣
 */
export function hasProductDiscount(product: Product, region?: Region): boolean {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return false;
  const regionPrice = region ? getProductRegionPrice(product, region) : product.regionalPricing[0];
  return !!(regionPrice?.discountPrice && regionPrice.discountPrice < (regionPrice?.price ?? 0));
}

/**
 * ✅ 获取折扣百分比
 */
export function getDiscountPercentage(product: Product, region?: Region): number {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return 0;
  const regionPrice = region ? getProductRegionPrice(product, region) : product.regionalPricing[0];
  if (!regionPrice?.discountPrice || !regionPrice?.price) return 0;
  return Math.round((1 - regionPrice.discountPrice / regionPrice.price) * 100);
}

/**
 * ✅ 获取产品的主要图片
 */
export function getProductImage(product: Product): string {
  if (Array.isArray(product?.images) && product.images.length > 0) return product.images[0]!;
  return '/images/placeholder-product.png';
}

/**
 * ✅ 获取产品图片列表
 */
export function getProductImages(product: Product): string[] {
  if (Array.isArray(product?.images) && product.images.length > 0) return product.images;
  return ['/images/placeholder-product.png'];
}

/**
 * ✅ 显示价格（格式化）
 */
export function formatProductPrice(
  product: Product,
  options?: { region?: Region; currency?: Currency; locale?: string }
): string {
  const price = getProductPrice(product, options);
  const currency = options?.currency ?? getProductCurrency(product, options?.region);
  const locale = options?.locale || 'en';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * ✅ 显示转换后的价格（基于基础货币的汇率转换）
 */
export async function formatConvertedProductPrice(
  product: Product,
  targetCurrency: Currency,
  options?: { 
    region?: Region; 
    locale?: string;
    showOriginal?: boolean;
  }
): Promise<string> {
  const basePrice = getProductBasePrice(product);
  const baseCurrency = getProductBaseCurrency(product);
  const locale = options?.locale || 'en';
  const showOriginal = options?.showOriginal ?? true;

  // 如果目标货币与基础货币相同，直接格式化
  if (targetCurrency === baseCurrency) {
    return formatProductPrice(product, { ...options, currency: targetCurrency });
  }

  try {
    // 导入汇率转换函数
    const { convertPrice, formatPrice } = await import('./money');
    
    // 转换价格
    const convertedAmount = await convertPrice(basePrice, baseCurrency, targetCurrency);
    const convertedFormatted = formatPrice(convertedAmount, targetCurrency, locale);
    
    if (showOriginal) {
      const originalFormatted = formatPrice(basePrice, baseCurrency, locale);
      return `${convertedFormatted} (${originalFormatted})`;
    }
    
    return convertedFormatted;
  } catch (error) {
    console.error('Failed to format converted price:', error);
    // 如果转换失败，回退到普通格式化
    return formatProductPrice(product, { ...options, currency: targetCurrency });
  }
}

/**
 * ✅ 获取转换后的价格（数值）
 */
export async function getConvertedProductPrice(
  product: Product,
  targetCurrency: Currency
): Promise<number> {
  const basePrice = getProductBasePrice(product);
  const baseCurrency = getProductBaseCurrency(product);

  if (targetCurrency === baseCurrency) {
    return basePrice;
  }

  try {
    const { convertPrice } = await import('./money');
    return await convertPrice(basePrice, baseCurrency, targetCurrency);
  } catch (error) {
    console.error('Failed to convert price:', error);
    return basePrice;
  }
}

/**
 * ✅ 最便宜的价格变体
 */
export function getCheapestVariant(product: Product): ProductRegionPrice | null {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return null;
  return product.regionalPricing.reduce((cheapest, current) => {
    const c = (current?.discountPrice ?? current?.price) ?? Number.POSITIVE_INFINITY;
    const m = (cheapest?.discountPrice ?? cheapest?.price) ?? Number.POSITIVE_INFINITY;
    return c < m ? current : cheapest;
  });
}

/**
 * ✅ 最贵的价格变体
 */
export function getMostExpensiveVariant(product: Product): ProductRegionPrice | null {
  if (!Array.isArray(product?.regionalPricing) || product.regionalPricing.length === 0) return null;
  return product.regionalPricing.reduce((max, current) => {
    const c = (current?.discountPrice ?? current?.price) ?? 0;
    const m = (max?.discountPrice ?? max?.price) ?? 0;
    return c > m ? current : max;
  });
}

/**
 * ✅ 新品（7 天内）
 */
export function isNewProduct(product: Product): boolean {
  const created = (product as any)?.createdAt;
  if (!created) return false;
  const createdDate = new Date(created);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return createdDate > sevenDaysAgo;
}

/**
 * ✅ 标签
 */
export function getProductTags(product: Product): string[] {
  return Array.isArray(product?.tags) ? product.tags : [];
}

export function hasProductTag(product: Product, tag: string): boolean {
  return getProductTags(product).includes(tag);
}
