import api from './api';
import { User, LoginRequest, LoginResponse, ApiResponse } from '@/types';

/**
 * Auth Service
 */
export const authService = {
  /**
   * User login
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<any, LoginResponse>('/api/auth/login', data);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    return api.get<any, User>('/api/auth/me');
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    return api.post('/api/auth/logout');
  },

  /**
   * Update profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.put<any, User>('/api/auth/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return api.put('/api/auth/password', data);
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return api.post('/api/auth/forgot-password', { email });
  },

  /**
   * Reset password
   */
  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<void>> => {
    return api.post('/api/auth/reset-password', data);
  },
};
