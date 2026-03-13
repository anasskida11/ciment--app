/**
 * API Service functions - Convenience wrappers for common API operations
 */

import { api } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Client,
  Product,
  Order,
  Supplier,
  Account,
  Transaction,
  Truck,
  StockRequest,
  DeliveryNote,
  StockReceipt,
  PaginatedResponse,
} from './api-types';

// Auth Services
export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data),
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
};

// User Services
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Client Services
export const clientService = {
  getAll: () => api.get<Client[]>('/clients'),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Partial<Client>) => api.post<Client>('/clients', data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Product Services
export const productService = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Order Services
export const orderService = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (data: Partial<Order>) => api.post<Order>('/orders', data),
  update: (id: string, data: Partial<Order>) => api.put<Order>(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) => 
    api.patch<Order>(`/orders/${id}/status`, { status }),
};

// Supplier Services
export const supplierService = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  getById: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Account Services
export const accountService = {
  getAll: () => api.get<Account[]>('/accounts'),
  getById: (id: string) => api.get<Account>(`/accounts/${id}`),
  getByClientId: (clientId: string) => api.get<Account>(`/accounts/client/${clientId}`),
  create: (data: Partial<Account>) => api.post<Account>('/accounts', data),
  update: (id: string, data: Partial<Account>) => api.put<Account>(`/accounts/${id}`, data),
};

// Transaction Services
export const transactionService = {
  getAll: () => api.get<Transaction[]>('/transactions'),
  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),
  getByAccountId: (accountId: string) => 
    api.get<Transaction[]>(`/transactions/account/${accountId}`),
  create: (data: Partial<Transaction>) => api.post<Transaction>('/transactions', data),
};

// Truck Services
export const truckService = {
  getAll: () => api.get<Truck[]>('/trucks'),
  getById: (id: string) => api.get<Truck>(`/trucks/${id}`),
  create: (data: Partial<Truck>) => api.post<Truck>('/trucks', data),
  update: (id: string, data: Partial<Truck>) => api.put<Truck>(`/trucks/${id}`, data),
  delete: (id: string) => api.delete(`/trucks/${id}`),
};

// Stock Request Services
export const stockRequestService = {
  getAll: () => api.get<StockRequest[]>('/stock-requests'),
  getById: (id: string) => api.get<StockRequest>(`/stock-requests/${id}`),
  create: (data: Partial<StockRequest>) => 
    api.post<StockRequest>('/stock-requests', data),
  update: (id: string, data: Partial<StockRequest>) => 
    api.put<StockRequest>(`/stock-requests/${id}`, data),
  updateStatus: (id: string, status: string) => 
    api.patch<StockRequest>(`/stock-requests/${id}/status`, { status }),
};

// Delivery Note Services
export const deliveryNoteService = {
  getAll: () => api.get<DeliveryNote[]>('/delivery-notes'),
  getById: (id: string) => api.get<DeliveryNote>(`/delivery-notes/${id}`),
  create: (data: Partial<DeliveryNote>) => 
    api.post<DeliveryNote>('/delivery-notes', data),
  update: (id: string, data: Partial<DeliveryNote>) => 
    api.put<DeliveryNote>(`/delivery-notes/${id}`, data),
  generatePDF: (id: string) => api.get(`/pdf/delivery-note/${id}`),
};

// Stock Receipt Services
export const stockReceiptService = {
  getAll: () => api.get<StockReceipt[]>('/stock-receipts'),
  getById: (id: string) => api.get<StockReceipt>(`/stock-receipts/${id}`),
  create: (data: Partial<StockReceipt>) => 
    api.post<StockReceipt>('/stock-receipts', data),
  update: (id: string, data: Partial<StockReceipt>) => 
    api.put<StockReceipt>(`/stock-receipts/${id}`, data),
};
