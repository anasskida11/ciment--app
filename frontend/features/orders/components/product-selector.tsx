/**
 * Composant de sélection de produits pour une commande
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { useToast } from '@/hooks/use-toast';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'اختر منتج'),
  quantity: z.coerce.number().min(1, 'الكمية لا تقل عن 1'),
});

type OrderItemFormData = z.infer<typeof orderItemSchema>;

import type { OrderItem } from '../types/order-item';

interface ProductSelectorProps {
  items: OrderItem[];
  onAddItem: (item: OrderItem) => void;
  onRemoveItem: (itemId: string) => void;
}

export function ProductSelector({ items, onAddItem, onRemoveItem }: ProductSelectorProps) {
  const { products, loading: productsLoading } = useProducts();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<OrderItemFormData>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: { productId: '', quantity: 1 },
  });

  const handleAddItem = async (data: OrderItemFormData) => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      toast({
        title: 'خطأ',
        description: 'المنتج غير موجود',
        variant: 'destructive',
      });
      return;
    }

    // Convertir le stock en nombre si c'est une string (Decimal de Prisma)
    const availableStock = typeof product.stock === 'string' ? parseFloat(product.stock) : product.stock;
    const requestedQuantity = data.quantity;

    if (requestedQuantity > availableStock) {
      toast({
        title: 'خطأ',
        description: `الكمية المطلوبة (${requestedQuantity}) تتجاوز المخزون المتاح (${availableStock})`,
        variant: 'destructive',
      });
      return;
    }

    const existingItem = items.find((item) => item.productId === data.productId);

    if (existingItem) {
      const currentQuantity = Number(existingItem.quantity);
      const newQuantity = currentQuantity + requestedQuantity;
      if (newQuantity > availableStock) {
        toast({
          title: 'خطأ',
          description: `الكمية الإجمالية (${newQuantity}) تتجاوز المخزون المتاح (${availableStock})`,
          variant: 'destructive',
        });
        return;
      }
      // Update existing item
      const updatedItem: OrderItem = {
        ...existingItem,
        quantity: newQuantity,
        amount: newQuantity * existingItem.price,
      };
      onRemoveItem(existingItem.id);
      onAddItem(updatedItem);
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: data.productId,
        productName: product.name,
        price: product.price,
        quantity: data.quantity,
        amount: product.price * data.quantity,
      };
      onAddItem(newItem);
    }

    toast({
      title: 'تم',
      description: `تمت إضافة ${product.name}`,
    });

    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة المنتجات</CardTitle>
        <CardDescription>اختر المنتجات والكميات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة منتج إلى الطلب</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
              <div>
                <Label htmlFor="product">المنتج</Label>
                <Select
                  value={form.watch('productId')}
                  onValueChange={(value) => form.setValue('productId', value)}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="اختر منتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsLoading ? (
                      <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                    ) : products.length === 0 ? (
                      <SelectItem value="no-products" disabled>لا توجد منتجات متاحة</SelectItem>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} أ.م (المتاح: {product.stock})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.productId && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.productId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...form.register('quantity')}
                  placeholder="أدخل الكمية"
                  min="1"
                />
                {form.formState.errors.quantity && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.quantity.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                إضافة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
