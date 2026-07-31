# EC-008 — Performance Standards

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** `src/app/**`, `src/lib/**`, `next.config.mjs`
> **Overrides:** nothing; complements EC-004

## Purpose

Performance is a feature requirement. This document sets budgets, query rules, and caching conventions so the single Next.js app on Vercel stays fast as the roadmap grows, and so new code never silently degrades the platform.

## Current Truth (in this repo today)

- One Next.js 14.2.35 app on Vercel; serverless functions; PostgreSQL on Supabase (project `stbgamqenraauqpgtbkv`).
- Data routes typically `export const dynamic = "force-dynamic"` (e.g. all `/api/v1/*` handlers) — DB-backed pages/APIs are not statically cached.
- Prisma 7.8 with `include`/`select`; client at `src/generated/prisma` (gitignored).
- Charts use Recharts (v3) in dashboards; animations use framer-motion (v12).
- Monitoring: Sentry (performance + errors), Vercel analytics.
- Realtime dashboards exist under `src/app/admin/analytics/` (realtime, search, BI).
- No Redis, no external cache. Client state is React hooks; no TanStack Query (verified absent from package.json).

## Budgets

- LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on typical pages (storefront, dashboards).
- API p95 < 300 ms for read endpoints backed by indexed queries.
- Initial JS bundle growth per feature < 50 KB (gzipped) unless approved.
- Database queries: < 100 ms p95 on indexed lookups; list endpoints paginated.

## Rules

1. Use Prisma `include`/`select` — never N+1 loops. A loop that issues a query per row is a defect (use `findMany` + map client-side or `groupBy`/`aggregate`).
2. List endpoints MUST paginate (`paginatedResponse` in `src/lib/api-helpers.ts`). No unbounded `findMany`.
3. Add indexes for every new filter/order path: FK columns, status columns, and compound lookups (e.g. `@@index([businessId])`). Index names follow `idx_<table>_<cols>` (`@map` to match).
4. `force-dynamic` on any route reading DB or session; use `revalidate` only for genuinely static content.
5. Client components ("use client") are interactive islands; pages render server-side. Avoid dragging large libs client-side (use `next/dynamic` with `ssr: false` for canvas/editor components like Fabric.js in the POD studio).
6. Images: `next/image` with explicit sizes; no oversized uploads unoptimized. Brand colors/shadows via tokens (`src/components/ui/brand-tokens.ts`), not runtime computation.
7. Heavy loops/aggregations happen in SQL (Prisma `aggregate`/`groupBy` or SQL in migrations) — never fetch-all-then-sum client-side.
8. Embedding/LLM calls (KAI) are the slowest path: always time-bound, parallelized (see `getBusinessFacts` in `src/lib/kai/business-intelligence.ts`), with graceful fallbacks.
9. Never run long tasks in a route handler; use cron routes (EC-016) for batch work.
10. Sentry performance traces are enabled; new routes worth profiling are added to the Sentry setup.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Redis cache layer for hot storefront queries and rate limiting at the edge.
- TanStack Query / server cache for client-heavy dashboards.
- Materialized views for BI aggregations (EC-047).
- Edge functions for latency-critical paths (auth token verification, geolocation).

## Checklist (Definition of Done for this area)

- [ ] No N+1 patterns; `include`/`select` used
- [ ] List endpoints paginated
- [ ] New query paths have indexes in schema + migration
- [ ] `force-dynamic` where DB/session-backed
- [ ] Heavy libs dynamically imported on client
- [ ] Images via `next/image`
- [ ] Type check passes; no obvious bundle regressions
