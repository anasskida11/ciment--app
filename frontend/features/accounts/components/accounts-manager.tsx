/**
 * Gestionnaire de comptes - Composant principal
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertCircle } from 'lucide-react';
import { AccountSummary } from './account-summary';
import { AccountList } from './account-list';
import { AccountHistory } from './account-history';
import { TransactionList } from './transaction-list';
import { useAccounts } from '../hooks/use-accounts';
import { useClients } from '@/features/clients/hooks/use-clients';
import { clientService, supplierService } from '@/lib/api-services';
import { api } from '@/lib/api';
import type { Supplier } from '@/lib/api-types';
import type { Account } from '../types';

export function AccountsManager() {
  const { accounts, loading, error, fetchAllAccounts, createAccount, createTransaction, updateAccount, deleteAccount } = useAccounts();
  const { clients, refetch: fetchClients } = useClients();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'CLIENT' | 'SUPPLIER'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [isCreating, setIsCreating] = useState(false);

  // Create form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // History modal
  const [historyAccount, setHistoryAccount] = useState<Account | null>(null);

  // Balance adjustment dialog
  const [balanceAccount, setBalanceAccount] = useState<Account | null>(null);
  const [txType, setTxType] = useState<'CREDIT' | 'DEBIT' | 'PAYMENT' | 'REFUND'>('PAYMENT');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Edit dialog
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [editAlertThreshold, setEditAlertThreshold] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setSuppliersLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: { suppliers: Supplier[] } }>('/suppliers');
      setSuppliers(response.success && response.data?.suppliers ? response.data.suppliers : []);
    } catch (error) {
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Load all accounts in one call
  useEffect(() => {
    fetchAllAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const existingClientIds = new Set(accounts.filter(a => a.clientId).map(a => a.clientId as string));
  const existingSupplierIds = new Set(accounts.filter(a => a.supplierId).map(a => a.supplierId as string));
  const availableClients = clients.filter(c => !existingClientIds.has(c.id));
  const availableSuppliers = suppliers.filter(s => !existingSupplierIds.has(s.id));

  const handleCreateAccount = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      if (createType === 'CLIENT') {
        const res: any = await clientService.create({ name: newName, phone: newPhone || undefined, email: newEmail || undefined } as any);
        const created = res?.data?.client || res;
        await createAccount({ accountType: 'CLIENT', clientId: created.id });
        fetchClients();
      } else {
        const res: any = await supplierService.create({ name: newName, phone: newPhone || undefined, email: newEmail || undefined } as any);
        const created = res?.data?.supplier || res;
        // Supplier may auto-create account, refresh all
        await fetchAllAccounts();
        fetchSuppliers();
      }

      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleHistory = (account: Account) => {
    setHistoryAccount(account);
  };

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setEditCreditLimit(account.creditLimit?.toString() || '');
    setEditAlertThreshold(account.alertThreshold?.toString() || '');
  };

  const handleEditSubmit = async () => {
    if (!editAccount) return;
    setEditSubmitting(true);
    try {
      await updateAccount(editAccount.id, {
        creditLimit: editCreditLimit ? parseFloat(editCreditLimit) : undefined,
        alertThreshold: editAlertThreshold ? parseFloat(editAlertThreshold) : undefined,
      });
      setEditAccount(null);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account) setDeleteTarget(account);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleAdjustBalance = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account) {
      setBalanceAccount(account);
      setTxType('PAYMENT');
      setTxAmount('');
      setTxDescription('');
    }
  };

  const handleBalanceSubmit = async () => {
    if (!balanceAccount || !txAmount) return;
    setTxSubmitting(true);
    try {
      await createTransaction({
        accountId: balanceAccount.id,
        type: txType,
        amount: parseFloat(txAmount),
        description: txDescription || undefined,
      });
      setBalanceAccount(null);
    } finally {
      setTxSubmitting(false);
    }
  };

  // Refresh trigger for transaction list
  const [txRefreshKey, setTxRefreshKey] = useState(0);
  const refreshTransactions = useCallback(() => setTxRefreshKey(k => k + 1), []);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">إدارة الحسابات والمعاملات</h1>
        <p className="text-muted-foreground">إدارة أرصدة العملاء والموردين ومتابعة المعاملات المالية</p>
      </div>

      {/* Account Summary */}
      <AccountSummary accounts={accounts} clientsCount={clients.length} suppliersCount={suppliers.length} />

      {/* Tabs: Accounts | Transactions */}
      <Tabs defaultValue="accounts" dir="rtl" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="accounts">الحسابات</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
        </TabsList>

        {/* ===== Accounts Tab ===== */}
        <TabsContent value="accounts" className="space-y-4 mt-4">

      {/* Error display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-destructive">خطأ في تحميل البيانات</p>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchAllAccounts()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="ابحث بالاسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="نوع الحساب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="CLIENT">عميل</SelectItem>
            <SelectItem value="SUPPLIER">مورد</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              حساب جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء حساب جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل أو المورد لإنشاء حساب جديد.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select value={createType} onValueChange={(value) => setCreateType(value as 'CLIENT' | 'SUPPLIER')}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">عميل</SelectItem>
                    <SelectItem value="SUPPLIER">مورد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={createType === 'CLIENT' ? 'اسم العميل' : 'اسم المورد'}
                />
              </div>
              <div className="space-y-1">
                <Label>رقم الهاتف</Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                  type="tel"
                />
              </div>
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={isCreating || !newName.trim()}
                className="w-full"
              >
                {isCreating ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <AccountList
        accounts={accounts}
        searchTerm={searchTerm}
        selectedType={selectedType}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdjustBalance={handleAdjustBalance}
        onHistory={handleHistory}
      />

        </TabsContent>

        {/* ===== Transactions Tab ===== */}
        <TabsContent value="transactions" className="mt-4">
          <TransactionList key={txRefreshKey} accounts={accounts} onTransactionCreated={refreshTransactions} />
        </TabsContent>
      </Tabs>

      {/* History Modal */}
      {historyAccount && (
        <AccountHistory
          account={historyAccount}
          open={!!historyAccount}
          onClose={() => setHistoryAccount(null)}
        />
      )}

      {/* Balance Adjustment Dialog */}
      <Dialog open={!!balanceAccount} onOpenChange={(open) => !open && setBalanceAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الرصيد</DialogTitle>
            <DialogDescription>
              {balanceAccount?.client?.name || balanceAccount?.supplier?.name || ''} — الرصيد الحالي: {balanceAccount?.balance ?? 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نوع المعاملة</Label>
              <Select value={txType} onValueChange={(v) => setTxType(v as typeof txType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT">دفعة</SelectItem>
                  <SelectItem value="CREDIT">إضافة رصيد</SelectItem>
                  <SelectItem value="DEBIT">خصم</SelectItem>
                  <SelectItem value="REFUND">استرداد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input type="number" min="0" step="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input value={txDescription} onChange={(e) => setTxDescription(e.target.value)} placeholder="وصف المعاملة" />
            </div>
            <Button onClick={handleBalanceSubmit} disabled={txSubmitting || !txAmount || parseFloat(txAmount) <= 0} className="w-full">
              {txSubmitting ? 'جاري التنفيذ...' : 'تنفيذ المعاملة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editAccount} onOpenChange={(open) => !open && setEditAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الحساب</DialogTitle>
            <DialogDescription>
              {editAccount?.client?.name || editAccount?.supplier?.name || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>حد الائتمان</Label>
              <Input type="number" min="0" step="0.01" value={editCreditLimit} onChange={(e) => setEditCreditLimit(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>حد التنبيه</Label>
              <Input type="number" min="0" step="0.01" value={editAlertThreshold} onChange={(e) => setEditAlertThreshold(e.target.value)} placeholder="0.00" />
            </div>
            <Button onClick={handleEditSubmit} disabled={editSubmitting} className="w-full">
              {editSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف حساب {deleteTarget?.client?.name || deleteTarget?.supplier?.name || ''}؟ سيتم حذف الحساب والعميل/المورد المرتبط نهائياً.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteSubmitting}>
              {deleteSubmitting ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
