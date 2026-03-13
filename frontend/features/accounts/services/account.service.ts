/**
 * Service pour la gestion des comptes
 */

import { api } from '@/lib/api';
import type { Account, Transaction, CreateTransactionDto, TransactionsResponse } from '../types';

export const accountService = {
  // All transactions
  getAllTransactions: async (params?: { page?: number; limit?: number; type?: string; accountId?: string; search?: string; startDate?: string; endDate?: string }): Promise<TransactionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    const response = await api.get<{ success: boolean; data: TransactionsResponse; total: number; page: number; totalPages: number }>(`/transactions${query ? `?${query}` : ''}`);
    return {
      transactions: response.data?.transactions || [],
      summary: response.data?.summary || { DEBIT: 0, CREDIT: 0, PAYMENT: 0, REFUND: 0, total: 0 },
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  },

  getAll: async (): Promise<Account[]> => {
    const response = await api.get<{ success: boolean; data: { accounts: Account[] } }>('/accounts');
    return response.success && response.data?.accounts ? response.data.accounts : [];
  },
  // Accounts
  getByClientId: async (clientId: string): Promise<Account | null> => {
    try {
      const response = await api.get<{ success: boolean; data: { account: Account } }>(`/accounts/client/${clientId}`);
      if (!response.success || !response.data?.account) {
        return null; // Compte n'existe pas encore, c'est normal
      }
      return response.data.account;
    } catch (error: any) {
      // Si c'est une erreur 404, retourner null (compte n'existe pas encore)
      if (error?.status === 404) {
        return null;
      }
      // Sinon, propager l'erreur
      throw error;
    }
  },

  getBySupplierId: async (supplierId: string): Promise<Account | null> => {
    try {
      const response = await api.get<{ success: boolean; data: { account: Account } }>(`/accounts/supplier/${supplierId}`);
      if (!response.success || !response.data?.account) {
        return null; // Compte n'existe pas encore, c'est normal
      }
      return response.data.account;
    } catch (error: any) {
      // Si c'est une erreur 404, retourner null (compte n'existe pas encore)
      if (error?.status === 404) {
        return null;
      }
      // Sinon, propager l'erreur
      throw error;
    }
  },

  getById: async (id: string): Promise<Account> => {
    const response = await api.get<{ success: boolean; data: { account: Account } }>(`/accounts/${id}`);
    if (!response.success || !response.data?.account) {
      throw new Error('Account not found');
    }
    return response.data.account;
  },

  update: async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await api.put<{ success: boolean; data: { account: Account } }>(`/accounts/${id}`, data);
    if (!response.success || !response.data?.account) {
      throw new Error('Failed to update account');
    }
    return response.data.account;
  },

  create: async (data: Partial<Account> & { accountType: 'CLIENT' | 'SUPPLIER' }): Promise<Account> => {
    const response = await api.post<{ success: boolean; message?: string; data: { account: Account } }>('/accounts', data);
    if (!response.success || !response.data?.account) {
      throw new Error(response.message || 'Failed to create account');
    }
    return response.data.account;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<{ success: boolean }>(`/accounts/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete account');
    }
  },

  // Transactions
  getTransactionsByAccountId: async (accountId: string): Promise<Transaction[]> => {
    const response = await api.get<{ success: boolean; data: { transactions: Transaction[] } }>(`/transactions/account/${accountId}`);
    return response.success && response.data?.transactions ? response.data.transactions : [];
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get<{ success: boolean; data: { transaction: Transaction } }>(`/transactions/${id}`);
    if (!response.success || !response.data?.transaction) {
      throw new Error('Transaction not found');
    }
    return response.data.transaction;
  },

  createTransaction: async (data: CreateTransactionDto): Promise<Transaction> => {
    const response = await api.post<{ success: boolean; data: { transaction: Transaction } }>('/transactions', data);
    if (!response.success || !response.data?.transaction) {
      throw new Error('Failed to create transaction');
    }
    return response.data.transaction;
  },
};
