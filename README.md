# Daveen African Food & Grocery — E-Commerce Platform

Production-grade Next.js 15 e-commerce platform for Daveen African Food & Grocery, located at 6421 S King Dr Suite B, Chicago, IL 60637.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + ShadCN UI + Framer Motion |
| Database | PostgreSQL 16 via Supabase |
| ORM | Prisma v5 |
| Auth | Supabase Auth + JWT httpOnly cookies |
| Payments | Stripe Payment Intents API |
| State | Zustand (cart) + TanStack Query (server) |
| Images | Cloudinary CDN |
| Cache | Upstash Redis (rate limiting + response cache) |
| Email | Resend + React Email |
| SMS | Twilio |
| Maps | Google Maps API |
| Analytics | Google Analytics 4 + PostHog |
| Hosting | Vercel Edge Network |
| CI/CD | GitHub Actions |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd daveen-grocery
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all required values
```

### 3. Set up database

```bash
# Push schema to Supabase
npx prisma migrate deploy

# Seed initial data
npx prisma db seed

# Apply RLS policies (in Supabase SQL editor)
# Copy contents of supabase/rls-policies.sql
```

### 4. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── (shop)/          # Customer-facing routes
│   ├── (auth)/          # Auth pages (sign-in, sign-up)
│   ├── (admin)/         # Admin dashboard
│   └── api/             # Route handlers + webhooks
├── components/
│   ├── layout/          # Header, Footer, CartDrawer
│   ├── product/         # ProductCard, ProductGrid
│   ├── checkout/        # DeliveryStep, PaymentStep, ConfirmationStep
│   ├── orders/          # OrderTracker (with Realtime)
│   ├── auth/            # Sign-in/up forms
│   ├── admin/           # AdminSidebar, KPICard
│   └── shared/          # PriceDisplay, SkeletonCard
├── lib/                 # Supabase, Prisma, Stripe, Redis, etc.
├── services/            # Business logic (products, delivery, coupons, etc.)
├── stores/              # Zustand stores (cart, UI)
├── actions/             # Server Actions (auth, checkout, products)
├── validations/         # Zod schemas
├── utils/               # currency, slug, date helpers
├── config/              # site config, delivery zones
└── types/               # Shared TypeScript types
```

## Delivery Zones

| Zone | ZIP Codes | Fee | Free Over | ETA |
|------|-----------|-----|-----------|-----|
| Zone 1 (Woodlawn/Hyde Park) | 60637, 60615, 60619, 60649 | $3.99 | $50 | 45–75 min |
| Zone 2 (South Side) | 60620, 60621, 60628, 60636... | $5.99 | $75 | 60–90 min |
| Zone 3 (Greater Chicago) | 40 ZIP codes | $8.99 | $100 | 90–120 min |

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:ci      # Vitest with coverage (CI)
npm run test:e2e     # Playwright E2E tests
```

## Stripe Webhook Setup

Register your webhook in Stripe Dashboard pointing to:
```
https://yourdomain.com/api/webhooks/stripe
```

Events to subscribe to:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Environment Variables

See `.env.example` for the full list of required variables.

---

Built with ❤️ for Daveen African Food & Grocery, Chicago.
