/**
 * Gestionnaire de stock - Composant principal
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ChevronDown } from 'lucide-react';
import { StockAlerts } from './stock-alerts';
import { ProductList } from './product-list';
import { ProductForm } from './product-form';
import { useProducts } from '@/features/products/hooks/use-products';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { formatCurrency, formatDate, formatNumber } from '@/shared/utils/format';
import type { Product } from '@/features/products/types';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DeliveryNote = {
  id: string;
  noteNumber: string;
  orderId: string;
  status: 'DRAFT' | 'DELIVERED';
  createdAt: string;
};

type DeliveryNotesResponse = {
  success: boolean;
  data?: { deliveryNotes: DeliveryNote[] };
};

export function StockManager() {
  const { products, deleteProduct } = useProducts();
  const { orders, refetch: refetchOrders } = useOrders();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isCreatingDeliveryNote, setIsCreatingDeliveryNote] = useState(false);
  const [confirmingNoteId, setConfirmingNoteId] = useState<string | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [expandedConfirmedId, setExpandedConfirmedId] = useState<string | null>(null);

  const fetchDeliveryNotes = async (showError = true) => {
    setIsLoadingNotes(true);
    try {
      const response = await api.get<DeliveryNotesResponse>('/delivery-notes');
      setDeliveryNotes(response.data?.deliveryNotes || []);
    } catch (error: any) {
      if (showError) {
        toast({
          title: 'خطأ',
          description: error?.message || 'فشل في تحميل سندات التسليم',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchDeliveryNotes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p) => {
    const stock = typeof p.stock === 'string' ? parseFloat(p.stock) : p.stock;
    const minStock = typeof p.minStock === 'string' ? parseFloat(p.minStock) : p.minStock;
    return stock <= minStock;
  });

  const handleEdit = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setEditingProduct(product);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateStock = (id: string, stock: number) => {
    // Stock is updated via the ProductList component
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');

  const getDeliveryNoteForOrder = (orderId: string) =>
    deliveryNotes.find((note) => note.orderId === orderId);

  const deliveredNotes = deliveryNotes.filter((note) => note.status === 'DELIVERED');

  const openDeliveryDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeliveryAddress('');
    setIsDeliveryDialogOpen(true);
  };

  const handleCreateDeliveryNote = async () => {
    if (!selectedOrderId) return;
    setIsCreatingDeliveryNote(true);
    try {
      await api.post('/delivery-notes', {
        orderId: selectedOrderId,
        deliveryAddress: deliveryAddress || undefined,
      });
      toast({
        title: 'نجاح',
        description: 'تم إنشاء سند التسليم بنجاح',
      });
      setIsDeliveryDialogOpen(false);
      await fetchDeliveryNotes(false);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في إنشاء سند التسليم',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingDeliveryNote(false);
    }
  };

  const handleConfirmDelivery = async (noteId: string) => {
    setConfirmingNoteId(noteId);
    try {
      await api.put(`/delivery-notes/${noteId}/confirm`);
      toast({
        title: 'نجاح',
        description: 'تم تأكيد التسليم وتحديث المخزون',
      });
      await fetchDeliveryNotes(false);
      await refetchOrders(false);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في تأكيد التسليم',
        variant: 'destructive',
      });
    } finally {
      setConfirmingNoteId(null);
    }
  };

  const handleDownloadDeliveryPdf = async (noteId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast({
        title: 'خطأ',
        description: 'لا يوجد رمز مصادقة',
        variant: 'destructive',
      });
      return;
    }

    setDownloadingNoteId(noteId);
    try {
      const response = await fetch(`${baseUrl}/delivery-notes/${noteId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'فشل في تحميل سند التسليم');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في تحميل سند التسليم',
        variant: 'destructive',
      });
    } finally {
      setDownloadingNoteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">إدارة المخزون</h1>
        <p className="text-muted-foreground">تحديث المخزون وإضافة منتجات جديدة</p>
      </div>

      {/* Stock Alerts */}
      <StockAlerts />

      {/* Confirmed Orders -> Delivery Notes */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات المؤكدة للتسليم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">سند التسليم</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد طلبات مؤكدة
                    </TableCell>
                  </TableRow>
                )}
                {confirmedOrders.map((order) => {
                  const deliveryNote = getDeliveryNoteForOrder(order.id);
                  const isExpanded = expandedConfirmedId === order.id;
                  return (
                    <>
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedConfirmedId(isExpanded ? null : order.id)}
                      >
                        <TableCell className="w-8 px-2">
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">#{order.orderNumber}</TableCell>
                        <TableCell className="text-right">{order.client?.name || 'غير محدد'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {deliveryNote
                            ? deliveryNote.status === 'DELIVERED'
                              ? 'تم التسليم'
                              : 'جاهز للتسليم'
                            : isLoadingNotes
                            ? '...'
                            : 'غير منشأ'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {!deliveryNote && (
                              <Button size="sm" onClick={() => openDeliveryDialog(order.id)}>
                                إنشاء سند تسليم
                              </Button>
                            )}
                            {deliveryNote && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={downloadingNoteId === deliveryNote.id}
                                onClick={() => handleDownloadDeliveryPdf(deliveryNote.id)}
                              >
                                تحميل سند التسليم
                              </Button>
                            )}
                            {deliveryNote && deliveryNote.status !== 'DELIVERED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={confirmingNoteId === deliveryNote.id}
                                onClick={() => handleConfirmDelivery(deliveryNote.id)}
                              >
                                تأكيد التسليم
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {order.items?.length ? (
                        <TableRow key={`${order.id}-items`}>
                          <TableCell colSpan={7} className="p-0 border-0">
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                              <div className="p-4 bg-muted/30 border-b">
                                <div className="rounded-lg border bg-background p-4 space-y-3">
                                  <div className="text-sm font-medium">تفاصيل المنتجات</div>
                                  <div className="grid grid-cols-4 gap-3 text-xs text-muted-foreground">
                                    <div className="text-right">المنتج</div>
                                    <div className="text-right">الكمية</div>
                                    <div className="text-right">السعر</div>
                                    <div className="text-right">المجموع</div>
                                  </div>
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="grid grid-cols-4 gap-3 text-sm">
                                        <div className="text-right">{item.product?.name || 'منتج'}</div>
                                        <div className="text-right">{formatNumber(Number(item.quantity || 0))}</div>
                                        <div className="text-right">{formatCurrency(item.unitPrice)}</div>
                                        <div className="text-right">{formatCurrency(item.subtotal)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivered Notes */}
      <Card>
        <CardHeader>
          <CardTitle>سندات التسليم المؤكدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-right">رقم السند</TableHead>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveredNotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد سندات مؤكدة
                    </TableCell>
                  </TableRow>
                )}
                {deliveredNotes.map((note) => {
                  const orderForNote = orders.find((order) => order.id === note.orderId);
                  const isExpanded = expandedNoteId === note.id;
                  return (
                    <>
                      <TableRow
                        key={note.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      >
                        <TableCell className="w-8 px-2">
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">#{note.noteNumber}</TableCell>
                        <TableCell className="text-right">#{orderForNote?.orderNumber || '—'}</TableCell>
                        <TableCell className="text-right">{orderForNote?.client?.name || 'غير محدد'}</TableCell>
                        <TableCell className="text-right">
                          {orderForNote ? formatCurrency(orderForNote.totalAmount) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {orderForNote ? formatDate(orderForNote.createdAt) : '—'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={downloadingNoteId === note.id}
                            onClick={() => handleDownloadDeliveryPdf(note.id)}
                          >
                            تحميل سند التسليم
                          </Button>
                        </TableCell>
                      </TableRow>
                      {orderForNote?.items?.length ? (
                        <TableRow key={`${note.id}-items`}>
                          <TableCell colSpan={7} className="p-0 border-0">
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                              <div className="p-4 bg-muted/30 border-b">
                                <div className="rounded-lg border bg-background p-4 space-y-3">
                                  <div className="text-sm font-medium">تفاصيل المنتجات</div>
                                  <div className="grid grid-cols-4 gap-3 text-xs text-muted-foreground">
                                    <div className="text-right">المنتج</div>
                                    <div className="text-right">الكمية</div>
                                    <div className="text-right">السعر</div>
                                    <div className="text-right">المجموع</div>
                                  </div>
                                  <div className="space-y-2">
                                    {orderForNote.items.map((item) => (
                                      <div key={item.id} className="grid grid-cols-4 gap-3 text-sm">
                                        <div className="text-right">{item.product?.name || 'منتج'}</div>
                                        <div className="text-right">{formatNumber(Number(item.quantity || 0))}</div>
                                        <div className="text-right">{formatCurrency(item.unitPrice)}</div>
                                        <div className="text-right">{formatCurrency(item.subtotal)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="ابحث عن منتج..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 ml-2" />
          منتج جديد
        </Button>
      </div>

      {/* Products Table */}
      <ProductList
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateStock={handleUpdateStock}
      />

      {/* Stock Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">المنتجات المنخفضة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{lowStockProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي قيمة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(
                filteredProducts.reduce((sum, p) => {
                  const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                  const stock = typeof p.stock === 'string' ? parseFloat(p.stock) : p.stock;
                  return sum + (price || 0) * (stock || 0);
                }, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingProduct={editingProduct}
      />

      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء سند تسليم</DialogTitle>
            <DialogDescription>أضف عنوان التسليم (اختياري) ثم أنشئ السند.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="عنوان التسليم"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateDeliveryNote} disabled={isCreatingDeliveryNote}>
                إنشاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
