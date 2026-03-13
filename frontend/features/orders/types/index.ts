/**
 * Types pour le module Commandes
 */

import type { Client } from '@/features/clients/types';
import type { Product } from '@/features/products/types';

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  client?: Client;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  truckAssignments?: {
    id: string;
    truckId: string;
    quantity: number;
    driverName?: string | null;
    deliveryCost?: number | null;
    status: 'ASSIGNED' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
    truck?: {
      id: string;
      matricule: string;
    };
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'QUOTE_SENT'
  | 'QUOTE_ACCEPTED'
  | 'CONFIRMED'
  | 'STOCK_REQUESTED'
  | 'IN_PREPARATION'
  | 'READY'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'CANCELLED';

export interface CreateOrderDto {
  clientId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
}
