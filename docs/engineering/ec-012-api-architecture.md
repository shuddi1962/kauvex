# EC-012 — API Architecture

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/app/api/v1/**`, `src/lib/api-helpers.ts`, `src/lib/validators/`
> **Overrides:** nothing

## Purpose

Defines the REST contract of KCC: route layout, response shapes, guards, validation, pagination, and versioning. Every endpoint follows the same skeleton so the frontend and external integrations can rely on consistent behavior.

## Current Truth (in this repo today)

- Route layout: `src/app/api/v1/<module>/...` (Next.js route handlers). Groups: `express`, `logistics`, `shipping`, `pay` (wallet/bnpl/cashback/float), `fuel`, `domains`, `affiliates`, `manufacturers`, `k-platform`, `kai-business`, `business-os`, `kai-ecosystem`, `admin/*` (per-module admin APIs), `cron/*` (batch jobs).
- Helpers (`src/lib/api-helpers.ts`): `successResponse(data, status)`, `errorResponse(message, status, details)`, `paginatedResponse(data, total, page, limit)`, `getAuthUser(request)`, `requireAdmin(request)`, `requireVendor(request)`, `validateBody(schema)` (Zod v4).
- Guards: every handler starts with `requireAdmin`/`getAuthUser`/`requireVendor` and returns the error response on failure.
- Validation: Zod schemas in `src/lib/validators/`, applied with `validateBody` for POST/PATCH.
- Dynamic data: handlers declare `export const dynamic = "force-dynamic"` (no static caching of DB-backed routes).
- Cron: `src/app/api/v1/cron/*` (bnpl-charge, cashback-process, float-track, fuel-fetch, aff-*) and `src/app/api/cron/*` (abandoned-carts, buybox, group-buy-expiry, independent-backup, payouts, price-alerts, ssl-check, supplier-escalation) — POST endpoints intended for Vercel cron / external schedulers.
- External integrations already consume APIs: K Platform webhooks (`src/lib/k-platform/index.ts`, HMAC-signed), carrier/label integrations under `src/app/api/v1/shipping/`, domains provisioning (`src/app/api/v1/domains/`).

## Rules

1. All routes live under `/api/v1/` (new features) — never create a second version root without approval.
2. Every response is `successResponse`/`errorResponse`/`paginatedResponse`; raw `Response.json` is only for file/download endpoints.
3. Every handler guards auth first; every mutation validates body with Zod; errors return `errorResponse(message, status)` — generic to clients, details server-side.
4. List endpoints paginate (`page`/`limit`, capped at 100) and return `paginatedResponse`.
5. Versioning: add new routes; never break old ones. Breaking changes require a `/v2/` group.
6. Internal server calls use server-side fetch with the service-role context where authorized — never expose service keys to the client.
7. Cron endpoints validate a secret/token (or Vercel cron header); they never trust an unauthenticated caller.
8. Route files are thin: parse → guard → validate → call engine in `src/lib/` → respond. Business logic lives in `src/lib/`, not in handlers.
9. Every route group ships with a matching engine module in `src/lib/` (e.g. `/api/v1/kai-business/ask` → `src/lib/kai/business-intelligence.ts`).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- OpenAPI/Swagger spec generation from route handlers.
- API contract tests in CI (see EC-009, EC-049).
- GraphQL/tRPC layers (not planned; REST remains the contract).
- Webhook delivery retry/backoff queue (currently retried inline in `k-platform`).

## Checklist (Definition of Done for this area)

- [ ] Route under `/api/v1/`; file thin, engine in `src/lib/`
- [ ] Guard applied; body validated
- [ ] `successResponse`/`errorResponse`/`paginatedResponse` used
- [ ] `force-dynamic` declared
- [ ] List endpoints paginated
- [ ] Smoke-tested happy + failure path
