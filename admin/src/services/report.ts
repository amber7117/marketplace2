import api from './api';
import {
  DashboardSummary,
  SalesChartData,
  CurrencyDistribution,
  TopProduct,
} from '@/types';

/**
 * Report Service
 */
export const reportService = {
  /**
   * Get dashboard summary
   */
  getSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardSummary> => {
    return api.get<any, DashboardSummary>('/api/reports/summary', { params });
  },

  /**
   * Get sales chart data
   */
  getSalesChart: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<SalesChartData[]> => {
    return api.get<any, SalesChartData[]>('/api/reports/sales', { params });
  },

  /**
   * Get active users data
   */
  getUsersChart: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ date: string; users: number }[]> => {
    return api.get('/api/reports/users', { params });
  },

  /**
   * Get currency distribution
   */
  getCurrencyDistribution: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CurrencyDistribution[]> => {
    return api.get<any, CurrencyDistribution[]>('/api/reports/currency', { params });
  },

  /**
   * Get top products
   */
  getTopProducts: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TopProduct[]> => {
    return api.get<any, TopProduct[]>('/api/reports/top-products', { params });
  },

  /**
   * Get revenue by region
   */
  getRevenueByRegion: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ region: string; revenue: number }[]> => {
    return api.get('/api/reports/revenue-by-region', { params });
  },

  /**
   * Export report to CSV
   */
  exportReport: async (
    type: 'sales' | 'users' | 'orders' | 'revenue',
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Blob> => {
    return api.get(`/api/reports/${type}/export`, {
      params,
      responseType: 'blob',
    });
  },
};
