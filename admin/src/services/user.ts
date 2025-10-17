import api from './api';
import { User, PaginatedResponse, TableParams, ApiResponse } from '@/types';

/**
 * User Service
 */
export const userService = {
  /**
   * Get users list with pagination and filters
   */
  getUsers: async (params?: TableParams): Promise<PaginatedResponse<User>> => {
    return api.get<any, PaginatedResponse<User>>('/api/users', { params });
  },

  /**
   * Get single user
   */
  getUser: async (id: string): Promise<User> => {
    return api.get<any, User>(`/api/users/${id}`);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    return api.put<any, User>(`/api/users/${id}`, data);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/users/${id}`);
  },

  /**
   * Activate/Deactivate user
   */
  toggleUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    return api.patch<any, User>(`/api/users/${id}/status`, { isActive });
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    id: string,
    role: User['role']
  ): Promise<User> => {
    return api.patch<any, User>(`/api/users/${id}/role`, { role });
  },

  /**
   * Export users to CSV
   */
  exportUsers: async (params?: TableParams): Promise<Blob> => {
    return api.get('/api/users/export', {
      params,
      responseType: 'blob',
    });
  },
};
