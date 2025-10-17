import api from './api';
import { Product, ProductFormData, PaginatedResponse, TableParams, ApiResponse } from '@/types';

/**
 * Product Service
 */
export const productService = {
  /**
   * Get products list with pagination and filters
   */
  getProducts: async (params?: TableParams): Promise<PaginatedResponse<Product>> => {
    return api.get<any, PaginatedResponse<Product>>('/api/products', { params });
  },

  /**
   * Get single product
   */
  getProduct: async (id: string): Promise<Product> => {
    return api.get<any, Product>(`/api/products/${id}`);
  },

  /**
   * Create product
   */
  createProduct: async (data: ProductFormData): Promise<Product> => {
    return api.post<any, Product>('/api/products', data);
  },

  /**
   * Update product
   */
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    return api.put<any, Product>(`/api/products/${id}`, data);
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/products/${id}`);
  },

  /**
   * Update product stock
   */
  updateStock: async (
    id: string,
    data: { region: string; stock: number }
  ): Promise<Product> => {
    return api.patch<any, Product>(`/api/products/${id}/stock`, data);
  },

  /**
   * Bulk import products
   */
  importProducts: async (file: File): Promise<ApiResponse<{ success: number; failed: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Export products to CSV
   */
  exportProducts: async (params?: TableParams): Promise<Blob> => {
    return api.get('/api/products/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Get product categories
   */
  getCategories: async (): Promise<string[]> => {
    return api.get<any, string[]>('/api/categories');
  },
};
