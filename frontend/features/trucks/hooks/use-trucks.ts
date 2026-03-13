/**
 * Hook pour la gestion des véhicules
 */

import { useState, useEffect } from 'react';
import { truckService } from '../services/truck.service';
import type {
  Truck,
  TruckMaintenance,
  TruckFuel,
  TruckExpense,
  CreateTruckDto,
  UpdateTruckDto,
} from '../types';
import { useToast } from '@/hooks/use-toast';

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTrucks = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await truckService.getAll();
      setTrucks(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل السيارات',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrucks = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await truckService.getAvailable();
      setAvailableTrucks(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل السيارات المتاحة',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createTruck = async (data: CreateTruckDto) => {
    try {
      const newTruck = await truckService.create(data);
      setTrucks([...trucks, newTruck]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء السيارة بنجاح',
      });
      return newTruck;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء السيارة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTruck = async (id: string, data: UpdateTruckDto) => {
    try {
      const updated = await truckService.update(id, data);
      setTrucks(trucks.map(t => t.id === id ? updated : t));
      toast({
        title: 'نجاح',
        description: 'تم تحديث السيارة بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث السيارة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTruck = async (id: string) => {
    try {
      await truckService.delete(id);
      setTrucks(trucks.filter(t => t.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف السيارة بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في حذف السيارة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addMaintenance = async (id: string, data: Omit<TruckMaintenance, 'id' | 'truckId'>) => {
    try {
      const maintenance = await truckService.addMaintenance(id, data);
      toast({
        title: 'نجاح',
        description: 'تم إضافة سجل الصيانة بنجاح',
      });
      return maintenance;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إضافة سجل الصيانة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addFuel = async (id: string, data: Omit<TruckFuel, 'id' | 'truckId'>) => {
    try {
      const fuel = await truckService.addFuel(id, data);
      toast({
        title: 'نجاح',
        description: 'تم إضافة سجل الوقود بنجاح',
      });
      return fuel;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إضافة سجل الوقود';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addExpense = async (id: string, data: Omit<TruckExpense, 'id' | 'truckId'>) => {
    try {
      const expense = await truckService.addExpense(id, data);
      toast({
        title: 'نجاح',
        description: 'تم إضافة المصروف بنجاح',
      });
      return expense;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إضافة المصروف';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    // Don't show error toasts on initial load
    fetchTrucks(false);
    fetchAvailableTrucks(false);
  }, []);

  return {
    trucks,
    availableTrucks,
    loading,
    error,
    refetch: fetchTrucks,
    refetchAvailable: fetchAvailableTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
    addMaintenance,
    addFuel,
    addExpense,
  };
}
