/**
 * Système de placement de commandes - Composant principal
 */

'use client';

import { useState } from 'react';
import { ClientSelector } from './client-selector';
import { ProductSelector } from './product-selector';
import { OrderItemsList } from './order-items-list';
import { OrderSummary } from './order-summary';
import { useOrders } from '../hooks/use-orders';
import type { Client } from '@/features/clients/types';
import type { OrderItem } from '../types/order-item';
import { useToast } from '@/hooks/use-toast';

export function OrderPlacementSystem() {
  const { createOrder, loading: orderLoading } = useOrders();
  const { toast } = useToast();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);

  const handleAddItem = (item: OrderItem) => {
    setCurrentOrderItems([...currentOrderItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrderItems(currentOrderItems.filter((item) => item.id !== itemId));
  };

  const handleConfirmOrder = async () => {
    if (!selectedClient) {
      toast({
        title: 'خطأ',
        description: 'اختر عميل أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (currentOrderItems.length === 0) {
      toast({
        title: 'خطأ',
        description: 'أضف منتجات إلى الطلب',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createOrder({
        clientId: selectedClient.id,
        items: currentOrderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Reset form
      setCurrentOrderItems([]);
      setSelectedClient(null);

      toast({
        title: 'نجاح',
        description: 'تم حفظ الطلب بنجاح',
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">نظام إدارة الطلبات</h1>
        <p className="text-muted-foreground">منظومة موحدة لإدارة الطلبات والعملاء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Client & Items */}
        <div className="lg:col-span-2 space-y-6">
          <ClientSelector
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
          />

          <ProductSelector
            items={currentOrderItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />

          <OrderItemsList
            items={currentOrderItems}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            selectedClient={selectedClient}
            items={currentOrderItems}
            onConfirm={handleConfirmOrder}
          />
        </div>
      </div>
    </div>
  );
}
