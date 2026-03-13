/**
 * Hook pour la gestion des clients
 */

import { useState, useEffect } from 'react';
import { clientService } from '../services/client.service';
import type { Client, CreateClientDto, UpdateClientDto } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchClients = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      // Only show toast if explicitly requested (not on initial load)
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل العملاء',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (data: CreateClientDto) => {
    try {
      const newClient = await clientService.create(data);
      setClients([...clients, newClient]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء العميل بنجاح',
      });
      return newClient;
    } catch (err: any) {
      // Extraire le message d'erreur correctement
      let errorMessage = 'فشل في إنشاء العميل';
      
      // Gérer différents types d'erreurs
      if (err) {
        if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          // Si l'erreur est un objet vide, essayer de stringifier
          try {
            const errStr = JSON.stringify(err);
            if (errStr !== '{}') {
              errorMessage = errStr;
            }
          } catch {
            // Ignore
          }
        }
      }
      
      // Traduire les messages d'erreur en arabe si nécessaire
      if (errorMessage.includes('connexion') || errorMessage.includes('serveur') || errorMessage.includes('backend') || errorMessage.includes('connecter')) {
        errorMessage = 'خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على المنفذ 3000';
      } else if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم على http://localhost:3000';
      } else if (err?.status === 0 || (err?.status === undefined && !err?.message)) {
        errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم';
      } else if (err?.status === 401) {
        errorMessage = 'غير مصرح. يرجى تسجيل الدخول';
      } else if (err?.status === 400) {
        errorMessage = errorMessage || 'البيانات غير صحيحة. تحقق من الحقول المملوءة';
      } else if (err?.status === 500) {
        errorMessage = 'خطأ في الخادم. تحقق من سجلات الخادم';
      }
      
      // Log détaillé pour debugging
      const errorDetails = {
        error: err,
        errorString: String(err),
        errorJson: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        message: errorMessage,
        status: err?.status,
        type: typeof err,
        isError: err instanceof Error,
        keys: err ? Object.keys(err) : []
      };
      console.error('Error creating client - Full error:', errorDetails);
      
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Créer une nouvelle erreur avec le message pour qu'elle soit propagée correctement
      const finalError = new Error(errorMessage);
      if (err?.status) {
        (finalError as any).status = err.status;
      }
      throw finalError;
    }
  };

  const updateClient = async (id: string, data: UpdateClientDto) => {
    try {
      const updated = await clientService.update(id, data);
      setClients(clients.map(c => c.id === id ? updated : c));
      toast({
        title: 'نجاح',
        description: 'تم تحديث العميل بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث العميل';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      setClients(clients.filter(c => c.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف العميل بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في حذف العميل';
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
    fetchClients(false);
  }, []);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
