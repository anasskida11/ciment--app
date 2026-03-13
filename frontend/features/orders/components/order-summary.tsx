/**
 * Résumé de la commande
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import type { Client } from '@/features/clients/types';
import type { OrderItem } from '../types/order-item';

interface OrderSummaryProps {
  selectedClient: Client | null;
  items: OrderItem[];
  onConfirm: () => void;
  disabled?: boolean;
}

export function OrderSummary({ selectedClient, items, onConfirm, disabled }: OrderSummaryProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle>ملخص الطلب</CardTitle>
        <Badge variant="outline" className="w-fit">
          قيد الانتظار
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedClient ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">العميل:</span>
              <p className="font-semibold">{selectedClient.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">الهاتف:</span>
              <p className="font-semibold">{selectedClient.phone}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">لم يتم تحديد عميل بعد</p>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">عدد المنتجات:</span>
            <span className="font-semibold">{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">إجمالي الكميات:</span>
            <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">الإجمالي:</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
          </div>

          <Button 
            onClick={onConfirm} 
            className="w-full" 
            size="lg" 
            disabled={disabled || !selectedClient || items.length === 0}
          >
            <Check className="w-4 h-4 ml-2" />
            {disabled ? 'جاري الحفظ...' : 'تأكيد الطلب'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
