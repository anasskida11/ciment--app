/**
 * Gestionnaire de flotte - Composant principal
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { formatNumber } from '@/shared/utils/format';
import { TruckList } from './truck-list';
import { TruckForm } from './truck-form';
import { useTrucks } from '../hooks/use-trucks';
import { useTruckAssignments } from '../hooks/use-truck-assignments';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useClients } from '@/features/clients/hooks/use-clients';
import type { Truck } from '../types';

export function FleetManager() {
  const { trucks, availableTrucks, loading, deleteTruck, refetchAvailable, refetch: refetchTrucks } = useTrucks();
  const { orders, refetch: refetchOrders, markAsDelivered } = useOrders();
  const { clients } = useClients();
  const { assignments, fetchByOrderId, createAssignment, completeAssignment, deleteAssignment } = useTruckAssignments();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [assignQuantity, setAssignQuantity] = useState('');
  const [driverName, setDriverName] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [completingAssignmentId, setCompletingAssignmentId] = useState<string | null>(null);
  const [completionCost, setCompletionCost] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const handleEdit = (truck: Truck) => {
    setEditingTruck(truck);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTruck(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTruck(null);
  };

  // Orders visible in fleet: confirmed/ready only.
  const fleetVisibleOrders = orders.filter((o) => {
    const status = String(o.status || '').toUpperCase();
    return status === 'CONFIRMED' || status === 'READY';
  });
  const getOrderTotalQuantity = (order: typeof fleetVisibleOrders[number]) =>
    order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const getAssignedQuantityForOrder = (order: typeof fleetVisibleOrders[number]) =>
    (order.truckAssignments || []).reduce((sum, a) => sum + Number(a.quantity || 0), 0);
  const getRemainingForOrder = (order: typeof fleetVisibleOrders[number]) =>
    Math.max(0, getOrderTotalQuantity(order) - getAssignedQuantityForOrder(order));

  const assignableOrders = fleetVisibleOrders.filter((o) => getRemainingForOrder(o) > 0);
  const completedOrders = fleetVisibleOrders.filter((o) => getRemainingForOrder(o) === 0);
  const orderClientMap = new Map(orders.map((o) => [o.id, o.clientId]));
  const selectedOrder = assignableOrders.find((o) => o.id === selectedOrderId);
  const orderTotalQuantity = selectedOrder
    ? selectedOrder.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    : 0;
  const assignedQuantity = assignments.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
  const remainingQuantity = Math.max(0, orderTotalQuantity - assignedQuantity);

  const handleOrderChange = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedTruckId('');
    setAssignQuantity('');
    setDriverName('');
    if (orderId) {
      await fetchByOrderId(orderId, false);
    }
  };

  const handleAssignTruck = async () => {
    if (!selectedOrderId || !selectedTruckId || !assignQuantity) return;
    const qty = Number(assignQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    await createAssignment({
      orderId: selectedOrderId,
      truckId: selectedTruckId,
      quantity: qty,
      driverName: driverName || undefined
    });

    await refetchOrders(false);
    await refetchAvailable(false);
    await refetchTrucks(false);

    setSelectedTruckId('');
    setAssignQuantity('');
    setDriverName('');
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    await markAsDelivered(orderId);
    await refetchOrders(false);
    await refetchAvailable(false);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    await deleteAssignment(assignmentId);
    await refetchOrders(false);
    await refetchAvailable(false);
    await refetchTrucks(false);
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    const cost = completionCost ? parseFloat(completionCost) : undefined;
    await completeAssignment(assignmentId, {
      deliveryCost: cost,
      notes: completionNotes || undefined
    });
    await refetchOrders(false);
    await refetchAvailable(false);
    await refetchTrucks(false);
    setCompletingAssignmentId(null);
    setCompletionCost('');
    setCompletionNotes('');
  };

  const openCompleteDialog = (assignmentId: string) => {
    setCompletingAssignmentId(assignmentId);
    setCompletionCost('');
    setCompletionNotes('');
  };

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      truck.matricule.includes(searchTerm) ||
      truck.model?.includes(searchTerm) ||
      truck.brand?.includes(searchTerm);

    const isAvailable = availableTrucks.some((t) => t.id === truck.id);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isAvailable) ||
      (statusFilter === 'inactive' && !isAvailable);

    const matchesOrder =
      orderFilter === 'all' ||
      truck.assignments?.some((a) => a.orderId === orderFilter);

    const matchesClient =
      clientFilter === 'all' ||
      truck.assignments?.some((a) => orderClientMap.get(a.orderId) === clientFilter);

    return matchesSearch && matchesStatus && matchesOrder && matchesClient;
  });

  const availableCount = availableTrucks.length;
  const inUseCount = trucks.filter((t) =>
    t.assignments?.some((a) => ['ASSIGNED', 'CONFIRMED', 'IN_TRANSIT'].includes(a.status))
  ).length;

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السيارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trucks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">السيارات المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {availableCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">السيارات قيد الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {inUseCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(trucks.reduce((sum, t) => sum + (t.capacity || 0), 0))} طن
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="ابحث عن السيارة برقم اللوحة أو الموديل"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="حالة السيارة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">متاحة فقط</SelectItem>
            <SelectItem value="inactive">قيد الاستخدام فقط</SelectItem>
          </SelectContent>
        </Select>
        <Select value={orderFilter} onValueChange={setOrderFilter}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="فلترة حسب الطلب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الطلبات</SelectItem>
            {assignableOrders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                #{order.orderNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="فلترة حسب العميل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العملاء</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditingTruck(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة سيارة
        </Button>
      </div>

      {/* Assign trucks to ready/confirmed orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">توزيع الحمولة على السيارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignableOrders.length === 0 && completedOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات جاهزة أو مؤكدة حالياً.</div>
          ) : (
            <>
              {/* Orders ready to be marked as delivered (remaining = 0) */}
              {completedOrders.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">طلبات مكتملة التوزيع (المتبقي = 0)</Label>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-5 gap-2 border-b p-3 text-sm font-semibold">
                      <div>رقم الطلب</div>
                      <div>العميل</div>
                      <div>الكمية</div>
                      <div>الموزع</div>
                      <div>إجراء</div>
                    </div>
                    {completedOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-5 gap-2 border-b p-3 text-sm items-center">
                        <div>#{order.orderNumber}</div>
                        <div>{order.client?.name || 'عميل'}</div>
                        <div>{getOrderTotalQuantity(order)}</div>
                        <div>{getAssignedQuantityForOrder(order)}</div>
                        <div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkAsDelivered(order.id)}
                          >
                            تأكيد التسليم
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assignableOrders.length > 0 && (
              <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الطلب الجاهز / المؤكد</Label>
                  <Select value={selectedOrderId} onValueChange={handleOrderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          #{order.orderNumber} - {order.client?.name || 'عميل'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">الكمية</div>
                    <div className="text-lg font-semibold">{orderTotalQuantity}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">الموزع</div>
                    <div className="text-lg font-semibold">{assignedQuantity}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">المتبقي</div>
                    <div className="text-lg font-semibold">{remainingQuantity}</div>
                  </div>
                </div>
              </div>

              {selectedOrderId && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>السيارة</Label>
                      <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر سيارة" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrucks.length === 0 ? (
                            <SelectItem value="none" disabled>
                              لا توجد سيارات متاحة حالياً
                            </SelectItem>
                          ) : (
                            availableTrucks.map((truck) => (
                              <SelectItem key={truck.id} value={truck.id}>
                                {truck.matricule} ({truck.capacity || 0} طن)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الكمية (طن)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={assignQuantity}
                        onChange={(e) => setAssignQuantity(e.target.value)}
                        placeholder="مثال: 10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>اسم السائق (اختياري)</Label>
                      <Input
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="اسم السائق"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleAssignTruck}
                      disabled={!selectedTruckId || !assignQuantity}
                    >
                      إضافة التعيين
                    </Button>
                  </div>

                  <div className="rounded-lg border">
                    <div className="grid grid-cols-4 gap-2 border-b p-3 text-sm font-semibold">
                      <div>السيارة</div>
                      <div>الكمية</div>
                      <div>السائق</div>
                      <div>إجراء</div>
                    </div>
                    {assignments.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">لا توجد تعيينات لهذا الطلب.</div>
                    ) : (
                      assignments.map((assignment) => (
                        <div key={assignment.id} className="grid grid-cols-4 gap-2 border-b p-3 text-sm">
                          <div>{assignment.truck?.matricule || assignment.truckId}</div>
                          <div>{assignment.quantity}</div>
                          <div>{assignment.driverName || '-'}</div>
                          <div className="flex gap-2">
                            {assignment.status !== 'DELIVERED' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openCompleteDialog(assignment.id)}
                              >
                                تم التسليم
                              </Button>
                            )}
                            {assignment.status === 'DELIVERED' && assignment.deliveryCost != null && (
                              <span className="text-xs text-muted-foreground self-center">
                                التكلفة: {Number(assignment.deliveryCost).toLocaleString()} أ.م
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Trucks List */}
      <TruckList
        trucks={filteredTrucks}
        searchTerm=""
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReleaseTruck={openCompleteDialog}
      />

      {/* Truck Form Dialog */}
      <TruckForm isOpen={isFormOpen} onClose={handleCloseForm} editingTruck={editingTruck} />

      {/* Complete Assignment Dialog */}
      <Dialog open={!!completingAssignmentId} onOpenChange={(open) => { if (!open) setCompletingAssignmentId(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد إنهاء التوصيل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>تكلفة التوصيل (أ.م)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={completionCost}
                onChange={(e) => setCompletionCost(e.target.value)}
                placeholder="مثال: 5000"
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Input
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="أي ملاحظات عن الرحلة..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCompletingAssignmentId(null)}>
              إلغاء
            </Button>
            <Button onClick={() => completingAssignmentId && handleCompleteAssignment(completingAssignmentId)}>
              تأكيد التسليم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
