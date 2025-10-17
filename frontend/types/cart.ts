import type { Product, ProductRegionPrice } from './index';

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  currency: Currency;
  region: string;
  variant?: string;
  maxStock: number;
  addedAt: string;
}

// Cart action parameters
export interface AddToCartParams {
  product: Product;
  variant: ProductRegionPrice;
  quantity: number;
}

export interface UpdateCartItemParams {
  itemId: string;
  quantity: number;
}

export interface RemoveCartItemParams {
  itemId: string;
}

export interface ClearCartParams {
  userId: string;
}

// Cart validation
export interface CartValidationResult {
  isValid: boolean;
  error?: string;
}

// Cart data structure
export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  currency: Currency;
  region: string;
  createdAt: string;
  updatedAt: string;
}

// Cart state management
export interface CartState {
  items: CartItem[];
  currency: Currency;
  total: number;
  itemCount: number;
}

export interface CartStore {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  currency: Currency;
  region: string;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCurrency: (currency: Currency) => void;
  setRegion: (region: string) => void;
}

export interface CartActions {
  addToCart: (product: Product, variant: ProductRegionPrice, quantity: number) => void;
}

export interface CartContextValue extends CartStore, CartActions {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

export interface CartProviderProps {
  children: React.ReactNode;
}

export interface CartReducerAction {
  type: string;
  payload?: unknown;
}

// API response types
export interface ApiResponse<T> {
  data: {
    data: T;
    message?: string;
  };
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Currency type
export type Currency = 'USD' | 'MYR' | 'THB' | 'VND' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'KRW' | 'SGD';
