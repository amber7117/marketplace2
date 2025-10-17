import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { getToken, removeToken } from '@/utils/storage';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Handle network errors
    if (!error.response) {
      message.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMessage = data?.error || data?.message || 'An error occurred';

    // Handle different error status codes
    switch (status) {
      case 401:
        message.error('Unauthorized. Please login again.');
        removeToken();
        window.location.href = '/login';
        break;
      case 403:
        message.error('Access denied. Insufficient permissions.');
        break;
      case 404:
        message.error('Resource not found.');
        break;
      case 422:
        message.error(errorMessage);
        break;
      case 500:
        message.error('Server error. Please try again later.');
        break;
      default:
        message.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;

// Export axios for direct use
export { axios };
