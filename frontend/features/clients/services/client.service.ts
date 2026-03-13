/**
 * Service pour la gestion des clients
 */

import { api } from '@/lib/api';
import type { Client, CreateClientDto, UpdateClientDto } from '../types';

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<{ success: boolean; data: { clients: Client[] } }>('/clients');
    return response.success && response.data?.clients ? response.data.clients : [];
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get<{ success: boolean; data: { client: Client } }>(`/clients/${id}`);
    if (!response.success || !response.data?.client) {
      throw new Error('Client not found');
    }
    return response.data.client;
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    try {
      const response = await api.post<{ success: boolean; message?: string; data: { client: Client } }>('/clients', data);
      if (!response.success || !response.data?.client) {
        throw new Error(response.message || 'Failed to create client');
      }
      return response.data.client;
    } catch (error: any) {
      // Si l'erreur vient de l'API, elle a déjà un message
      if (error.message) {
        throw error;
      }
      // Sinon, créer une erreur avec un message
      throw new Error(error.message || 'Failed to create client');
    }
  },

  update: async (id: string, data: UpdateClientDto): Promise<Client> => {
    const response = await api.put<{ success: boolean; data: { client: Client } }>(`/clients/${id}`, data);
    if (!response.success || !response.data?.client) {
      throw new Error('Failed to update client');
    }
    return response.data.client;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
