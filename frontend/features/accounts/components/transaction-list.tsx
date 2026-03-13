/**
 * قائمة المعاملات - إدارة شاملة للمعاملات
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { accountService } from '../services/account.service';
import { formatCurrency, formatDate, formatDateTime } from '@/shared/utils/format';
import type { Account, Transaction, TransactionSummary } from '../types';

interface TransactionListProps {
  accounts: Account[];
  onTransactionCreated?: () => void;
}

const txTypeLabels: Record<string, string> = {
  DEBIT: 'مدين',
  CREDIT: 'دائن',
  PAYMENT: 'دفعة',
  REFUND: 'استرداد',
};

const txTypeBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DEBIT: 'destructive',
  CREDIT: 'default',
  PAYMENT: 'secondary',
  REFUND: 'outline',
};

function getAccountName(tx: Transaction): string {
  if (tx.account?.client?.name) return tx.account.client.name;
  if (tx.account?.supplier?.name) return tx.account.supplier.name;
  return 'غير محدد';
}

function getAccountType(tx: Transaction): string {
  return tx.account?.accountType === 'SUPPLIER' ? 'مورد' : 'عميل';
}

export function TransactionList({ accounts, onTransactionCreated }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({ DEBIT: 0, CREDIT: 0, PAYMENT: 0, REFUND: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create transaction dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newType, setNewType] = useState<'CREDIT' | 'DEBIT' | 'PAYMENT' | 'REFUND'>('PAYMENT');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReference, setNewReference] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 30 };
      if (filterType !== 'all') params.type = filterType;
      if (filterAccountId !== 'all') params.accountId = filterAccountId;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await accountService.getAllTransactions(params);
      setTransactions(res.transactions);
      setSummary(res.summary);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterAccountId, searchTerm, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterType, filterAccountId, searchTerm, startDate, endDate]);

  const handleCreateTransaction = async () => {
    if (!newAccountId || !newAmount || parseFloat(newAmount) <= 0) return;
    setCreating(true);
    try {
      await accountService.createTransaction({
        accountId: newAccountId,
        type: newType,
        amount: parseFloat(newAmount),
        description: newDescription || undefined,
        reference: newReference || undefined,
      });
      setIsCreateOpen(false);
      setNewAccountId('');
      setNewAmount('');
      setNewDescription('');
      setNewReference('');
      setNewType('PAYMENT');
      fetchTransactions();
      onTransactionCreated?.();
    } catch {
      // error handled by service
    } finally {
      setCreating(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const summaryCards = [
    { label: 'المدفوعات', value: summary.PAYMENT, icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الدائن', value: summary.CREDIT, icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'المدين', value: summary.DEBIT, icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'الاسترداد', value: summary.REFUND, icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className={`text-sm font-bold ${card.color}`}>{formatCurrency(card.value)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="PAYMENT">دفعة</SelectItem>
            <SelectItem value="CREDIT">دائن</SelectItem>
            <SelectItem value="DEBIT">مدين</SelectItem>
            <SelectItem value="REFUND">استرداد</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 ml-1" />
          فلاتر
        </Button>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 ml-1" />
          معاملة جديدة
        </Button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">الحساب</Label>
                <Select value={filterAccountId} onValueChange={setFilterAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="كل الحسابات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحسابات</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.client?.name || acc.supplier?.name || acc.id.slice(0, 8)} ({acc.accountType === 'CLIENT' ? 'عميل' : 'مورد'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">من تاريخ</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">إلى تاريخ</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            {(filterAccountId !== 'all' || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => { setFilterAccountId('all'); setStartDate(''); setEndDate(''); }}
              >
                مسح الفلاتر
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>المعاملات ({total})</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm font-normal">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border overflow-hidden">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحساب</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right hidden md:table-cell">الوصف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد معاملات
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const isExpanded = expandedId === tx.id;
                    const isDebitType = tx.type === 'DEBIT' || tx.type === 'PAYMENT';
                    return (
                      <TableRow
                        key={tx.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(tx.id)}
                      >
                        <TableCell className="p-2">
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </TableCell>
                        <TableCell className="text-right text-sm whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium">{getAccountName(tx)}</span>
                            <span className="text-xs text-muted-foreground mr-2">({getAccountType(tx)})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={txTypeBadgeVariant[tx.type] || 'outline'}>
                            {txTypeLabels[tx.type] || tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap">
                          <span className={isDebitType ? 'text-red-600' : 'text-green-600'}>
                            {isDebitType ? '-' : '+'}{formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                          {tx.description || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Expanded details — render outside table to avoid nesting issues */}
            {expandedId && (() => {
              const tx = transactions.find(t => t.id === expandedId);
              if (!tx) return null;
              const isDebitType = tx.type === 'DEBIT' || tx.type === 'PAYMENT';
              return (
                <div className="border-t bg-muted/30 px-6 py-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">الحساب</span>
                      <span className="font-medium">{getAccountName(tx)}</span>
                      <span className="text-xs text-muted-foreground mr-1">({getAccountType(tx)})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">النوع</span>
                      <Badge variant={txTypeBadgeVariant[tx.type]}>{txTypeLabels[tx.type]}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">المبلغ</span>
                      <span className={`font-bold ${isDebitType ? 'text-red-600' : 'text-green-600'}`}>
                        {isDebitType ? '-' : '+'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">التاريخ والوقت</span>
                      <span>{formatDateTime(tx.createdAt)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">الوصف</span>
                      <span>{tx.description || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">المرجع</span>
                      <span>{tx.reference || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">رقم الطلب</span>
                      <span>{tx.order?.orderNumber ? `#${tx.order.orderNumber}` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">بواسطة</span>
                      <span>{tx.createdBy ? `${tx.createdBy.firstName} ${tx.createdBy.lastName}` : '—'}</span>
                    </div>
                  </div>
                  {tx.account && (
                    <div className="pt-2 border-t text-xs text-muted-foreground flex gap-4">
                      <span>رصيد الحساب الحالي: <strong className="text-foreground">{formatCurrency(tx.account.balance)}</strong></span>
                      {tx.account.creditLimit && (
                        <span>حد الائتمان: <strong className="text-foreground">{formatCurrency(tx.account.creditLimit)}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معاملة جديدة</DialogTitle>
            <DialogDescription>إنشاء معاملة جديدة لحساب عميل أو مورد</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الحساب *</Label>
              <Select value={newAccountId} onValueChange={setNewAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.client?.name || acc.supplier?.name || acc.id.slice(0, 8)}{' '}
                      ({acc.accountType === 'CLIENT' ? 'عميل' : 'مورد'}) — {formatCurrency(acc.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع المعاملة *</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT">دفعة</SelectItem>
                  <SelectItem value="CREDIT">إضافة رصيد (دائن)</SelectItem>
                  <SelectItem value="DEBIT">خصم (مدين)</SelectItem>
                  <SelectItem value="REFUND">استرداد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ *</Label>
              <Input type="number" min="0" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="وصف المعاملة (اختياري)" />
            </div>
            <div className="space-y-2">
              <Label>المرجع</Label>
              <Input value={newReference} onChange={(e) => setNewReference(e.target.value)} placeholder="مرجع خارجي (اختياري)" />
            </div>
            <Button
              onClick={handleCreateTransaction}
              disabled={creating || !newAccountId || !newAmount || parseFloat(newAmount) <= 0}
              className="w-full"
            >
              {creating ? 'جاري الإنشاء...' : 'إنشاء المعاملة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
