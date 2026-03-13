/**
 * Types pour le module Comptes
 */

import type { Client } from '@/features/clients/types';
import type { Supplier } from '@/lib/api-types';

export interface Account {
  id: string;
  accountType: 'CLIENT' | 'SUPPLIER';
  clientId?: string;
  supplierId?: string;
  client?: Client;
  supplier?: Supplier;
  balance: number;
  creditLimit?: number;
  alertThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  account?: Account;
  type: 'DEBIT' | 'CREDIT' | 'PAYMENT' | 'REFUND';
  amount: number;
  description?: string;
  documentUrl?: string;
  reference?: string;
  orderId?: string;
  invoiceId?: string;
  order?: { id: string; orderNumber: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface TransactionSummary {
  DEBIT: number;
  CREDIT: number;
  PAYMENT: number;
  REFUND: number;
  total: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  summary: TransactionSummary;
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateTransactionDto {
  accountId: string;
  type: 'DEBIT' | 'CREDIT' | 'PAYMENT' | 'REFUND';
  amount: number;
  description?: string;
  documentUrl?: string;
  reference?: string;
  orderId?: string;
  invoiceId?: string;
}
