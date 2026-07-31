# EC-015 — Event System

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/lib/k-platform/index.ts`, `src/app/api/v1/k-platform/webhooks/`, `src/app/api/v1/cron/**`, `src/app/api/cron/**`
> **Overrides:** nothing

## Purpose

Defines how KCC moves "something happened" signals between modules without coupling them. Today: per-module domain events + the K Platform event bus/webhooks + cron-driven batch processing. A dedicated queue is an evolution target.

## Current Truth (in this repo today)

- **K Platform event bus** (`src/lib/k-platform/index.ts`): `emitEvent` records events; webhook endpoints create/test/deliver webhooks with HMAC signature verification. Portal at `/k-platform` (Event Bus + Webhooks tabs). This is the developer-facing event surface (Phase 31).
- **Cron-driven domain processing** (batch substitutes for queues): Supabase pg_cron functions in migrations (`00010` — supplier escalation, price alerts, group buy expiry, price history, daily cleanup; `kv_aff_*` — commission calc, payouts, promotion expiry, fraud scan, tier rates) + Vercel cron routes: `/api/v1/cron/*` (bnpl-charge, cashback-process, float-track, fuel-fetch, aff-*) and `/api/cron/*` (abandoned-carts, buybox, group-buy-expiry, independent-backup, payouts, price-alerts, ssl-check, supplier-escalation).
- **Per-module signals:** BNPL auto-charge (daily 9 AM), cashback processing (30-day pending → release), float tracking, fuel price fetch, buybox recalculation, affiliate click/conversion tracking (`src/lib/affiliates/tracking.ts` + `/api/v1/affiliates/clicks`, `/convert`).
- **Webhook consumers:** external developers via K Platform; internal integrations use direct engine calls (same-process) rather than webhooks.

## Rules

1. Cross-module notifications use the K Platform event bus + webhooks (external) or engine calls (internal same-process). Do not build a new ad-hoc event mechanism.
2. Batch/background work goes in cron routes or Supabase cron functions — never long-running work inside a request handler (EC-008 Rule 9, EC-016).
3. Webhook deliveries are HMAC-signed; receivers must verify signatures (documented in K Platform webhook UI).
4. Events are recorded with payload + source + timestamp; event tables are append-only (audit-friendly).
5. When a feature needs "do this after that" semantics that a cron poll can't express, note it in docs/PROGRESS.md — the queue evolution is a deliberate, user-approved change.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Redis + BullMQ worker service for queued jobs, retries with backoff, and scheduled fan-out.
- Outbox pattern for transactional event publishing (DB row + reliable delivery).
- Dead-letter queues and consumer observability dashboards.

## Checklist (Definition of Done for this area)

- [ ] Cross-module signal uses event bus/webhook or cron — no ad-hoc mechanism
- [ ] Long tasks routed to cron, not handlers
- [ ] Webhooks HMAC-signed
- [ ] Events append-only with timestamps
