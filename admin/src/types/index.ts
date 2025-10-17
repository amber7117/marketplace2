// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'support';
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Product Types
export interface ProductRegionPrice {
  region: string;
  currency: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  productId: string;
  name: {
    en: string;
    zh: string;
    th: string;
  };
  description: {
    en: string;
    zh: string;
    th: string;
  };
  category: string;
  type: 'game_card' | 'gift_card' | 'digital_code';
  platform?: string;
  sku: string;
  images: string[];
  tags: string[];
  regionalPricing: ProductRegionPrice[];
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: {
    en: string;
    zh: string;
    th: string;
  };
  description: {
    en: string;
    zh: string;
    th: string;
  };
  category: string;
  type: string;
  platform?: string;
  sku: string;
  images?: string[];
  tags?: string[];
  regionalPricing: ProductRegionPrice[];
  isFeatured?: boolean;
  isActive?: boolean;
}

// Order Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail?: string;
  items: OrderItem[];
  payment: {
    method: 'wallet' | 'stripe' | 'razer' | 'fpx' | 'usdt';
    amount: number;
    currency: string;
    status: string;
  };
  status: 'pending' | 'paid' | 'processing' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  delivery?: {
    method: string;
    codes?: string[];
    deliveredAt?: string;
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  totals: {
    totalDeposit: number;
    totalWithdraw: number;
    totalSpent: number;
    totalRefund: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  wallet: string;
  userId?: string;
  type: 'deposit' | 'withdraw' | 'deduct' | 'refund' | 'transfer_in' | 'transfer_out' | 'fee' | 'bonus' | 'adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: {
    type: string;
    id: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface DashboardSummary {
  totalSales: number;
  totalOrders: number;
  activeUsers: number;
  pendingOrders: number;
  todaySales: number;
  todayOrders: number;
  salesGrowth: number;
  ordersGrowth: number;
}

export interface SalesChartData {
  date: string;
  amount: number;
  orders: number;
}

export interface CurrencyDistribution {
  currency: string;
  amount: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSales: number;
  totalOrders: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Table Types
export interface TableParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Common Types
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  thumbUrl?: string;
}
