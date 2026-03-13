/**
 * Liste des articles de la commande
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import type { OrderItem } from '../types/order-item';

interface OrderItemsListProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
}

export function OrderItemsList({ items, onRemoveItem }: OrderItemsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>محتويات الطلب</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">المجموع</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-right">{item.productName}</TableCell>
                  <TableCell className="text-right">{item.price} أ.م</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="font-semibold text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
