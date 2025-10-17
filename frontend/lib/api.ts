import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3007',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ==================== API Service Functions ====================

import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Product,
  Order,
  Wallet,
  Transaction,
  HomeData,
  PaginatedResponse,
  PaymentRequest,
  PaymentResponse,
  ApiResponse,
} from '@/types';

import type { PaginationParams } from '@/types/cart';

// Auth APIs
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
export const productAPI = {
    /**
     * Homepage data (banners, featured, popular, etc.)
     */
    getHome: () => api.get<ApiResponse<HomeData>>('/home'),
  
    /**
     * Get product list
     * Supports: pagination, category, region, isFeatured, search
     *
     * Examples:
     * - /products?limit=8&isFeatured=true
     * - /products?category=gift-cards&page=2
     */
    getProducts: (
      params?: PaginationParams & {
        category?: string;
        region?: string;
        isFeatured?: boolean;
        search?: string;
        limit?: number;
      },
    ) =>
      api.get<PaginatedResponse<Product>>('/products', {
        params: Object.fromEntries(
          Object.entries(params || {}).filter(
            ([, v]) => v !== undefined && v !== null && v !== '',
          ),
        ),
      }),
  
    /**
     * Get product by slug
     */
    getProduct: (slug: string, region?: string) =>
      api.get<ApiResponse<Product>>(`/products/${slug}`, {
        params: region ? { region } : {},
      }),
  
    /**
     * Search products (backend: /products/search)
     */
    searchProducts: (query: string, params?: PaginationParams) =>
      api.get<PaginatedResponse<Product>>('/products/search', {
        params: { query, ...params },
      }),
  
    /**
     * Get all categories
     */
    getCategories: () => api.get<ApiResponse<string[]>>('/products/categories'),

    /**
     * Get product denominations (面额数据)
     * Supports filtering by region, currency, price range, and stock status
     */
    getDenominations: (
      identifier: string,
      params?: {
        region?: string;
        currency?: string;
        inStockOnly?: boolean;
        minPrice?: number;
        maxPrice?: number;
      }
    ) =>
      api.get<ApiResponse<{
        product: {
          id: string;
          name: string;
          slug: string;
          category: string;
          images?: string[];
        };
        denominations: Array<{
          region: string;
          currency: string;
          denomination: string;
          price: number;
          discountPrice?: number;
          stock: number;
          isAvailable: boolean;
          isInstantDelivery?: boolean;
          platformLogo?: string;
          displayOrder?: number;
        }>;
        availableRegions: Record<string, {
          currency: string;
          count: number;
          totalStock: number;
        }>;
        priceStats: {
          minPrice: number;
          maxPrice: number;
          avgPrice: number;
          totalStock: number;
        };
        totalDenominations: number;
        activeDenominations: number;
      }>>(`/products/${identifier}/denominations`, {
        params: Object.fromEntries(
          Object.entries(params || {}).filter(
            ([, v]) => v !== undefined && v !== null && v !== '',
          ),
        ),
      }),
  };
  
// Order APIs
export const orderAPI = {
  getOrders: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Order>>('/orders', { params }),
  
  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),
  
  createOrder: (data: unknown) =>
    api.post<ApiResponse<Order>>('/orders', data),
  
  cancelOrder: (id: string) =>
    api.post(`/orders/${id}/cancel`),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () =>
    api.get<ApiResponse<Wallet>>('/wallet'),
  
  getTransactions: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Transaction>>('/wallet/transactions', { params }),
  
  deposit: (amount: number, paymentMethod: string) =>
    api.post('/wallet/deposit', { amount, paymentMethod }),
  
  withdraw: (amount: number, method: string) =>
    api.post('/wallet/withdraw', { amount, method }),
};

// Payment APIs
export const paymentAPI = {
  initiate: (data: PaymentRequest) =>
    api.post<PaymentResponse>('/payment/initiate', data),
  
  verify: (transactionId: string) =>
    api.get(`/payment/verify/${transactionId}`),
  
  getPaymentMethods: () =>
    api.get('/payment/methods'),
};
