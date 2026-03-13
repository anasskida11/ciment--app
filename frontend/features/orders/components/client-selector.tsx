/**
 * Composant de sélection/création de client
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
import { useClients } from '@/features/clients/hooks/use-clients';
import type { Client } from '@/features/clients/types';

const clientSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z
    .string()
    .regex(/^\+?\d{7,15}$/)
    .refine((val) => {
      const digitsOnly = val.replace(/\+/g, '');
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }, {
      message: 'يرجى إدخال رقم هاتف صحيح يحتوي على 7 إلى 15 رقمًا',
    }),
  email: z.string().email('بريد إلكتروني غير صالح').or(z.literal('')).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
}

export function ClientSelector({ selectedClient, onSelectClient }: ClientSelectorProps) {
  const { clients, createClient, loading: clientsLoading } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const handleSelectExisting = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (client) {
      onSelectClient(client);
      setSelectedClientId('');
    }
  };

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      const newClient = await createClient({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
      });
      onSelectClient(newClient);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>اختر أو أنشئ عميل</CardTitle>
        <CardDescription>حدد عميل موجود أو أنشئ عميل جديد</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedClient && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="font-semibold text-primary">{selectedClient.name}</p>
            <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="اختر عميل من قائمة" />
            </SelectTrigger>
            <SelectContent>
              {clientsLoading ? (
                <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
              ) : clients.length === 0 ? (
                <SelectItem value="no-clients" disabled>لا يوجد عملاء. أنشئ عميل جديد</SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.phone || 'لا يوجد رقم هاتف'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSelectExisting} disabled={!selectedClientId}>
            تحديد
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateClient)} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم العميل</Label>
                <Input id="name" {...form.register('name')} placeholder="أدخل اسم العميل" />
                {form.formState.errors.name && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  inputMode="tel"
                  {...form.register('phone', {
                    onChange: (e) => {
                      let value = e.target.value;
                      // Permettre + au début
                      const hasPlus = value.startsWith('+');
                      // Garder seulement + et les chiffres
                      value = value.replace(/[^\d+]/g, '');
                      // S'assurer que + est seulement au début
                      if (hasPlus && !value.startsWith('+')) {
                        value = '+' + value.replace(/\+/g, '');
                      } else if (!hasPlus && value.includes('+')) {
                        value = '+' + value.replace(/\+/g, '');
                      }
                      // Compter seulement les chiffres (sans le +)
                      const digitsOnly = value.replace(/\+/g, '');
                      // Limiter à 15 chiffres (le + ne compte pas)
                      if (digitsOnly.length > 15) {
                        value = (hasPlus ? '+' : '') + digitsOnly.slice(0, 15);
                      }
                      e.target.value = value;
                      form.setValue('phone', value, { shouldValidate: true });
                    }
                  })} 
                  placeholder="أدخل رقم الهاتف" 
                />
                {form.formState.errors.phone && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                <Input 
                  id="email" 
                  type="email"
                  {...form.register('email')} 
                  placeholder="email@example.com" 
                />
                {form.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                حفظ
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
