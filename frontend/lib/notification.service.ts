import { api } from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<{ success: boolean; data: Notification[] }>('/notifications');
    return response.success && response.data ? response.data : [];
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
