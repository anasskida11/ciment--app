/**
 * Hook pour la gestion des assignations de trucks
 */

import { useState } from 'react';
import { truckAssignmentService } from '../services/truck-assignment.service';
import type { TruckAssignment } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useTruckAssignments() {
  const [assignments, setAssignments] = useState<TruckAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchByOrderId = async (orderId: string, showError = true) => {
    setLoading(true);
    try {
      const data = await truckAssignmentService.getByOrderId(orderId);
      setAssignments(data);
      return data;
    } catch (err: any) {
      if (showError) {
        toast({
          title: 'خطأ',
          description: err?.message || 'فشل في تحميل التعيينات',
          variant: 'destructive'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (data: {
    orderId: string;
    truckId: string;
    quantity: number;
    driverName?: string;
  }) => {
    setLoading(true);
    try {
      const created = await truckAssignmentService.create(data);
      setAssignments((prev) => [created, ...prev]);
      toast({
        title: 'نجاح',
        description: 'تم تعيين السيارة بنجاح'
      });
      return created;
    } catch (err: any) {
      toast({
        title: 'خطأ',
        description: err?.message || 'فشل في تعيين السيارة',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    setLoading(true);
    try {
      await truckAssignmentService.delete(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: 'تم الحذف',
        description: 'تم حذف التعيين'
      });
    } catch (err: any) {
      toast({
        title: 'خطأ',
        description: err?.message || 'فشل في حذف التعيين',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeAssignment = async (id: string, data?: { deliveryCost?: number; notes?: string }) => {
    setLoading(true);
    try {
      const updated = await truckAssignmentService.complete(id, data);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast({
        title: 'نجاح',
        description: 'تم إنهاء التوصيل وتحرير السيارة'
      });
      return updated;
    } catch (err: any) {
      toast({
        title: 'خطأ',
        description: err?.message || 'فشل في إنهاء التوصيل',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignments,
    loading,
    fetchByOrderId,
    createAssignment,
    completeAssignment,
    deleteAssignment,
    setAssignments
  };
}
