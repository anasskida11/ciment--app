# API Integration Guide

This guide explains how to integrate the backend API with the frontend application.

## Project Structure

```
ciment-app/
├── backend/          # Express.js API server (port 3000)
└── frontend/         # Next.js application (port 3001)
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Note:** The frontend runs on port 3001 to avoid conflicts with the backend (port 3000).

### 2. Backend CORS Configuration

Update your backend `.env` file to include the frontend URL:

```env
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

Or if you want to allow all origins in development:

```env
CORS_ORIGIN="*"
```

### 3. Using the API Client

The API client is available in `lib/api.ts`. Here's how to use it:

#### Basic Usage

```typescript
import { api } from '@/lib/api';
import { LoginRequest, LoginResponse } from '@/lib/api-types';

// GET request
const products = await api.get<Product[]>('/products');

// POST request
const loginData: LoginRequest = {
  email: 'user@example.com',
  password: 'password123'
};
const response = await api.post<LoginResponse>('/auth/login', loginData);

// PUT request
const updated = await api.put<Product>('/products/123', { name: 'New Name' });

// DELETE request
await api.delete('/products/123');
```

#### Using React Hooks

```typescript
import { useGet, usePost } from '@/hooks/use-api';
import { Product } from '@/lib/api-types';

// GET request with hook
function ProductsList() {
  const { data: products, loading, error, execute } = useGet<Product[]>('/products', true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {products?.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// POST request with hook
function CreateProduct() {
  const { execute, loading, error } = usePost<Product, Partial<Product>>('/products');

  const handleSubmit = async (data: Partial<Product>) => {
    const result = await execute(data);
    if (result) {
      console.log('Product created:', result);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ name: 'New Product', unitPrice: 100 });
    }}>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

### 4. Authentication

The API client automatically includes the JWT token from localStorage. To set the token after login:

```typescript
// After successful login
const response = await api.post<LoginResponse>('/auth/login', loginData);
localStorage.setItem('auth_token', response.token);
```

To remove the token on logout:

```typescript
localStorage.removeItem('auth_token');
```

### 5. Available API Endpoints

Based on your backend routes:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Clients**: `/api/clients`
- **Products**: `/api/products`
- **Orders**: `/api/orders`
- **Suppliers**: `/api/suppliers`
- **Accounts**: `/api/accounts`
- **Transactions**: `/api/transactions`
- **Trucks**: `/api/trucks`
- **Stock Requests**: `/api/stock-requests`
- **Delivery Notes**: `/api/delivery-notes`
- **Stock Receipts**: `/api/stock-receipts`
- **PDF**: `/api/pdf`

### 6. Error Handling

The API client throws `ApiError` objects that include:
- `message`: Error message
- `status`: HTTP status code
- `errors`: Validation errors (if any)

```typescript
try {
  const data = await api.post('/products', productData);
} catch (error) {
  const apiError = error as ApiError;
  console.error('Status:', apiError.status);
  console.error('Message:', apiError.message);
  if (apiError.errors) {
    console.error('Validation errors:', apiError.errors);
  }
}
```

### 7. Running Both Servers

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

The frontend will be available at `http://localhost:3001` and will communicate with the backend at `http://localhost:3000`.

## Example: Complete Component with API Integration

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useGet, usePost } from '@/hooks/use-api';
import { Product, Client } from '@/lib/api-types';
import { api } from '@/lib/api';

export default function OrderForm() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});

  // Fetch clients
  const { data: clients, loading: clientsLoading } = useGet<Client[]>('/clients', true);
  
  // Fetch products
  const { data: products, loading: productsLoading } = useGet<Product[]>('/products', true);
  
  // Create order
  const { execute: createOrder, loading: orderLoading, error } = usePost('/orders');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      clientId: selectedClient,
      items: Object.entries(selectedProducts).map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
    };

    const result = await createOrder(orderData);
    if (result) {
      alert('Order created successfully!');
      // Reset form or redirect
    }
  };

  if (clientsLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        required
      >
        <option value="">Select a client</option>
        {clients?.map(client => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {products?.map(product => (
        <div key={product.id}>
          <label>
            {product.name} - ${product.unitPrice}
            <input
              type="number"
              min="0"
              value={selectedProducts[product.id] || 0}
              onChange={(e) => setSelectedProducts({
                ...selectedProducts,
                [product.id]: parseInt(e.target.value) || 0,
              })}
            />
          </label>
        </div>
      ))}

      {error && <div className="error">{error.message}</div>}
      
      <button type="submit" disabled={orderLoading}>
        {orderLoading ? 'Creating...' : 'Create Order'}
      </button>
    </form>
  );
}
```

## Next Steps

1. Create `.env.local` in the frontend directory
2. Update backend CORS configuration
3. Start implementing API calls in your components
4. Add proper error handling and loading states
5. Implement authentication flow
