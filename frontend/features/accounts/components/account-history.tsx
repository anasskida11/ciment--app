'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import type { Account } from '../types';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number | string;
  createdAt: string;
}

interface DeliveryNoteSummary {
  id: string;
  noteNumber: string;
  status: string;
  createdAt: string;
  order?: { orderNumber: string };
}

interface TransactionSummary {
  id: string;
  type: string;
  amount: number | string;
  description?: string;
  createdAt: string;
}

interface AccountHistoryProps {
  account: Account;
  open: boolean;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
  DRAFT: 'مسودة',
  REJECTED: 'مرفوض',
};

const txTypeLabels: Record<string, string> = {
  DEBIT: 'مدين',
  CREDIT: 'دائن',
  PAYMENT: 'دفعة',
  REFUND: 'استرداد',
};

export function AccountHistory({ account, open, onClose }: AccountHistoryProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [notes, setNotes] = useState<DeliveryNoteSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const entityName = account.client?.name || account.supplier?.name || 'غير محدد';

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // Load orders for this client
        if (account.clientId) {
          const ordersRes: any = await api.get('/orders');
          const allOrders: OrderSummary[] = ordersRes?.data?.orders || ordersRes?.orders || [];
          setOrders(allOrders.filter((o: any) => o.clientId === account.clientId));

          // Load delivery notes
          const notesRes: any = await api.get('/delivery-notes');
          const allNotes: DeliveryNoteSummary[] = notesRes?.data?.deliveryNotes || notesRes?.deliveryNotes || [];
          // Filter notes that belong to this client's orders
          const clientOrderIds = new Set(allOrders.filter((o: any) => o.clientId === account.clientId).map((o: any) => o.id));
          setNotes(allNotes.filter((n: any) => clientOrderIds.has(n.orderId)));
        }

        // Load transactions for this account
        const txRes: any = await api.get(`/transactions/account/${account.id}`);
        setTransactions(txRes?.data?.transactions || txRes?.transactions || []);
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, account.id, account.clientId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>سجل الحساب: {entityName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : (
          <Tabs defaultValue="orders" dir="rtl">
            <TabsList className="w-full">
              <TabsTrigger value="orders" className="flex-1">الطلبات ({orders.length})</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">سندات التسليم ({notes.length})</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">المعاملات ({transactions.length})</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="rounded-lg border overflow-x-hidden">
                <Table dir="rtl" className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-[36%]">رقم الطلب</TableHead>
                      <TableHead className="text-right w-[16%]">الحالة</TableHead>
                      <TableHead className="text-right w-[22%]">المبلغ</TableHead>
                      <TableHead className="text-right w-[26%]">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">لا توجد طلبات</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-right whitespace-normal break-all leading-tight">#{order.orderNumber}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{statusLabels[order.status] || order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm whitespace-normal">{formatDate(order.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Delivery Notes Tab */}
            <TabsContent value="notes">
              <div className="rounded-lg border overflow-x-hidden">
                <Table dir="rtl" className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-[32%]">رقم السند</TableHead>
                      <TableHead className="text-right w-[32%]">رقم الطلب</TableHead>
                      <TableHead className="text-right w-[14%]">الحالة</TableHead>
                      <TableHead className="text-right w-[22%]">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">لا توجد سندات تسليم</TableCell>
                      </TableRow>
                    ) : (
                      notes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell className="font-medium text-right whitespace-normal break-all leading-tight">#{note.noteNumber}</TableCell>
                          <TableCell className="text-right whitespace-normal break-all leading-tight">#{note.order?.orderNumber || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{statusLabels[note.status] || note.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm whitespace-normal">{formatDate(note.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <div className="rounded-lg border overflow-x-hidden">
                <Table dir="rtl" className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-[16%]">النوع</TableHead>
                      <TableHead className="text-right w-[20%]">المبلغ</TableHead>
                      <TableHead className="text-right w-[36%]">الوصف</TableHead>
                      <TableHead className="text-right w-[28%]">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">لا توجد معاملات</TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-right">
                            <Badge variant="outline">{txTypeLabels[tx.type] || tx.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(tx.amount)}</TableCell>
                          <TableCell className="text-right text-sm whitespace-normal break-words">{tx.description || '—'}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm whitespace-normal">{formatDate(tx.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
