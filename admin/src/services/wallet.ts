import api from './api';
import {
  Wallet,
  Transaction,
  PaginatedResponse,
  TableParams,
  ApiResponse,
} from '@/types';

/**
 * Wallet Service
 */
export const walletService = {
  /**
   * Get user wallet
   */
  getWallet: async (userId: string): Promise<Wallet> => {
    return api.get<any, Wallet>(`/api/wallet/${userId}`);
  },

  /**
   * Get wallet transactions
   */
  getTransactions: async (
    userId: string,
    params?: TableParams
  ): Promise<PaginatedResponse<Transaction>> => {
    return api.get<any, PaginatedResponse<Transaction>>(
      `/api/wallet/${userId}/transactions`,
      { params }
    );
  },

  /**
   * Deposit to wallet (Admin operation)
   */
  deposit: async (
    userId: string,
    data: {
      amount: number;
      description?: string;
    }
  ): Promise<Wallet> => {
    return api.post<any, Wallet>(`/api/wallet/${userId}/deposit`, data);
  },

  /**
   * Withdraw from wallet (Admin operation)
   */
  withdraw: async (
    userId: string,
    data: {
      amount: number;
      description?: string;
    }
  ): Promise<Wallet> => {
    return api.post<any, Wallet>(`/api/wallet/${userId}/withdraw`, data);
  },

  /**
   * Freeze wallet
   */
  freezeWallet: async (userId: string): Promise<Wallet> => {
    return api.post<any, Wallet>(`/api/wallet/${userId}/freeze`);
  },

  /**
   * Unfreeze wallet
   */
  unfreezeWallet: async (userId: string): Promise<Wallet> => {
    return api.post<any, Wallet>(`/api/wallet/${userId}/unfreeze`);
  },

  /**
   * Get wallet statistics
   */
  getStatistics: async (): Promise<{
    totalBalance: number;
    totalFrozen: number;
    totalDeposit: number;
    totalWithdraw: number;
    activeWallets: number;
  }> => {
    return api.get('/api/wallet/admin/stats');
  },
};
