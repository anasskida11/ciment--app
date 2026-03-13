/**
 * Liste des produits avec gestion du stock
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/use-products';
import { formatCurrency } from '@/shared/utils/format';

interface ProductListProps {
  searchTerm: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, stock: number) => void;
}

export function ProductList({ searchTerm, onEdit, onDelete, onUpdateStock }: ProductListProps) {
  const { products, updateProduct, loading } = useProducts();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p) => {
    const stock = typeof p.stock === 'string' ? parseFloat(p.stock) : p.stock;
    const minStock = typeof p.minStock === 'string' ? parseFloat(p.minStock) : p.minStock;
    return stock <= minStock;
  });

  const handleStockChange = async (id: string, newStock: number) => {
    try {
      await updateProduct(id, { stock: Math.max(0, newStock) });
      onUpdateStock(id, newStock);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المنتجات</CardTitle>
        <CardDescription>{filteredProducts.length} منتج في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%] text-right">المنتج</TableHead>
                <TableHead className="w-[12%] text-right">السعر</TableHead>
                <TableHead className="w-[18%] text-right">المخزون الحالي</TableHead>
                <TableHead className="w-[12%] text-right">الحد الأدنى</TableHead>
                <TableHead className="w-[12%] text-right">الحالة</TableHead>
                <TableHead className="w-[12%] text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stock = typeof product.stock === 'string' ? parseFloat(product.stock) : product.stock;
                  const minStock = typeof product.minStock === 'string' ? parseFloat(product.minStock) : product.minStock;
                  const isLowStock = stock <= minStock;
                  return (
                    <TableRow key={product.id} className={isLowStock ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-semibold align-middle truncate text-right">{product.name}</TableCell>
                      <TableCell className="text-right align-middle whitespace-nowrap">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={stock}
                            onChange={(e) => handleStockChange(product.id, Number.parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground">وحدة</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-right">{minStock}</TableCell>
                      <TableCell className="align-middle text-right">
                        {isLowStock ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            منخفض
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            متوفر
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(product.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
