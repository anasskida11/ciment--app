/**
 * Alertes de stock faible
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/use-products';

export function StockAlerts() {
  const { products } = useProducts();

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const criticalStockProducts = products.filter((p) => p.stock === 0);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-500 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="w-5 h-5" />
          تنبيهات المخزون المنخفض
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="p-3 bg-white rounded-lg border border-yellow-200 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  المتوفر: {product.stock} | الحد الأدنى: {product.minStock}
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {product.stock} وحدة
              </Badge>
            </div>
          ))}
        </div>
        {criticalStockProducts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold">
              ⚠️ {criticalStockProducts.length} منتج(ات) غير موجودة في المخزن
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
