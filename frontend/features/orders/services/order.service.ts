/**
 * Service pour la gestion des commandes
 */

import { api } from '@/lib/api';
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types';

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<{ success: boolean; data: { orders: Order[] } }>('/orders');
    return response.success && response.data?.orders ? response.data.orders : [];
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<{ success: boolean; data: { order: Order } }>(`/orders/${id}`);
    if (!response.success || !response.data?.order) {
      throw new Error('Order not found');
    }
    return response.data.order;
  },

  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post<{ success: boolean; data: { order: Order } }>('/orders', data);
    if (!response.success || !response.data?.order) {
      throw new Error('Failed to create order');
    }
    return response.data.order;
  },

  update: async (id: string, data: UpdateOrderDto): Promise<Order> => {
    const response = await api.put<{ success: boolean; data: { order: Order } }>(`/orders/${id}`, data);
    if (!response.success || !response.data?.order) {
      throw new Error('Failed to update order');
    }
    return response.data.order;
  },

  confirm: async (id: string): Promise<Order> => {
    const response = await api.put<{ success: boolean; data: { order: Order } }>(`/orders/${id}/confirm`);
    if (!response.success || !response.data?.order) {
      throw new Error('Failed to confirm order');
    }
    return response.data.order;
  },

  reject: async (id: string): Promise<Order> => {
    const response = await api.put<{ success: boolean; data: { order: Order } }>(`/orders/${id}`, {
      status: 'CANCELLED',
    });
    if (!response.success || !response.data?.order) {
      throw new Error('Failed to reject order');
    }
    return response.data.order;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  markAsDelivered: async (id: string): Promise<Order> => {
    const response = await api.put<{ success: boolean; data: { order: Order } }>(`/orders/${id}/deliver`);
    if (!response.success || !response.data?.order) {
      throw new Error('Failed to mark order as delivered');
    }
    return response.data.order;
  },
};
