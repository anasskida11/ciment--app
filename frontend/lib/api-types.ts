/**
 * Type definitions for API responses
 */

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  clientId: string;
  client?: Client;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Account Types
export interface Account {
  id: string;
  clientId: string;
  client?: Client;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  accountId: string;
  account?: Account;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  createdAt: string;
}

// Truck Types
export interface Truck {
  id: string;
  plateNumber: string;
  driverName?: string;
  capacity?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Stock Request Types
export interface StockRequest {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  status: string;
  requestedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Note Types
export interface DeliveryNote {
  id: string;
  orderId: string;
  order?: Order;
  truckId?: string;
  truck?: Truck;
  status: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Stock Receipt Types
export interface StockReceipt {
  id: string;
  supplierId?: string;
  supplier?: Supplier;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  receiptDate: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
