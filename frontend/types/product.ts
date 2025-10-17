// types/product.ts

// ==================== 核心产品类型 ====================
export type ProductType = 'game_card' | 'gift_card' | 'digital_code';
// Product interface is defined in frontend/types/index.ts to avoid conflicts

export interface ProductSummary {
  id: string;
  slug: string;
  name: Record<string, string>;
  images: string[];
  category: string;
  regionalPricing: ProductRegionPrice[];
  createdAt: string;
  updatedAt: string;
}

// ==================== 价格和变体类型 ====================

export interface ProductRegionPrice {
  region: string;
  currency: Currency;
  price: number;
  discountPrice?: number;
  stock: number;
  isAvailable: boolean;
}

export interface ProductDenomination {
  value: number;
  currency: Currency;
}

export interface DenominationItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: Currency;
  stock: number;
  isAvailable: boolean;
  isInstantDelivery: boolean;
  platformLogo?: string;
  region: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  region: string;
  currency: Currency;
  denominations: ProductDenomination[];
  stock: number;
  isAvailable: boolean;
}

export interface Variant {
  id: string;
  name: string;
  value: string;
  price: number;
  stock: number;
}

// ==================== 分类和特征类型 ====================

export interface ProductCategory {
  id: string;
  name: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFeature {
  name: string;
  description: string;
}

export interface ProductTag {
  name: string;
}

export interface ProductRegion {
  name: string;
  code: string;
}

// ==================== 筛选和排序类型 ====================

export interface ProductVariantSelection {
  region?: string;
  currency?: Currency;
  denomination?: number;
}

export interface ProductFilter {
  category?: string;
  region?: string;
  priceRange?: [number, number];
  tags?: string[];
  features?: string[];
  searchQuery?: string;
  isFeatured?: boolean;
}

export interface ProductSortOption {
  field: 'price' | 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ProductListParams {
  filter?: ProductFilter;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: import('./index').Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== 页面 Props 类型 ====================

export interface ProductDetailPageProps {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[]>;
}

// ==================== 货币类型 ====================

export type Currency = 
  | 'USD' | 'MYR' | 'THB' | 'VND' | 'CNY' 
  | 'EUR' | 'GBP' | 'JPY' | 'KRW' | 'SGD'
  | 'AUD' | 'CAD' | 'INR' | 'PHP' | 'IDR';
