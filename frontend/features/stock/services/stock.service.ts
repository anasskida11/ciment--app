/**
 * Service pour la gestion du stock
 */

import { api } from '@/lib/api';
import type {
  StockRequest,
  DeliveryNote,
  StockReceipt,
  CreateStockRequestDto,
  CreateDeliveryNoteDto,
  CreateStockReceiptDto,
} from '../types';

export const stockService = {
  // Stock Requests
  getAllStockRequests: async (): Promise<StockRequest[]> => {
    const response = await api.get<{ success: boolean; data: { stockRequests: StockRequest[] } }>('/stock-requests');
    return response.success && response.data?.stockRequests ? response.data.stockRequests : [];
  },

  getStockRequestById: async (id: string): Promise<StockRequest> => {
    const response = await api.get<{ success: boolean; data: { stockRequest: StockRequest } }>(`/stock-requests/${id}`);
    if (!response.success || !response.data?.stockRequest) {
      throw new Error('Stock request not found');
    }
    return response.data.stockRequest;
  },

  createStockRequest: async (data: CreateStockRequestDto): Promise<StockRequest> => {
    const response = await api.post<{ success: boolean; data: { stockRequest: StockRequest } }>('/stock-requests', data);
    if (!response.success || !response.data?.stockRequest) {
      throw new Error('Failed to create stock request');
    }
    return response.data.stockRequest;
  },

  receiveStockRequest: async (id: string): Promise<StockRequest> => {
    const response = await api.put<{ success: boolean; data: { stockRequest: StockRequest } }>(`/stock-requests/${id}/receive`);
    if (!response.success || !response.data?.stockRequest) {
      throw new Error('Failed to receive stock request');
    }
    return response.data.stockRequest;
  },

  // Delivery Notes
  getAllDeliveryNotes: async (): Promise<DeliveryNote[]> => {
    const response = await api.get<{ success: boolean; data: { deliveryNotes: DeliveryNote[] } }>('/delivery-notes');
    return response.success && response.data?.deliveryNotes ? response.data.deliveryNotes : [];
  },

  getDeliveryNoteById: async (id: string): Promise<DeliveryNote> => {
    const response = await api.get<{ success: boolean; data: { deliveryNote: DeliveryNote } }>(`/delivery-notes/${id}`);
    if (!response.success || !response.data?.deliveryNote) {
      throw new Error('Delivery note not found');
    }
    return response.data.deliveryNote;
  },

  createDeliveryNote: async (data: CreateDeliveryNoteDto): Promise<DeliveryNote> => {
    const response = await api.post<{ success: boolean; data: { deliveryNote: DeliveryNote } }>('/delivery-notes', data);
    if (!response.success || !response.data?.deliveryNote) {
      throw new Error('Failed to create delivery note');
    }
    return response.data.deliveryNote;
  },

  confirmDelivery: async (id: string): Promise<DeliveryNote> => {
    const response = await api.put<{ success: boolean; data: { deliveryNote: DeliveryNote } }>(`/delivery-notes/${id}/confirm`);
    if (!response.success || !response.data?.deliveryNote) {
      throw new Error('Failed to confirm delivery');
    }
    return response.data.deliveryNote;
  },

  // Stock Receipts
  getAllStockReceipts: async (): Promise<StockReceipt[]> => {
    const response = await api.get<{ success: boolean; data: { stockReceipts: StockReceipt[] } }>('/stock-receipts');
    return response.success && response.data?.stockReceipts ? response.data.stockReceipts : [];
  },

  getStockReceiptById: async (id: string): Promise<StockReceipt> => {
    const response = await api.get<{ success: boolean; data: { stockReceipt: StockReceipt } }>(`/stock-receipts/${id}`);
    if (!response.success || !response.data?.stockReceipt) {
      throw new Error('Stock receipt not found');
    }
    return response.data.stockReceipt;
  },

  createStockReceipt: async (data: CreateStockReceiptDto): Promise<StockReceipt> => {
    const response = await api.post<{ success: boolean; data: { stockReceipt: StockReceipt } }>('/stock-receipts', data);
    if (!response.success || !response.data?.stockReceipt) {
      throw new Error('Failed to create stock receipt');
    }
    return response.data.stockReceipt;
  },

  confirmStockReceipt: async (id: string): Promise<StockReceipt> => {
    const response = await api.put<{ success: boolean; data: { stockReceipt: StockReceipt } }>(`/stock-receipts/${id}/confirm`);
    if (!response.success || !response.data?.stockReceipt) {
      throw new Error('Failed to confirm stock receipt');
    }
    return response.data.stockReceipt;
  },
};
