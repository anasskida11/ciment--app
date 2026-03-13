/**
 * Types pour le module Stock
 */

import type { Product } from '@/features/products/types';
import type { Order } from '@/features/orders/types';

export interface StockRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  order?: Order;
  status: 'PENDING' | 'RECEIVED' | 'PROCESSED' | 'CANCELLED';
  items: StockRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockRequestItem {
  id: string;
  stockRequestId: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface DeliveryNote {
  id: string;
  noteNumber: string;
  orderId: string;
  order?: Order;
  status: 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress?: string;
  items: DeliveryNoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNoteItem {
  id: string;
  deliveryNoteId: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface StockReceipt {
  id: string;
  receiptNumber: string;
  supplierId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  documentUrl?: string;
  items: StockReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockReceiptItem {
  id: string;
  stockReceiptId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

export interface CreateStockRequestDto {
  orderId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateDeliveryNoteDto {
  orderId: string;
  deliveryAddress?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateStockReceiptDto {
  supplierId?: string;
  documentUrl?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
