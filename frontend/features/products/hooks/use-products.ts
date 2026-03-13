/**
 * Hook pour la gestion des produits
 */

import { useState, useEffect } from 'react';
import { productService } from '../services/product.service';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProducts = async (showError = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      // Only show toast if explicitly requested (not on initial load)
      if (showError) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المنتجات',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductDto) => {
    try {
      const newProduct = await productService.create(data);
      setProducts([...products, newProduct]);
      toast({
        title: 'نجاح',
        description: 'تم إنشاء المنتج بنجاح',
      });
      return newProduct;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في إنشاء المنتج';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, data: UpdateProductDto) => {
    try {
      const updated = await productService.update(id, data);
      setProducts(products.map(p => p.id === id ? updated : p));
      toast({
        title: 'نجاح',
        description: 'تم تحديث المنتج بنجاح',
      });
      return updated;
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في تحديث المنتج';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: 'نجاح',
        description: 'تم حذف المنتج بنجاح',
      });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error?.message || 'فشل في حذف المنتج';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    // Don't show error toast on initial load
    fetchProducts(false);
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
