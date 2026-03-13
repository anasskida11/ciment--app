/**
 * Service API pour les utilisateurs
 */

import { api } from '@/lib/api';
import type { User, CreateUserDto, UpdateUserDto } from '../types';

type UsersResponse = {
  success: boolean;
  data?: { users: User[] };
};

type UserResponse = {
  success: boolean;
  data?: { user: User };
};

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<UsersResponse>('/users');
    return response.data?.users || [];
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<UserResponse>('/users', data);
    if (!response.data?.user) {
      throw new Error('فشل في إنشاء المستخدم');
    }
    return response.data.user;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    if (!response.data?.user) {
      throw new Error('فشل في تحديث المستخدم');
    }
    return response.data.user;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async resetPassword(id: string): Promise<void> {
    await api.put(`/users/${id}/reset-password`);
  },
};
