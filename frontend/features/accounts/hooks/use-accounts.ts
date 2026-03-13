/**
 * Hook pour la gestion des comptes
 */

import { useState, useEffect, useCallback } from 'react';
import { accountService } from '../services/account.service';
import type { Account, Transaction, CreateTransactionDto } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch ALL accounts in one call (preferred)
  const fetchAllAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allAccounts = await accountService.getAll();
      setAccounts(allAccounts);
      return allAccounts;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'خطأ في تحميل الحسابات',
        description: error.message || 'فشل في تحميل الحسابات',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAccountByClientId = async (clientId: string, showError = false) => {
    setLoading(true);
    setError(null);
    try {
      const account = await accountService.getByClientId(clientId);
      // Si le compte n'existe pas encore, c'est normal, ne pas lever d'erreur
      if (account) {
        setAccounts(prev => [...prev.filter(a => a.id !== account.id), account]);
      }
      return account;
    } catch (err) {
      const error = err as Error;
      setError(error);
      // Ne pas afficher de toast pour les comptes manquants (ils peuvent ne pas exister encore)
      // Seulement afficher pour les vraies erreurs (réseau, serveur, etc.)
      if (showError && error.message && !error.message.includes('not found') && !error.message.includes('non trouvée')) {
        const errorMessage = error.message || 'فشل في تحميل الحساب';
        toast({
          title: 'خطأ',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountBySupplierId = async (supplierId: string, showError = false) => {
    setLoading(true);
    setError(null);
    try {
      const account = await accountService.getBySupplierId(supplierId);
      if (account) {
        setAccounts(prev => [...prev.filter(a => a.id !== account.id), account]);
      }
      return account;
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError && error.message && !error.message.includes('not found') && !error.message.includes('non trouvée')) {
        const errorMessage = error.message || 'فشل في تحميل الحساب';
        toast({
          title: 'خطأ',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsByAccountId = async (accountId: string, showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getTransactionsByAccountId(accountId);
      setTransactions(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المعاملات',
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: CreateTransactionDto) => {
    try {
      const newTransaction = await accountService.createTransaction(data);
      setTransactions([...transactions, newTransaction]);
      
      // Update account balance
      const account = accounts.find(a => a.id === data.accountId);
      if (account) {
        const updatedBalance = data.type === 'CREDIT' || data.type === 'REFUND'
          ? account.balance + data.amount
          : account.balance - data.amount;
        setAccounts(prev => prev.map(a => 
          a.id === data.accountId 
            ? { ...a, balance: updatedBalance }
            : a
        ));
      }

      toast({
        title: 'نجاح',
        description: 'تم إنشاء المعاملة بنجاح',
      });
      return newTransaction;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء المعاملة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    try {
      const updated = await accountService.update(id, data);
      setAccounts(prev => prev.map(a => a.id === id ? updated : a));
      toast({
        title: 'نجاح',
        description: 'تم تحديث الحساب بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث الحساب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createAccount = async (data: { accountType: 'CLIENT' | 'SUPPLIER'; clientId?: string; supplierId?: string }) => {
    try {
      const created = await accountService.create(data);
      setAccounts(prev => [...prev, created]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء الحساب بنجاح',
      });
      return created;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء الحساب';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await accountService.delete(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف الحساب بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في حذف الحساب',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    accounts,
    transactions,
    loading,
    error,
    fetchAllAccounts,
    fetchAccountByClientId,
    fetchAccountBySupplierId,
    fetchTransactionsByAccountId,
    createTransaction,
    updateAccount,
    createAccount,
    deleteAccount,
  };
}
