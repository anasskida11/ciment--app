/**
 * Service pour la gestion des produits
 */

import { api } from '@/lib/api';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<{ success: boolean; data: { products: Product[] } }>('/products');
    return response.success && response.data?.products ? response.data.products : [];
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: { product: Product } }>(`/products/${id}`);
    if (!response.success || !response.data?.product) {
      throw new Error('Product not found');
    }
    return response.data.product;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<{ success: boolean; data: { product: Product } }>('/products', data);
    if (!response.success || !response.data?.product) {
      throw new Error('Failed to create product');
    }
    return response.data.product;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await api.put<{ success: boolean; data: { product: Product } }>(`/products/${id}`, data);
    if (!response.success || !response.data?.product) {
      throw new Error('Failed to update product');
    }
    return response.data.product;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
