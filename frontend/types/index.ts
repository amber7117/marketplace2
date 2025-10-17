// Shared types for the marketplace platform

/* =========================================================
   🧍 USER & AUTH
========================================================= */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'manager';
  isVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

/* =========================================================
   🌍 LOCALE, CURRENCY, REGION
========================================================= */
// 覆盖 i18n 中出现过的全部语言代码，避免类型不一致
export type Locale =
  | 'en' | 'zh' | 'th' | 'vi' | 'ms' | 'id'
  | 'fr' | 'ar' | 'es' | 'tl' | 'ru' | 'pt'
  | 'ro' | 'it' | 'nl' | 'ja' | 'hi' | 'de' | 'ko';

export type Currency =
  | 'USD' | 'MYR' | 'THB' | 'VND' | 'PHP'
  | 'SGD' | 'IDR' | 'CNY' | 'EUR' | 'JPY'
  | 'KRW' | 'INR' | 'SAR' | 'AED' | 'RUB'
  | 'GBP' | 'AUD';

export type Region =
  | 'US' | 'MY' | 'TH' | 'VN' | 'PH'
  | 'SG' | 'ID' | 'CN' | 'JP' | 'KR'
  | 'IN' | 'AE' | 'SA' | 'EU' | 'UK'
  | 'RU' | 'AU' | 'GLOBAL';

/* 可选：区域与货币映射（若需要在别处导出使用） */
export type RegionCurrencyMap = Record<Region, Currency>;

/* =========================================================
   🛒 VARIANTS (可选：变体映射类型)
========================================================= */
export interface VariantOption {
  id: string;
  name: string;
  values: string[];
}

export interface VariantSelection {
  [key: string]: string; // e.g., { "Color": "Red", "Size": "M" }
}

export interface ProductVariantPriceMap {
  [variantKey: string]: ProductRegionPrice; // e.g., { "Color:Red|Size:M": ProductRegionPrice }
}

export interface ProductVariantStockMap {
  [variantKey: string]: number; // e.g., { "Color:Red|Size:M": 10 }
}

export interface ProductVariantImageMap {
  [variantKey: string]: string[]; // e.g., { "Color:Red|Size:M": ["img1.jpg", "img2.jpg"] }
}

export interface ProductVariantAvailabilityMap {
  [variantKey: string]: boolean; // e.g., { "Color:Red|Size:M": true }
}

export interface ProductVariantDetails {
  price?: ProductRegionPrice;
  stock?: number;
  images?: string[];
  isAvailable?: boolean;
}

export interface ProductVariantDetailsMap {
  [variantKey: string]: ProductVariantDetails; // e.g., { "Color:Red|Size:M": { ... } }
}

export interface ProductVariantSelectionMap {
  [selectionKey: string]: string; // e.g., { "Color:Red|Size:M": "variantId123" }
}

export interface ProductVariantStockStatusMap {
  [variantKey: string]: 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number;
  stock: number;
}

/* =========================================================
   🛒 PRODUCT
========================================================= */
export interface ProductRegionPrice {
  region: Region;
  currency: Currency;
  price: number;
  discountPrice?: number;
  stock: number;
  isAvailable: boolean;
  _id?: string;
  denomination?: string;
  isInstantDelivery?: boolean;
  platformLogo?: string;
  displayOrder?: number;
}

export interface Product {
  _id: string;
  slug: string;
  sku: string;
  category: string;
  type: 'game_card' | 'gift_card' | 'digital_code';
  images: string[];
  pricing: number; // 基础定价（当没有 regionalPricing 时的回退）
  regionalPricing: ProductRegionPrice[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  // 🔹 以下为组件用到但原类型缺失的字段（可选，存在就显示）
  brand?: string;
  stock?: number; // 若后端也维护产品级库存
  weight?: number; // kg
  dimensions?: {
    length?: number; // cm
    width?: number;  // cm
    height?: number; // cm
  };

  name:
    | string
    | {
        en: string;
        zh: string;
        th: string;
        my: string;
        vi: string;
        ms: string;
        id: string;
        fr: string;
        ar: string;
        es: string;
        tl: string;
        ru: string;
        pt: string;
        ro: string;
        it: string;
        nl: string;
        ja: string;
        hi: string;
        de: string;
        ko: string;
      };

  description:
    | string
    | {
        en: string;
        zh: string;
        th: string;
        my: string;
        vi: string;
        ms: string;
        id: string;
        fr: string;
        ar: string;
        es: string;
        tl: string;
        ru: string;
        pt: string;
        ro: string;
        it: string;
        nl: string;
        ja: string;
        hi: string;
        de: string;
        ko: string;
      };
}

/* =========================================================
   🏷️ CATEGORY
========================================================= */
export interface Category {
  id: string;
  name: {
    en: string;
    zh: string;
    th: string;
    my: string;
    vi: string;
    ms: string;
    id: string;
    fr: string;
    ar: string;
    es: string;
    tl: string;
    ru: string;
    pt: string;
    ro: string;
    it: string;
    nl: string;
    ja: string;
    hi: string;
    de: string;
    ko: string;
  };
  slug: string;
  icon?: string;
  image: string;
  productCount: number;
}

/* =========================================================
   📦 ORDER
========================================================= */
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  currency: Currency;
  region: Region;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  payment: {
    method: 'stripe' | 'fpx' | 'usdt' | 'razer' | 'wallet';
    currency: Currency;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
  };
  delivery?: {
    method: 'email' | 'instant';
    codes?: string[];
    deliveredAt?: string;
  };
  status:
    | 'pending'
    | 'paid'
    | 'processing'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   💰 WALLET
========================================================= */
export interface Wallet {
  userId: string;
  balance: number;
  currency: Currency;
  transactions: Transaction[];
}

export interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund' | 'bonus';
  amount: number;
  currency: Currency;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

/* =========================================================
   🛍️ CART
========================================================= */
export interface Denomination {
  id: string;
  value: number;
  currency: Currency;
  isAvailable: boolean;
  discountPrice?: number;
  originalPrice?: number;
  region: Region;
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  currency: Currency;
  region: Region;
  variantId?: string;
  variantName?: string;
}

/* =========================================================
   🏠 HOME PAGE
========================================================= */
export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  isActive: boolean;
}

export interface HomeData {
  banners: Banner[];
  categories: Category[];
  featuredProducts: Product[];
  popularProducts: Product[];
}

/* =========================================================
   💳 PAYMENT
========================================================= */
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'stripe' | 'fpx' | 'usdt' | 'razer' | 'wallet';
  icon: string;
  isAvailable: boolean;
  currencies: Currency[];
}

export interface PaymentRequest {
  orderId?: string;
  items: CartItem[];
  paymentMethod: string;
  totalAmount: number;
  currency: Currency;
}

export interface PaymentResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  transactionId: string;
}

/* =========================================================
   🧭 API RESPONSES / PAGINATION
========================================================= */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** 可选：更贴近 NestJS 的分页元信息 */
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

/** 向后兼容：保留老式结构（使用 Pagination） */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

/** 可选：另一种分页返回结构（使用 PaginationMeta） */
export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

/* =========================================================
   ✅ 说明
   - 合并了重复的 ProductVariant 声明
   - 为 Product 增加了可选的 brand/stock/weight/dimensions 字段
   - Locale 扩展以覆盖 name/description 的所有语言键
   - 其他导出名保持不变，尽量保证现有代码无需修改
========================================================= */
