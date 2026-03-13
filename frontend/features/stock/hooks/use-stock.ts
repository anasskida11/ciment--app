/**
 * Hook pour la gestion du stock
 */

import { useState, useEffect } from 'react';
import { stockService } from '../services/stock.service';
import type {
  StockRequest,
  DeliveryNote,
  StockReceipt,
  CreateStockRequestDto,
  CreateDeliveryNoteDto,
  CreateStockReceiptDto,
} from '../types';
import { useToast } from '@/hooks/use-toast';

export function useStock() {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchStockRequests = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockService.getAllStockRequests();
      setStockRequests(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل طلبات المخزون',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryNotes = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockService.getAllDeliveryNotes();
      setDeliveryNotes(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل أوراق التسليم',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReceipts = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockService.getAllStockReceipts();
      setStockReceipts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل إيصالات المخزون',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createStockRequest = async (data: CreateStockRequestDto) => {
    try {
      const newRequest = await stockService.createStockRequest(data);
      setStockRequests([...stockRequests, newRequest]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء طلب المخزون بنجاح',
      });
      return newRequest;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء طلب المخزون';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createDeliveryNote = async (data: CreateDeliveryNoteDto) => {
    try {
      const newNote = await stockService.createDeliveryNote(data);
      setDeliveryNotes([...deliveryNotes, newNote]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء ورقة التسليم بنجاح',
      });
      return newNote;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء ورقة التسليم';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const confirmDelivery = async (id: string) => {
    try {
      const confirmed = await stockService.confirmDelivery(id);
      setDeliveryNotes(deliveryNotes.map(n => n.id === id ? confirmed : n));
      toast({
        title: 'نجاح',
        description: 'تم تأكيد التسليم بنجاح',
      });
      return confirmed;
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

  const createStockReceipt = async (data: CreateStockReceiptDto) => {
    try {
      const newReceipt = await stockService.createStockReceipt(data);
      setStockReceipts([...stockReceipts, newReceipt]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء إيصال المخزون بنجاح',
      });
      return newReceipt;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء إيصال المخزون';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const confirmStockReceipt = async (id: string) => {
    try {
      const confirmed = await stockService.confirmStockReceipt(id);
      setStockReceipts(stockReceipts.map(r => r.id === id ? confirmed : r));
      toast({
        title: 'نجاح',
        description: 'تم تأكيد استلام المخزون بنجاح',
      });
      return confirmed;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تأكيد استلام المخزون';
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
    fetchStockRequests(false);
    fetchDeliveryNotes(false);
    fetchStockReceipts(false);
  }, []);

  return {
    stockRequests,
    deliveryNotes,
    stockReceipts,
    loading,
    error,
    refetch: () => {
      fetchStockRequests();
      fetchDeliveryNotes();
      fetchStockReceipts();
    },
    createStockRequest,
    createDeliveryNote,
    confirmDelivery,
    createStockReceipt,
    confirmStockReceipt,
  };
}
