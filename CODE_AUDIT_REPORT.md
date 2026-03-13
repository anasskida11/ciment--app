# 🔍 CODE AUDIT REPORT — Ciment App

**Date:** Auto-generated  
**Scope:** Full codebase audit (frontend + backend)  
**Goal:** Production readiness assessment  

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Critical Security Issues](#2-critical-security-issues)
3. [High-Priority Issues](#3-high-priority-issues)
4. [Medium-Priority Issues](#4-medium-priority-issues)
5. [Unused Files & Dead Code](#5-unused-files--dead-code)
6. [Unused Dependencies](#6-unused-dependencies)
7. [Performance Issues](#7-performance-issues)
8. [Code Quality Issues](#8-code-quality-issues)
9. [Recommended Actions](#9-recommended-actions)

---

## 1. Executive Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | 4 | 4 | 3 | 0 |
| Performance | 0 | 0 | 2 | 0 |
| Code Quality | 0 | 2 | 4 | 2 |
| Dead Code/Files | 0 | 1 | 3 | 0 |
| **TOTAL** | **4** | **7** | **12** | **2** |

**Architecture:**
- Backend: Express 5.2.1, Prisma 7.2.0, PostgreSQL, JWT auth
- Frontend: Next.js 16.0.10, React 19, shadcn/ui, TailwindCSS v4
- PDF generation: pdfkit with arabic-reshaper
- UI: Arabic RTL with Cairo font

---

## 2. Critical Security Issues

### 🔴 CRIT-1: Authentication Bypass in Development Mode
**File:** `backend/src/middleware/auth.middleware.js` (lines 11-25)  
**Issue:** When `NODE_ENV` is not set (or is `'development'`), ALL authenticated routes are bypassed with a fake user having `GESTIONNAIRE_CLIENTELE` role. Since `NODE_ENV` defaults to `undefined` in many deployment setups, this could bypass auth in production.  
**Risk:** Complete authentication bypass — any unauthenticated request gets full access.  
**Fix:** Remove the dev bypass entirely, or gate it strictly behind an explicit env flag like `SKIP_AUTH=true` that is NEVER set in production.

### 🔴 CRIT-2: Hardcoded Default Password
**File:** `backend/src/controllers/user.controller.js` (line 102)  
**Issue:** New users are created with hardcoded password `'00000000'`. Password reset also likely uses this same default.  
**Risk:** Any newly created user account has a predictable password. Attackers can enumerate users and try this default.  
**Fix:** Generate a random temporary password and require change on first login, or send a password-setup email link.

### 🔴 CRIT-3: Order Number Generation Race Condition
**File:** `backend/src/controllers/order.controller.js` (lines 7-25)  
**Issue:** `generateOrderNumber()` queries for the last order, increments the sequence, then creates. Two concurrent requests can get the same order number (no database-level uniqueness guarantee on the read-increment-write pattern).  
**Risk:** Duplicate order numbers, data integrity violation.  
**Fix:** Use a database sequence or `UNIQUE` constraint on `orderNumber` with retry logic, or use a `SELECT ... FOR UPDATE` pattern.

### 🔴 CRIT-4: XSS via innerHTML / dangerouslySetInnerHTML
**Files:**
- `frontend/components/order-summary-print.tsx` (line 89)
- `frontend/app/orders/[id]/invoice/page.tsx` (lines 142, 451)
- `frontend/features/orders/components/order-receipt.tsx` (lines 142, 433)

**Issue:** HTML strings are constructed with dynamic data and injected via `innerHTML` or `dangerouslySetInnerHTML` without sanitization.  
**Risk:** If any order data (client name, product name, notes) contains malicious HTML/JS, it executes in the browser.  
**Fix:** Use DOMPurify to sanitize the HTML, or better yet, use React components for rendering instead of raw HTML strings.

---

## 3. High-Priority Issues

### 🟠 HIGH-1: Exposed Credentials in Seed File
**File:** `backend/prisma/seed.js` (lines 23-24)  
**Issue:** Admin credentials hardcoded: `admin@ciment.com` / `admin123`. These are logged to console during seeding.  
**Risk:** Credential exposure in source control and logs.  
**Fix:** Use environment variables for seed credentials. Remove console output of passwords.

### 🟠 HIGH-2: Weak Password Requirements
**File:** `backend/src/controllers/auth.controller.js`  
**Issue:** Minimum password length is only 6 characters. No complexity requirements.  
**Risk:** Brute-force susceptible passwords.  
**Fix:** Enforce minimum 8 characters with mixed character types.

### 🟠 HIGH-3: Frontend Middleware Does Not Verify Tokens
**File:** `frontend/middleware.ts` (lines 22-31)  
**Issue:** The middleware has auth checking commented out. All routes pass through without server-side token verification. Auth is only checked client-side.  
**Risk:** Protected pages are accessible before client JS loads. Users can see flash of protected content.  
**Fix:** Enable cookie-based token verification in middleware, or implement proper server-side auth check.

### 🟠 HIGH-4: `ignoreBuildErrors: true` in Next.js Config
**File:** `frontend/next.config.mjs` (line 4)  
**Issue:** TypeScript errors are ignored during build. This masks real type errors that could cause runtime issues.  
**Risk:** Production builds with type errors that cause runtime failures.  
**Fix:** Set to `false` and fix all TypeScript errors before deploying.

### 🟠 HIGH-5: CORS Allows All Origins When NODE_ENV Not Set
**File:** `backend/src/app.js` (lines 37-56)  
**Issue:** When `NODE_ENV` is not explicitly set to something other than `'development'`, CORS allows ALL origins.  
**Risk:** Cross-origin attacks if NODE_ENV is not properly configured in production.  
**Fix:** Default to restrictive CORS. Only allow `*` when explicitly opted in.

### 🟠 HIGH-6: No Rate Limiting
**File:** `backend/src/app.js`  
**Issue:** No rate limiting middleware on any endpoint, including login.  
**Risk:** Brute-force attacks on login, API abuse.  
**Fix:** Add `express-rate-limit` with strict limits on auth endpoints.

### 🟠 HIGH-7: CSP Disabled in Development
**File:** `backend/src/app.js` (line 31)  
**Issue:** Content Security Policy is disabled when not in production mode.  
**Risk:** XSS attacks not mitigated in dev/staging.  
**Fix:** Enable CSP in all environments with appropriate policies.

---

## 4. Medium-Priority Issues

### 🟡 MED-1: Test Route Accessible Without Authentication
**File:** `backend/src/routes/test.routes.js`  
**Issue:** `GET /api/test` exposes environment name and version info without requiring auth.  
**Risk:** Information disclosure.  
**Fix:** Remove test route in production, or protect it with auth.

### 🟡 MED-2: No Input Validation Library on Backend
**Files:** All controllers in `backend/src/controllers/`  
**Issue:** Input validation is manual (`if (!email || !firstName)`). No schema validation library (Joi, Zod, etc.).  
**Risk:** Inconsistent validation, potential injection vectors.  
**Fix:** Add Zod or Joi for request body validation.

### 🟡 MED-3: N+1 Query Patterns
**Files:** `backend/src/controllers/truck.controller.js`  
**Issue:** Truck availability filtering done at application level instead of database level.  
**Risk:** Poor performance with large datasets.  
**Fix:** Use Prisma `where` clauses to filter at database level.

### 🟡 MED-4: Missing Database Indexes
**File:** `backend/prisma/schema.prisma`  
**Issue:** No explicit indexes on frequently queried fields like `accountId`, `createdAt`, `orderNumber`.  
**Risk:** Slow queries as data grows.  
**Fix:** Add `@@index` directives on commonly filtered/sorted columns.

### 🟡 MED-5: JWT Token in localStorage
**File:** `frontend/lib/api.ts` (and auth hooks)  
**Issue:** JWT stored in `localStorage` which is accessible to any JS on the page.  
**Risk:** If XSS occurs (see CRIT-4), tokens are stolen.  
**Fix:** Use `httpOnly` cookies for token storage. Requires backend changes.

### 🟡 MED-6: Console Error Logging Only
**Files:** All backend controllers  
**Issue:** Errors are logged with `console.error()` only. No structured logging.  
**Risk:** Poor observability in production. Logs may be lost.  
**Fix:** Add a logging library (winston, pino) with structured output.

---

## 5. Unused Files & Dead Code

### 📁 Orphaned Root-Level Documentation Files (12 files)
These files are development artifacts not referenced by any code or linked documentation:
```
DATABASE_CLEANUP_SUMMARY.md
DELIVERY_CHECKLIST.md
FINAL_SUMMARY.md
INTEGRATION_STATUS.md
MIGRATION_EXAMPLE.md
QUICK_FIX.md
RESTRUCTURING_GUIDE.md
ROLES_MIGRATION.md
SETUP.md
SOLUTION_IMMEDIATE.md
SUMMARY.md
TROUBLESHOOTING.md
```
**Action:** Safe to delete. These are developer notes from the build phase.

### 📁 Orphaned Frontend Components (5 files)
These are old root-level copies superseded by feature-level versions:
```
frontend/components/accounts-manager.tsx    → replaced by features/accounts/components/accounts-manager.tsx
frontend/components/fleet-manager.tsx       → replaced by features/trucks/components/fleet-manager.tsx
frontend/components/stock-manager.tsx       → replaced by features/stock/components/stock-manager.tsx
frontend/components/order-placement-system.tsx → replaced by features/orders/components/order-placement-system.tsx
frontend/components/order-summary-print.tsx → replaced by features/orders/components/order-summary-print.tsx
```
**Action:** Safe to delete. Pages import from `features/*/` paths.

### 📁 Unused Component
```
frontend/components/theme-provider.tsx  — Never imported anywhere
```
**Action:** Safe to delete.

### 📁 Empty Files
```
frontend/shared/constants/roles.ts  — Empty file (ROLES defined in shared/constants/index.ts)
```
**Action:** Safe to delete.

### 📁 Empty Folders
```
frontend/shared/validations/     — Empty folder
frontend/shared/types/           — Empty folder
backend/src/config/              — Empty folder
backend/src/modules/             — 9 empty subfolders (accounts/, auth/, clients/, orders/, products/, stock/, suppliers/, trucks/, users/)
```
**Action:** Safe to delete all.

### 📁 Unused Code in api-services.ts
**File:** `frontend/lib/api-services.ts`  
**Issue:** Large service file with 12 service objects. Only 3 are imported (by orphaned root-level components that are themselves unused). Once orphaned components are deleted, this file becomes fully unused.  
**Action:** Safe to delete after orphaned components are removed.

---

## 6. Unused Dependencies

### Frontend (`frontend/package.json`)

| Package | Status | Reason |
|---------|--------|--------|
| `tailwindcss-animate` | ❌ UNUSED | Only `tw-animate-css` is imported in globals.css. This package is never referenced. |
| `@vercel/analytics` | ⚠️ CONDITIONAL | Used in layout.tsx, but only functional on Vercel hosting. If not deploying to Vercel, this is dead weight. |
| `html2canvas` | ⚠️ CHECK | Verify if still used after removing orphaned components. |
| `jspdf` | ⚠️ CHECK | Verify if still used after removing orphaned components. |
| `react-to-print` | ⚠️ CHECK | Verify if still used after removing orphaned components. |

### Backend (`backend/package.json`)
All dependencies appear actively used. No unused packages detected.

---

## 7. Performance Issues

### ⚡ PERF-1: Application-Level Truck Filtering
**File:** `backend/src/controllers/truck.controller.js`  
**Issue:** Available trucks are fetched all, then filtered in JS instead of using Prisma `where` clause.  
**Fix:** Filter in database query.

### ⚡ PERF-2: Missing Database Indexes
**File:** `backend/prisma/schema.prisma`  
**Issue:** No indexes on `Order.createdAt`, `Order.accountId`, `TruckAssignment.truckId`, etc.  
**Fix:** Add `@@index` annotations for commonly queried fields.

---

## 8. Code Quality Issues

### 📝 QUAL-1: 35+ TypeScript `any` Types
**Files:** Across frontend codebase  
**Issue:** Widespread use of `any` type defeats TypeScript's purpose.  
**Fix:** Replace with proper types. Priority: API response handlers, event handlers.

### 📝 QUAL-2: Commented-Out Code Blocks
**Files:**
- `frontend/middleware.ts` (lines 22-31) — commented auth check
- `frontend/features/auth/hooks/use-auth.ts` — commented code blocks

**Fix:** Remove or implement. Commented code is not version control.

### 📝 QUAL-3: Mixed Language Error Messages
**Files:** Backend controllers mix French and English error messages.  
**Fix:** Standardize to one language (Arabic for user-facing, English for internal).

### 📝 QUAL-4: Console.warn in Production Code
**Files:** Various frontend components  
**Fix:** Replace with proper error boundaries or remove.

### 📝 QUAL-5: No Backend Tests
**Finding:** Zero test files exist in the entire backend.  
**Note:** Adding tests is outside scope of this audit but flagged for awareness.

### 📝 QUAL-6: Duplicate HTML Escape Logic
**Files:** `order-receipt.tsx` and `invoice/page.tsx` both define `escapeHtml()`.  
**Fix:** Extract to shared utility.

---

## 9. Recommended Actions

### Phase 1: Safe Cleanup (No behavior change)
- [ ] Delete 12 orphaned root-level MD files
- [ ] Delete 5 orphaned root-level components
- [ ] Delete `frontend/components/theme-provider.tsx`
- [ ] Delete `frontend/shared/constants/roles.ts` (empty)
- [ ] Delete empty folders: `shared/validations/`, `shared/types/`, `backend/src/config/`, `backend/src/modules/`
- [ ] Remove `tailwindcss-animate` from frontend dependencies
- [ ] Remove commented-out code blocks
- [ ] Delete `frontend/lib/api-services.ts` (becomes fully unused after component cleanup)

### Phase 2: Security Hardening (Behavior change — requires confirmation)
- [ ] Remove dev auth bypass from auth.middleware.js
- [ ] Enforce `NODE_ENV=production` requirement or default to restrictive behavior
- [ ] Add rate limiting to auth endpoints
- [ ] Strengthen password requirements
- [ ] Remove/protect test route
- [ ] Fix innerHTML/dangerouslySetInnerHTML with DOMPurify

### Phase 3: Performance & Quality
- [ ] Add database indexes
- [ ] Fix N+1 queries
- [ ] Set `ignoreBuildErrors: false` and fix TypeScript errors
- [ ] Replace `any` types with proper types

---

**⚠️ IMPORTANT:** Steps in Phase 2 and 3 change runtime behavior. Awaiting user confirmation before proceeding.
