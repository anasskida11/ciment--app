/**
 * Formulaire de création/édition de produit
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  price: z.coerce.number().min(0.01, 'السعر مطلوب'),
  stock: z.coerce.number().min(0, 'المخزون صحيح'),
  minStock: z.coerce.number().min(1, 'الحد الأدنى للكمية'),
  description: z.string().optional(),
  unit: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
}

export function ProductForm({ isOpen, onClose, editingProduct }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      minStock: 10,
      description: '',
      unit: 'tonne',
    },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        minStock: editingProduct.minStock,
        description: editingProduct.description || '',
        unit: editingProduct.unit,
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المنتج</Label>
            <Input id="name" {...form.register('name')} placeholder="أدخل اسم المنتج" />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">السعر</Label>
              <Input id="price" type="number" {...form.register('price')} placeholder="0.00" step="0.01" />
              {form.formState.errors.price && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="stock">المخزون الحالي</Label>
              <Input id="stock" type="number" {...form.register('stock')} placeholder="0" />
              {form.formState.errors.stock && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="minStock">الحد الأدنى للكمية</Label>
            <Input id="minStock" type="number" {...form.register('minStock')} placeholder="10" />
            {form.formState.errors.minStock && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.minStock.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {editingProduct ? 'تحديث' : 'إضافة'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
