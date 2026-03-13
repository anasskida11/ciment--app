# Ciment App Deployment Guide (Vercel + Railway)

This project is a monorepo:
- `frontend/` -> Next.js app (deploy on Vercel)
- `backend/` -> Express + Prisma API (deploy on Railway)
- PostgreSQL -> Railway Postgres (or Neon/Supabase)

## 1. Prerequisites

- GitHub repo (already done): `https://github.com/anasskida11/ciment--app`
- Vercel account connected to GitHub
- Railway account connected to GitHub

## 2. Deploy PostgreSQL on Railway

1. In Railway, click `New Project`.
2. Add `PostgreSQL`.
3. Open the Postgres service and copy the connection string.
4. Use that value as `DATABASE_URL` in your backend service variables.

## 3. Deploy Backend (Railway)

1. In Railway, click `New Project` -> `Deploy from GitHub repo`.
2. Select repo: `anasskida11/ciment--app`.
3. In service settings, set `Root Directory` to `backend`.
4. Set environment variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://YOUR_VERCEL_DOMAIN
ADMIN_EMAIL=admin@ciment.com
ADMIN_PASSWORD=ChangeMe!2024
COMPANY_NAME=Votre Entreprise de Distribution
COMPANY_ADDRESS=Adresse complète, Ville, Mauritanie
COMPANY_PHONE=+222XXXXXXXXX
COMPANY_EMAIL=contact@entreprise.mr
```

5. Ensure start command is `npm start` (already in `backend/package.json`).
6. After first deploy, run migrations in Railway shell:

```bash
npx prisma migrate deploy
```

7. Optional seed for first admin/data:

```bash
npm run prisma:seed
```

8. Confirm backend is healthy:
- `https://YOUR_BACKEND_DOMAIN/health`
- `https://YOUR_BACKEND_DOMAIN/api/test`

## 4. Deploy Frontend (Vercel)

1. In Vercel, click `Add New...` -> `Project`.
2. Import repo: `anasskida11/ciment--app`.
3. Set `Root Directory` to `frontend`.
4. Vercel should detect Next.js automatically.
5. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_DOMAIN/api
```

6. Deploy.

## 5. Configure CORS (Backend)

Your backend CORS is strict and checks exact origins in `backend/src/app.js`.
Set `CORS_ORIGIN` to your exact Vercel URL, for example:

```env
CORS_ORIGIN=https://ciment--app.vercel.app
```

If you later add a custom domain, update `CORS_ORIGIN` and redeploy backend.

## 6. Production Checklist

- `.env` files are not committed (protected by `.gitignore`)
- Backend `/health` is OK
- Frontend login works against production API
- Browser console has no CORS errors
- Migrations applied (`npx prisma migrate deploy`)
- Admin account seeded (if needed)

## 7. Optional: Custom Domains

- Add frontend custom domain in Vercel project settings
- Add backend custom domain in Railway service settings
- Update:
  - `NEXT_PUBLIC_API_URL` in Vercel
  - `CORS_ORIGIN` in Railway

## 8. Rollback Strategy

- Vercel: rollback to a previous deployment from dashboard
- Railway: redeploy previous successful commit
- Database: keep automatic backups and avoid destructive migrations without testing
