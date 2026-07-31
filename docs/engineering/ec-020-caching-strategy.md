# EC-020 — Caching Strategy

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/app/**` (route exports), `next.config.mjs`, `src/lib/**`
> **Overrides:** EC-008 on details

## Purpose

Defines where KCC caches — and more importantly where it deliberately does not. Serverless + live business data means most routes are dynamic; caching is applied only where it is safe and correct.

## Current Truth (in this repo today)

- **Dynamic by default:** DB/session-backed routes declare `export const dynamic = "force-dynamic"` — no stale reads of orders, wallets, inventory, or KAI data.
- **Client state:** React hooks (`useEffect` + fetch) — no TanStack Query, no client cache layer (verified in package.json). Data fetching is per-mount with loading states.
- **Static assets:** `next/image` with automatic optimization; Vercel CDN caches public assets; `public/` files static.
- **Storefront content:** middleware-driven storefront resolution sets `x-storefront-*` headers; static marketing pages may use ISR where genuinely stable.
- **Database:** Supabase/Postgres caching at query level; no Redis in front (evolution target).
- **Embedding/LLM calls (KAI):** no caching of answers today; questions persist to `kv_kai_business_questions` (audit + history, reusable as a cheap "cache").

## Rules

1. Never cache anything user/tenant-specific without an explicit key including the tenant + user identity, and even then prefer correctness over hit-rate.
2. Live data (orders, wallet, inventory, BNPL, KAI facts) is always `force-dynamic` — a cached order total is a bug.
3. Static pages/segments use `revalidate` only when content changes rarely (marketing, help); never on transaction-adjacent pages.
4. Client components fetch on mount with loading/empty/error states; no stale-while-revalidate hacks in product code.
5. Previous KAI answers may be surfaced from `kv_kai_business_questions` as history, but a fresh ask always re-computes live facts (EC-027).
6. Any future cache layer must key on tenant + user + storefront and support immediate invalidation on writes (EC-014).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Redis cache for hot storefront catalog queries and session-adjacent data.
- TanStack Query for dashboards with polling/refetch windows.
- Edge caching with cache-tag invalidation on the Vercel platform.
- Response caching for embedding lookups (cached by chunk id + query hash).

## Checklist (Definition of Done for this area)

- [ ] Live-data routes `force-dynamic`
- [ ] No stale caching of tenant data
- [ ] Client loading/error states on every fetch
- [ ] ISR only on genuinely static pages
