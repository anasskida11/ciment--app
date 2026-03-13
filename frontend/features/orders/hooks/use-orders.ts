/**
 * Hook pour la gestion des commandes
 */

import { useState, useEffect } from 'react';
import { orderService } from '../services/order.service';
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchOrders = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      // Only show toast if explicitly requested (not on initial load)
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل الطلبات',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderDto) => {
    try {
      const newOrder = await orderService.create(data);
      setOrders([...orders, newOrder]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء الطلب بنجاح',
      });
      return newOrder;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء الطلب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, data: UpdateOrderDto) => {
    try {
      const updated = await orderService.update(id, data);
      setOrders(orders.map(o => o.id === id ? updated : o));
      toast({
        title: 'نجاح',
        description: 'تم تحديث الطلب بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث الطلب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const confirmOrder = async (id: string) => {
    try {
      const confirmed = await orderService.confirm(id);
      setOrders(orders.map(o => o.id === id ? confirmed : o));
      toast({
        title: 'نجاح',
        description: 'تم تأكيد الطلب بنجاح',
      });
      return confirmed;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تأكيد الطلب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markAsDelivered = async (id: string) => {
    try {
      const delivered = await orderService.markAsDelivered(id);
      setOrders(orders.map(o => o.id === id ? delivered : o));
      toast({
        title: 'نجاح',
        description: 'تم تأكيد تسليم الطلب بنجاح',
      });
      return delivered;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تأكيد التسليم';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const rejectOrder = async (id: string) => {
    try {
      const rejected = await orderService.reject(id);
      setOrders(orders.map(o => o.id === id ? rejected : o));
      toast({
        title: 'نجاح',
        description: 'تم رفض الطلب بنجاح',
      });
      return rejected;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في رفض الطلب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderService.delete(id);
      setOrders(orders.filter(o => o.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف الطلب بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في حذف الطلب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    // Don't show error toast on initial load
    fetchOrders(false);
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrder,
    confirmOrder,
    markAsDelivered,
    rejectOrder,
    deleteOrder,
  };
}
