/**
 * Types pour le module Produits
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  unit?: string;
  price: number;
  stock?: number;
  minStock?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}
