import { z } from 'zod';

// ==================== 基础类型 ====================
export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export const SUPPORTED_CURRENCIES = ['MYR', 'USD', 'SGD'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];
export type Currency = typeof SUPPORTED_CURRENCIES[number];

// ==================== 产品 Schema ====================
export const OfferSchema = z.object({
  id: z.string(),
  denomination: z.number().positive(),
  currency: z.enum(['MYR']), // 基准货币
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0).default(0),
  region: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  description: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  shortDescription: z.object({
    en: z.string(),
    zh: z.string(),
  }).optional(),
  category: z.string(),
  brand: z.string(),
  images: z.array(z.string()).min(1),
  offers: z.array(OfferSchema).min(1),
  regions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  supportedGames: z.array(z.string()).default([]),
  usageGuide: z.object({
    en: z.string(),
    zh: z.string(),
  }).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Offer = z.infer<typeof OfferSchema>;
export type Product = z.infer<typeof ProductSchema>;

// ==================== 购物车 Schema ====================
export const CartItemSchema = z.object({
  lineId: z.string(),
  slug: z.string(),
  offerId: z.string(),
  quantity: z.number().int().min(1),
  addedAt: z.string().datetime(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

// ==================== 订单 Schema ====================
export const OrderStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded',
  'failed',
]);

export const PaymentStatusSchema = z.enum([
  'pending',
  'authorized',
  'captured',
  'failed',
  'cancelled',
  'refunded',
]);

export const PaymentMethodSchema = z.enum([
  'credit_card',
  'fpx',
  'tng',
  'boost',
  'grab_pay',
  'shopee_pay',
  'crypto_usdt',
]);

export const ContactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

export const BillingInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const OrderItemSchema = z.object({
  slug: z.string(),
  offerId: z.string(),
  productName: z.string(),
  denomination: z.number(),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  currency: z.enum(SUPPORTED_CURRENCIES),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema.optional(),
  paymentIntentId: z.string().optional(),
  transactionId: z.string().optional(),
  contactInfo: ContactInfoSchema,
  billingInfo: BillingInfoSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type BillingInfo = z.infer<typeof BillingInfoSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

// ==================== 用户 Schema ====================
export const UserPreferencesSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  currency: z.enum(SUPPORTED_CURRENCIES),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  preferences: UserPreferencesSchema,
  savedAddresses: z.array(BillingInfoSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ==================== 认证 Schema ====================
export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
  tokenType: z.string().default('Bearer'),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional(),
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;

// ==================== 通知 Schema ====================
export const NotificationTypeSchema = z.enum([
  'order_success',
  'order_failed',
  'payment_success',
  'payment_failed',
  'promotion',
  'system',
]);

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  title: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  message: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  link: z.string().optional(),
  read: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

// ==================== API 响应 Schema ====================
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  meta: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    total: z.number().optional(),
  }).optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

// ==================== 筛选/搜索参数 ====================
export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  region: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'rating', 'popular', 'newest']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

// ==================== 辅助类型 ====================
export interface LocalizedText {
  en: string;
  zh: string;
}

export interface PriceDisplay {
  amount: number;
  currency: Currency;
  formatted: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: Currency;
}

// ==================== 常量 ====================
export const TAX_RATE = 0.06; // 6% GST/SST
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MYR: 'RM',
  USD: '$',
  SGD: 'S$',
};

export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_CURRENCY: Currency = 'MYR';

// ==================== 验证辅助函数 ====================
export function validateProduct(data: unknown): Product {
  return ProductSchema.parse(data);
}

export function validateOrder(data: unknown): Order {
  return OrderSchema.parse(data);
}

export function validateCartItem(data: unknown): CartItem {
  return CartItemSchema.parse(data);
}

export function validateUserProfile(data: unknown): UserProfile {
  return UserProfileSchema.parse(data);
}
