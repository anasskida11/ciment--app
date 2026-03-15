/**
 * Composant de liste des commandes avec lignes extensibles
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Receipt, XCircle, ChevronDown } from 'lucide-react';
import { useOrders } from '../hooks/use-orders';
import type { Order } from '../types';
import { formatQuantityWithKg } from '@/shared/utils/format';

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  CANCELLED: 'ملغي',
  DELIVERED: 'تم التسليم',
  IN_PREPARATION: 'قيد التحضير',
  READY: 'جاهز',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  DELIVERED: 'default',
  IN_PREPARATION: 'secondary',
  READY: 'default',
};

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} أ.م`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn', // Force Western Arabic numerals (0-9)
  } as Intl.DateTimeFormatOptions);
}

function ExpandableOrderRow({
  order,
  isExpanded,
  onToggle,
  actions,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  actions: React.ReactNode;
}) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell className="w-8 px-2">
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </TableCell>
        <TableCell className="font-mono text-sm text-right">#{order.orderNumber}</TableCell>
        <TableCell className="text-right">{order.client?.name || 'غير محدد'}</TableCell>
        <TableCell className="text-right">{order.items?.length || 0}</TableCell>
        <TableCell className="font-semibold text-right whitespace-nowrap">{formatCurrency(order.totalAmount)}</TableCell>
        <TableCell className="text-sm text-right">{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          <Badge variant={statusColors[order.status] || 'secondary'}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1">{actions}</div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} className="p-0 border-0">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="p-4 bg-muted/30 border-b space-y-3">
              {/* Client info */}
              {order.client && (
                <div className="flex gap-4 text-sm">
                  {order.client.phone && <span><span className="font-medium">الهاتف:</span> {order.client.phone}</span>}
                  {order.client.email && <span><span className="font-medium">البريد:</span> {order.client.email}</span>}
                </div>
              )}
              {/* Products table */}
              {order.items && order.items.length > 0 && (
                <div className="rounded-lg border bg-background overflow-hidden">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">المجموع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-right">{item.product?.name || 'منتج محذوف'}</TableCell>
                          <TableCell className="text-right">{formatQuantityWithKg(item.quantity, item.product?.unit || 'tonne')}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-semibold text-right whitespace-nowrap">{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {order.notes && (
                <p className="text-sm text-muted-foreground"><span className="font-medium">ملاحظات:</span> {order.notes}</p>
              )}
              {/* Truck assignments info */}
              {order.truckAssignments && order.truckAssignments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">السيارات:</p>
                  <div className="rounded-lg border bg-background overflow-hidden">
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">السيارة</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">السائق</TableHead>
                          <TableHead className="text-right">تكلفة التوصيل</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.truckAssignments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-right">{a.truck?.matricule || '-'}</TableCell>
                            <TableCell className="text-right">{formatQuantityWithKg(a.quantity, 'tonne')}</TableCell>
                            <TableCell className="text-right">{a.driverName || '-'}</TableCell>
                            <TableCell className="text-right">{a.deliveryCost != null ? `${Number(a.deliveryCost).toLocaleString()} أ.م` : '-'}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={a.status === 'DELIVERED' ? 'default' : 'secondary'} className={a.status === 'DELIVERED' ? 'bg-green-600' : ''}>
                                {a.status === 'DELIVERED' ? 'تم التسليم' : a.status === 'ASSIGNED' ? 'معيّن' : a.status === 'IN_TRANSIT' ? 'في الطريق' : a.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

function navigateToInvoice(router: ReturnType<typeof useRouter>, orderId: string) {
  router.push(`/orders/${orderId}/invoice`);
}

export function OrdersList() {
  const router = useRouter();
  const { orders, loading, confirmOrder, rejectOrder, refetch } = useOrders();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleConfirm = async (orderId: string) => {
    const confirmed = window.confirm('هل أنت متأكد من تأكيد هذا الطلب؟');
    if (!confirmed) return;

    setConfirmingId(orderId);
    try {
      await confirmOrder(orderId);
      await refetch();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const confirmed = window.confirm('هل أنت متأكد من رفض هذا الطلب؟');
    if (!confirmed) return;

    setRejectingId(orderId);
    try {
      await rejectOrder(orderId);
      await refetch();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setRejectingId(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const otherOrders = orders.filter((o) => o.status !== 'PENDING' && o.status !== 'DELIVERED');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض وتأكيد الطلبات</p>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الطلبات قيد الانتظار ({pendingOrders.length})</CardTitle>
            <CardDescription>الطلبات التي تحتاج إلى تأكيد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <ExpandableOrderRow
                      key={order.id}
                      order={order}
                      isExpanded={expandedId === order.id}
                      onToggle={() => toggleExpand(order.id)}
                      actions={
                        <>
                          {order.status === 'PENDING' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirm(order.id)}
                                disabled={confirmingId === order.id || rejectingId === order.id}
                              >
                                {confirmingId === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                    تأكيد
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(order.id)}
                                disabled={confirmingId === order.id || rejectingId === order.id}
                              >
                                {rejectingId === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 ml-1" />
                                    رفض
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </>
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Orders */}
      {otherOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>جميع الطلبات ({otherOrders.length})</CardTitle>
            <CardDescription>الطلبات المؤكدة والملغاة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherOrders.map((order) => (
                    <ExpandableOrderRow
                      key={order.id}
                      order={order}
                      isExpanded={expandedId === order.id}
                      onToggle={() => toggleExpand(order.id)}
                      actions={
                        order.status !== 'CANCELLED' ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => navigateToInvoice(router, order.id)}
                          >
                            <Receipt className="w-4 h-4 ml-1" />
                            الفاتورة
                          </Button>
                        ) : null
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivered Orders History */}
      {orders.filter((o) => o.status === 'DELIVERED').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>سجل الطلبات المسلمة ({orders.filter((o) => o.status === 'DELIVERED').length})</CardTitle>
            <CardDescription>الطلبات التي تم تسليمها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter((o) => o.status === 'DELIVERED').map((order) => (
                    <ExpandableOrderRow
                      key={order.id}
                      order={order}
                      isExpanded={expandedId === order.id}
                      onToggle={() => toggleExpand(order.id)}
                      actions={
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => navigateToInvoice(router, order.id)}
                        >
                          <Receipt className="w-4 h-4 ml-1" />
                          الفاتورة
                        </Button>
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && orders.length === 0 && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
          </CardContent>
        </Card>
      )}


    </div>
  );
}
