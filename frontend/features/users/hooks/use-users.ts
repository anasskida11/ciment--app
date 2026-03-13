/**
 * Hook pour la gestion des utilisateurs
 */

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '../services/user.service';
import type { User, CreateUserDto, UpdateUserDto } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المستخدمين',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto) => {
    try {
      const newUser = await userService.create(data);
      setUsers((prev) => [newUser, ...prev]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء المستخدم بنجاح (كلمة المرور الافتراضية: 00000000)',
      });
      return newUser;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء المستخدم';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateUser = async (id: string, data: UpdateUserDto) => {
    try {
      const updated = await userService.update(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      toast({
        title: 'نجاح',
        description: 'تم تحديث المستخدم بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث المستخدم';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف المستخدم بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في حذف المستخدم';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetUserPassword = async (id: string) => {
    try {
      await userService.resetPassword(id);
      toast({
        title: 'نجاح',
        description: 'تمت إعادة تعيين كلمة المرور إلى 00000000',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إعادة تعيين كلمة المرور';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers(false);
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
  };
}
