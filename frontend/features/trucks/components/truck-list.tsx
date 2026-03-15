/**
 * Liste des vehicules
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Truck as TruckIcon } from 'lucide-react';
import type { Truck } from '../types';
import { formatQuantityWithKg } from '@/shared/utils/format';

interface TruckListProps {
  trucks: Truck[];
  searchTerm: string;
  onEdit: (truck: Truck) => void;
  onDelete: (id: string) => void;
  onReleaseTruck?: (assignmentId: string) => void;
  onToggleArchive: (truck: Truck) => void;
}

export function TruckList({ trucks, searchTerm, onEdit, onDelete, onReleaseTruck, onToggleArchive }: TruckListProps) {
  const filtered = trucks.filter(
    (t) => t.matricule.includes(searchTerm) || t.model?.includes(searchTerm) || t.brand?.includes(searchTerm)
  );

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">لا توجد سيارات</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((truck) => {
        const activeAssignment = truck.assignments?.find((a) => ['ASSIGNED', 'CONFIRMED', 'IN_TRANSIT'].includes(a.status));
        const isInUse = !!activeAssignment;

        return (
          <Card key={truck.id} className={isInUse ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {truck.matricule} - {truck.brand} {truck.model}
                  </CardTitle>
                  <CardDescription>
                    السنة: {truck.year || 'غير محدد'} | السعة: {truck.capacity ? formatQuantityWithKg(truck.capacity, 'tonne') : 'غير محدد'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(truck)} className="gap-2">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleArchive(truck)}
                    className={truck.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}
                  >
                    {truck.isActive ? 'أرشفة' : 'إلغاء الأرشفة'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(truck.id)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-semibold">الحالة:</span>{' '}
                  <Badge variant={isInUse ? 'destructive' : 'default'} className={!isInUse ? 'bg-green-600' : ''}>
                    {isInUse ? 'قيد الاستخدام' : 'متاحة'}
                  </Badge>
                  {!truck.isActive && <Badge className="ml-2 bg-gray-500">مؤرشفة</Badge>}
                </div>

                {isInUse && activeAssignment && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <TruckIcon className="w-4 h-4" />
                      تفاصيل المهمة الحالية
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">الطلب:</span>{' '}
                        <span className="font-medium">#{activeAssignment.order?.orderNumber || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الكمية:</span>{' '}
                        <span className="font-medium">{activeAssignment.quantity != null ? formatQuantityWithKg(activeAssignment.quantity, 'tonne') : '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">السائق:</span>{' '}
                        <span className="font-medium">{activeAssignment.driverName || 'غير محدد'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">تاريخ التعيين:</span>{' '}
                        <span className="font-medium">{new Date(activeAssignment.assignedAt).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                    {onReleaseTruck && (
                      <div className="pt-1">
                        <Button size="sm" variant="default" onClick={() => onReleaseTruck(activeAssignment.id)}>
                          تحرير السيارة (انهاء التوصيل)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
