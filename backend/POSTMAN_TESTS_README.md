# Postman API Tests - Ciment App

This directory contains a complete Postman collection with tests for all API endpoints in the Ciment Distribution App.

## Files

- `Ciment_App_API_Tests.postman_collection.json` - Complete Postman collection with all API tests
- `Ciment_App_API_Environment.postman_environment.json` - Environment variables template

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button (top left)
3. Import both files:
   - `Ciment_App_API_Tests.postman_collection.json`
   - `Ciment_App_API_Environment.postman_environment.json`
4. Select the environment "Ciment App - Local Environment" from the environment dropdown (top right)

### 2. Configure Base URL

The default base URL is set to `http://localhost:3000`. If your server runs on a different port or host, update the `baseUrl` variable in the environment.

### 3. Run Tests

#### Quick Test Flow:

1. **Start with Authentication:**
   - Run `Authentication > Login` (or `Register` if you need to create a user first)
   - The `authToken` will be automatically saved to the environment

2. **Test Health & Test Endpoints:**
   - Run `Health & Test > Health Check`
   - Run `Health & Test > Test API`
   - Run `Health & Test > Test Auth Endpoint`

3. **Test All Other Endpoints:**
   - The collection is organized by resource type (Users, Clients, Products, Orders, etc.)
   - Each endpoint has automated tests that verify:
     - Status codes
     - Response structure
     - Data types

#### Running All Tests:

1. Click on the collection name
2. Click **Run** button
3. Select all requests or specific folders
4. Click **Run Ciment App - Complete API Tests**

## Collection Structure

The collection is organized into the following folders:

### 1. Health & Test
- Health Check (`GET /health`)
- Test API (`GET /api/test`)
- Test Auth Endpoint (`GET /api/test/auth`)

### 2. Authentication
- Register (`POST /api/auth/register`)
- Login (`POST /api/auth/login`) - **Auto-saves token**
- Get Me (`GET /api/auth/me`)

### 3. Users
- Get All Users (`GET /api/users`)
- Get User By ID (`GET /api/users/:id`)
- Create User (`POST /api/users`) - **Auto-saves userId**
- Update User (`PUT /api/users/:id`)
- Delete User (`DELETE /api/users/:id`)

### 4. Clients
- Get All Clients (`GET /api/clients`)
- Get Client By ID (`GET /api/clients/:id`)
- Create Client (`POST /api/clients`) - **Auto-saves clientId**
- Update Client (`PUT /api/clients/:id`)
- Delete Client (`DELETE /api/clients/:id`)

### 5. Products
- Get All Products (`GET /api/products`)
- Get Product By ID (`GET /api/products/:id`)
- Create Product (`POST /api/products`) - **Auto-saves productId**
- Update Product (`PUT /api/products/:id`)
- Delete Product (`DELETE /api/products/:id`)

### 6. Orders
- Get All Orders (`GET /api/orders`)
- Get Order By ID (`GET /api/orders/:id`)
- Create Order (`POST /api/orders`) - **Auto-saves orderId**
- Confirm Order (`PUT /api/orders/:id/confirm`)
- Update Order (`PUT /api/orders/:id`)
- Delete Order (`DELETE /api/orders/:id`)

### 7. Suppliers
- Get All Suppliers (`GET /api/suppliers`)
- Get Supplier By ID (`GET /api/suppliers/:id`)
- Create Supplier (`POST /api/suppliers`) - **Auto-saves supplierId**
- Update Supplier (`PUT /api/suppliers/:id`)
- Delete Supplier (`DELETE /api/suppliers/:id`)

### 8. Trucks
- Get Available Trucks (`GET /api/trucks/available`)
- Get All Trucks (`GET /api/trucks`)
- Get Truck By ID (`GET /api/trucks/:id`)
- Create Truck (`POST /api/trucks`) - **Auto-saves truckId**
- Update Truck (`PUT /api/trucks/:id`)
- Add Maintenance (`POST /api/trucks/:id/maintenance`)
- Add Fuel (`POST /api/trucks/:id/fuel`)
- Add Expense (`POST /api/trucks/:id/expense`)

### 9. Stock Requests
- Get All Stock Requests (`GET /api/stock-requests`)
- Create Stock Request (`POST /api/stock-requests`) - **Auto-saves stockRequestId**
- Receive Stock Request (`PUT /api/stock-requests/:id/receive`)

### 10. Stock Receipts
- Get All Stock Receipts (`GET /api/stock-receipts`)
- Create Stock Receipt (`POST /api/stock-receipts`) - **Auto-saves stockReceiptId**
- Confirm Stock Receipt (`PUT /api/stock-receipts/:id/confirm`)

### 11. Delivery Notes
- Get All Delivery Notes (`GET /api/delivery-notes`)
- Create Delivery Note (`POST /api/delivery-notes`) - **Auto-saves deliveryNoteId**
- Confirm Delivery (`PUT /api/delivery-notes/:id/confirm`)

### 12. Accounts
- Get Client Account (`GET /api/accounts/client/:clientId`)
- Get Supplier Account (`GET /api/accounts/supplier/:supplierId`)
- Get Account By ID (`GET /api/accounts/:id`)
- Update Account (`PUT /api/accounts/:id`)

### 13. Transactions
- Get Account Transactions (`GET /api/transactions/account/:accountId`)
- Get Transaction By ID (`GET /api/transactions/:id`)
- Create Transaction (`POST /api/transactions`) - **Auto-saves transactionId**

### 14. PDF Downloads
- Download Invoice PDF (`GET /api/pdf/invoice/:filename`)
- Download Quote PDF (`GET /api/pdf/quote/:filename`)
- Download Delivery Note PDF (`GET /api/pdf/delivery-note/:filename`)
- Download Stock Request PDF (`GET /api/pdf/stock-request/:filename`)
- Download Stock Receipt PDF (`GET /api/pdf/stock-receipt/:filename`)

## Automated Tests

Each request includes automated tests that verify:

- ✅ **Status Codes**: Correct HTTP status codes (200, 201, 404, etc.)
- ✅ **Response Structure**: Proper JSON structure with expected fields
- ✅ **Data Types**: Correct data types in responses
- ✅ **Auto-save Variables**: IDs are automatically saved for use in subsequent requests

## Environment Variables

The collection uses the following environment variables (automatically managed):

- `baseUrl` - API base URL (default: `http://localhost:3000`)
- `authToken` - JWT authentication token (auto-saved from login/register)
- `userId` - User ID (auto-saved from create user)
- `clientId` - Client ID (auto-saved from create client)
- `productId` - Product ID (auto-saved from create product)
- `orderId` - Order ID (auto-saved from create order)
- `supplierId` - Supplier ID (auto-saved from create supplier)
- `truckId` - Truck ID (auto-saved from create truck)
- `stockRequestId` - Stock Request ID (auto-saved from create stock request)
- `stockReceiptId` - Stock Receipt ID (auto-saved from create stock receipt)
- `deliveryNoteId` - Delivery Note ID (auto-saved from create delivery note)
- `accountId` - Account ID (auto-saved from account operations)
- `transactionId` - Transaction ID (auto-saved from create transaction)

## Testing Workflow

### Recommended Testing Order:

1. **Authentication** → Login/Register to get token
2. **Health & Test** → Verify API is running
3. **Users** → Create test users (if needed)
4. **Clients** → Create test clients
5. **Products** → Create test products
6. **Suppliers** → Create test suppliers
7. **Orders** → Create and test orders
8. **Stock Operations** → Test stock requests, receipts, delivery notes
9. **Trucks** → Test truck management
10. **Accounts & Transactions** → Test accounting features
11. **PDF Downloads** → Test PDF generation (requires existing PDFs)

## Notes

- **Authentication Required**: Most endpoints require authentication. Make sure to login first.
- **Role-Based Access**: Some endpoints require specific roles (ADMIN, CAISSIER_VENTE, etc.). Use an ADMIN account for full access.
- **Dependencies**: Some endpoints depend on others (e.g., creating an order requires a client and products to exist first).
- **PDF Tests**: PDF download tests may return 404 if the PDFs don't exist yet. This is expected behavior.

## Troubleshooting

### Token Expired
- Re-run the Login request to get a new token

### 401 Unauthorized
- Check that you're logged in and the token is valid
- Verify the Authorization header is set correctly

### 403 Forbidden
- Check that your user has the required role for the endpoint
- Use an ADMIN account for full access

### 404 Not Found
- Verify the IDs in the URL are correct
- Check that the resources exist in the database

### Variables Not Saving
- Make sure the environment is selected in Postman
- Check that the test scripts are running (they auto-save IDs)

## Support

For issues or questions about the API, refer to the main project documentation in the `docs/` folder.