import api from './api';
import { Order, PaginatedResponse, TableParams, ApiResponse } from '@/types';

/**
 * Order Service
 */
export const orderService = {
  /**
   * Get orders list with pagination and filters
   */
  getOrders: async (params?: TableParams): Promise<PaginatedResponse<Order>> => {
    return api.get<any, PaginatedResponse<Order>>('/api/orders', { params });
  },

  /**
   * Get single order
   */
  getOrder: async (id: string): Promise<Order> => {
    return api.get<any, Order>(`/api/orders/${id}`);
  },

  /**
   * Get order by order number
   */
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    return api.get<any, Order>(`/api/orders/number/${orderNumber}`);
  },

  /**
   * Update order status
   */
  updateStatus: async (
    id: string,
    status: Order['status']
  ): Promise<Order> => {
    return api.patch<any, Order>(`/api/orders/${id}/status`, { status });
  },

  /**
   * Manual deliver order
   */
  deliverOrder: async (
    id: string,
    data: { codes: string[] }
  ): Promise<Order> => {
    return api.post<any, Order>(`/api/orders/${id}/deliver`, data);
  },

  /**
   * Refund order
   */
  refundOrder: async (
    id: string,
    data: { reason?: string }
  ): Promise<Order> => {
    return api.post<any, Order>(`/api/orders/${id}/refund`, data);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (
    id: string,
    data: { reason?: string }
  ): Promise<Order> => {
    return api.post<any, Order>(`/api/orders/${id}/cancel`, data);
  },

  /**
   * Get order statistics
   */
  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    pending: number;
    paid: number;
    processing: number;
    delivered: number;
    completed: number;
    cancelled: number;
    refunded: number;
    totalAmount: number;
  }> => {
    return api.get('/api/orders/stats', { params });
  },

  /**
   * Export orders to CSV
   */
  exportOrders: async (params?: TableParams): Promise<Blob> => {
    return api.get('/api/orders/export', {
      params,
      responseType: 'blob',
    });
  },
};
