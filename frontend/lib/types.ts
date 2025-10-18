import { z } from 'zod';

// Currency and Locale Types
export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const SUPPORTED_CURRENCIES = ['MYR', 'USD', 'SGD'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

// Product Schema
export const OfferSchema = z.object({
  id: z.string(),
  denomination: z.number(),
  currency: z.enum(['MYR']),
  price: z.number(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  stock: z.number().default(0),
  region: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  category: z.string(),
  brand: z.string(),
  images: z.array(z.string()),
  offers: z.array(OfferSchema),
  regions: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().default(0),
  featured: z.boolean().default(false),
  supportedGames: z.array(z.string()).default([]),
  usageGuide: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Offer = z.infer<typeof OfferSchema>;
export type Product = z.infer<typeof ProductSchema>;

// Cart Types
export const CartItemSchema = z.object({
  lineId: z.string(),
  slug: z.string(),
  offerId: z.string(),
  quantity: z.number().min(1),
  product: ProductSchema.omit({ offers: true }),
  offer: OfferSchema,
});

export type CartItem = z.infer<typeof CartItemSchema>;

// Order Types
export const OrderStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded'
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  slug: z.string(),
  offerId: z.string(),
  quantity: z.number(),
  price: z.number(),
  currency: z.enum(['MYR']),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string().optional(),
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.enum(['MYR']),
  status: OrderStatusSchema,
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  billingInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    taxId: z.string().optional(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.enum(['card', 'paypal', 'bank']),
  transactionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;

// Payment Types
export const PaymentStatusSchema = z.enum([
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'CANCELED'
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentIntentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  amount: z.number(),
  currency: z.enum(['MYR']),
  status: PaymentStatusSchema,
  paymentUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

// User Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  emailVerified: z.boolean().default(false),
  preferences: z.object({
    locale: z.enum(SUPPORTED_LOCALES).default('en'),
    currency: z.enum(SUPPORTED_CURRENCIES).default('MYR'),
  }),
  billingInfo: z.object({
    company: z.string().optional(),
    taxId: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// API Response Types
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => 
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
