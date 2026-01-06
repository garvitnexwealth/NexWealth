# FinanceHub

Production-grade multi-user finance tracking app built with Next.js App Router, Prisma, NextAuth, and Redis caching.

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind CSS
- Prisma + Postgres (Supabase)
- NextAuth (Google OAuth + Credentials)
- Upstash Redis for dashboard caching
- Recharts for charts

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill values (use Supabase connection string for `DATABASE_URL`; add `DIRECT_URL` if you want non-pooled migrations).
3. Run migrations
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
4. Seed master data
   ```bash
   npm run prisma:seed
   ```
5. Run the app
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

- Set the same env vars in Vercel.
- Run migrations using `npm run prisma:deploy`.
- Use Upstash Redis REST credentials.

## Assumptions

- `users.display_currency` stores the default display currency (INR by default).
- "Current Investments" equals total assets excluding real estate.
- FX conversion uses the latest FX rate on or before the valuation date. Missing rates fall back to native values and emit a warning.
- Stock gains use average cost and ignore realized P/L in the current value tiles.
- Liabilities are assumed to be in the user display currency (schema does not capture currency for liabilities).

## Project structure

- `src/app`: App Router pages
- `src/app/api`: Route handlers
- `src/components`: UI components
- `src/lib`: Prisma, auth, caching, enums, helpers
- `prisma`: Prisma schema + migrations + seed
