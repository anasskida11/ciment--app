# نظام إدارة الشركة — Ciment App

A full-stack company management system built for a cement distribution business. It handles orders, stock, fleet, clients, suppliers, accounts, and user management — all in one web application with an Arabic interface.

**Live Demo:** [ciment-app.vercel.app](https://ciment-app.vercel.app)

---

## Features

- **Order Management** — Create and track orders through the full pipeline: pending → confirmed → in preparation → delivered
- **Stock Management** — Track product stock levels, stock requests, and stock receipts from suppliers
- **Fleet Management** — Manage trucks, assign them to orders, track fuel consumption, maintenance, and expenses
- **Client & Supplier Management** — Manage client and supplier profiles with linked financial accounts
- **Accounts & Transactions** — Track balances, credit limits, and payment transactions for clients and suppliers
- **Delivery Notes & PDFs** — Generate delivery note PDFs automatically
- **User Management** — Role-based access control with 5 roles
- **Notifications** — In-app notification system
- **Dashboard** — Overview of activity and key metrics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js 5 |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (JSON Web Tokens) |
| PDF Generation | PDFKit |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Database Hosting | Railway PostgreSQL |

---

## User Roles

| Role | Description |
|---|---|
| `ADMIN` | Full access — manages users, sees everything |
| `GESTIONNAIRE_CLIENTELE` | Manages clients and creates orders |
| `GESTIONNAIRE_STOCK` | Handles stock requests and receipts |
| `GESTIONNAIRE_TRUCKS` | Manages fleet assignments |
| `COMPTABLE` | Views accounts and transactions |

---

## Project Structure

```
ciment-app/
├── frontend/          # Next.js app (deployed to Vercel)
│   ├── app/           # Pages (App Router)
│   ├── components/    # Shared UI components
│   ├── features/      # Feature modules (orders, users, stock, etc.)
│   ├── lib/           # API client, types, utilities
│   └── hooks/         # Custom React hooks
│
└── backend/           # Express.js API (deployed to Railway)
    ├── src/
    │   ├── controllers/   # Route handlers
    │   ├── routes/        # API route definitions
    │   ├── middleware/     # Auth, error handling
    │   └── utils/         # Helpers (JWT, bcrypt, Prisma)
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   ├── migrations/    # SQL migration history
    │   └── seed.js        # Initial admin user seed
    └── Dockerfile         # Docker build for Railway
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL database

### 1. Clone the repo

```bash
git clone https://github.com/anasskida11/ciment--app.git
cd ciment--app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ciment_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
ADMIN_EMAIL=admin@ciment.com
ADMIN_PASSWORD=ChangeMe!2024
```

Run migrations and seed:

```bash
npx prisma migrate deploy
node prisma/seed.js
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3001`

### Default Admin Login

| Field | Value |
|---|---|
| Email | `admin@ciment.com` |
| Password | `ChangeMe!2024` (or whatever you set in `ADMIN_PASSWORD`) |

---

## API Endpoints

| Resource | Base Path |
|---|---|
| Auth | `POST /api/auth/login` |
| Users | `/api/users` |
| Clients | `/api/clients` |
| Suppliers | `/api/suppliers` |
| Products | `/api/products` |
| Orders | `/api/orders` |
| Stock Requests | `/api/stock-requests` |
| Stock Receipts | `/api/stock-receipts` |
| Delivery Notes | `/api/delivery-notes` |
| Trucks | `/api/trucks` |
| Truck Assignments | `/api/truck-assignments` |
| Accounts | `/api/accounts` |
| Transactions | `/api/transactions` |
| Notifications | `/api/notifications` |
| PDF | `/api/pdf` |

---

## Deployment

The app is deployed with:

- **Frontend → Vercel** (auto-deploys from `main` branch)
- **Backend + Database → Railway** (Docker, auto-deploys from `main` branch)

On every backend deploy, the startup script automatically:
1. Runs pending database migrations
2. Seeds the admin user if it doesn't exist
3. Starts the Express server

See [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for the full deployment runbook.
