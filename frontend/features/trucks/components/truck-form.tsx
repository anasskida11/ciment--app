/**
 * Formulaire de création/édition de véhicule
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
import { useTrucks } from '../hooks/use-trucks';
import type { Truck, CreateTruckDto } from '../types';

const truckSchema = z.object({
  matricule: z.string().min(1, 'رقم اللوحة مطلوب'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
  capacity: z.coerce.number().optional(),
});

type TruckFormData = z.infer<typeof truckSchema>;

interface TruckFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTruck: Truck | null;
}

export function TruckForm({ isOpen, onClose, editingTruck }: TruckFormProps) {
  const { createTruck, updateTruck } = useTrucks();

  const form = useForm<TruckFormData>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      matricule: '',
      brand: '',
      model: '',
      year: undefined,
      capacity: undefined,
    },
  });

  useEffect(() => {
    if (editingTruck) {
      form.reset({
        matricule: editingTruck.matricule,
        brand: editingTruck.brand || '',
        model: editingTruck.model || '',
        year: editingTruck.year || undefined,
        capacity: editingTruck.capacity || undefined,
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTruck]);

  const handleSubmit = async (data: TruckFormData) => {
    try {
      const payload: CreateTruckDto = {
        ...data,
        capacity: data.capacity,
      };

      if (editingTruck) {
        await updateTruck(editingTruck.id, payload);
      } else {
        await createTruck(payload);
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
          <DialogTitle>{editingTruck ? 'تحديث السيارة' : 'إضافة سيارة جديدة'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="matricule">رقم اللوحة</Label>
            <Input id="matricule" {...form.register('matricule')} placeholder="مثال: 123 ع ع 456" />
            {form.formState.errors.matricule && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.matricule.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">العلامة التجارية</Label>
              <Input id="brand" {...form.register('brand')} placeholder="مثال: تويوتا" />
            </div>
            <div>
              <Label htmlFor="model">الموديل</Label>
              <Input id="model" {...form.register('model')} placeholder="مثال: هايلوكس" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">السنة</Label>
              <Input id="year" type="number" {...form.register('year')} placeholder="2020" />
            </div>
            <div>
              <Label htmlFor="capacity">السعة (كغ)</Label>
              <Input id="capacity" type="number" {...form.register('capacity')} placeholder="10000" step="1" />
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editingTruck ? 'تحديث' : 'إضافة'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
