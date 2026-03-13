/**
 * Service pour la gestion des assignations de trucks
 */

import { api } from '@/lib/api';
import type { TruckAssignment } from '../types';

export const truckAssignmentService = {
  getByOrderId: async (orderId: string): Promise<TruckAssignment[]> => {
    const response = await api.get<{ success: boolean; data: { assignments: TruckAssignment[] } }>(
      `/truck-assignments/order/${orderId}`
    );
    return response.success && response.data?.assignments ? response.data.assignments : [];
  },

  create: async (data: {
    orderId: string;
    truckId: string;
    quantity: number;
    driverName?: string;
  }): Promise<TruckAssignment> => {
    const response = await api.post<{ success: boolean; message?: string; data: { assignment: TruckAssignment } }>(
      '/truck-assignments',
      data
    );
    if (!response.success || !response.data?.assignment) {
      throw new Error(response.message || 'Failed to create assignment');
    }
    return response.data.assignment;
  },

  complete: async (id: string, data?: { deliveryCost?: number; notes?: string }): Promise<TruckAssignment> => {
    const response = await api.patch<{ success: boolean; message?: string; data: { assignment: TruckAssignment } }>(
      `/truck-assignments/${id}/complete`,
      data || {}
    );
    if (!response.success || !response.data?.assignment) {
      throw new Error(response.message || 'Failed to complete assignment');
    }
    return response.data.assignment;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/truck-assignments/${id}`);
  }
};
