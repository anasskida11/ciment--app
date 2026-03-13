/**
 * Service pour la gestion des véhicules
 */

import { api } from '@/lib/api';
import type {
  Truck,
  TruckMaintenance,
  TruckFuel,
  TruckExpense,
  CreateTruckDto,
  UpdateTruckDto,
} from '../types';

export const truckService = {
  // Trucks
  getAll: async (): Promise<Truck[]> => {
    const response = await api.get<{ success: boolean; data: { trucks: Truck[] } }>('/trucks');
    return response.success && response.data?.trucks ? response.data.trucks : [];
  },

  getAvailable: async (): Promise<Truck[]> => {
    const response = await api.get<{ success: boolean; data: { trucks: Truck[] } }>('/trucks/available');
    return response.success && response.data?.trucks ? response.data.trucks : [];
  },

  getById: async (id: string): Promise<Truck> => {
    const response = await api.get<{ success: boolean; data: { truck: Truck } }>(`/trucks/${id}`);
    if (!response.success || !response.data?.truck) {
      throw new Error('Truck not found');
    }
    return response.data.truck;
  },

  create: async (data: CreateTruckDto): Promise<Truck> => {
    const response = await api.post<{ success: boolean; data: { truck: Truck } }>('/trucks', data);
    if (!response.success || !response.data?.truck) {
      throw new Error('Failed to create truck');
    }
    return response.data.truck;
  },

  update: async (id: string, data: UpdateTruckDto): Promise<Truck> => {
    const response = await api.put<{ success: boolean; data: { truck: Truck } }>(`/trucks/${id}`, data);
    if (!response.success || !response.data?.truck) {
      throw new Error('Failed to update truck');
    }
    return response.data.truck;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trucks/${id}`);
  },

  // Maintenance
  addMaintenance: async (id: string, data: Omit<TruckMaintenance, 'id' | 'truckId'>): Promise<TruckMaintenance> => {
    const response = await api.post<{ success: boolean; data: { maintenance: TruckMaintenance } }>(`/trucks/${id}/maintenance`, data);
    if (!response.success || !response.data?.maintenance) {
      throw new Error('Failed to add maintenance');
    }
    return response.data.maintenance;
  },

  // Fuel
  addFuel: async (id: string, data: Omit<TruckFuel, 'id' | 'truckId'>): Promise<TruckFuel> => {
    const response = await api.post<{ success: boolean; data: { fuel: TruckFuel } }>(`/trucks/${id}/fuel`, data);
    if (!response.success || !response.data?.fuel) {
      throw new Error('Failed to add fuel record');
    }
    return response.data.fuel;
  },

  // Expenses
  addExpense: async (id: string, data: Omit<TruckExpense, 'id' | 'truckId'>): Promise<TruckExpense> => {
    const response = await api.post<{ success: boolean; data: { expense: TruckExpense } }>(`/trucks/${id}/expense`, data);
    if (!response.success || !response.data?.expense) {
      throw new Error('Failed to add expense');
    }
    return response.data.expense;
  },
};
