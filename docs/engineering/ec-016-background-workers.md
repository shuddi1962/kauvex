# EC-016 — Background Workers

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/app/api/cron/**`, `src/app/api/v1/cron/**`, `supabase/migrations/*.sql` (pg_cron), `scripts/`
> **Overrides:** nothing

## Purpose

Defines how KCC executes scheduled and batch work on serverless infrastructure without a dedicated worker fleet — today via Vercel cron routes and Supabase pg_cron functions.

## Current Truth (in this repo today)

- **Vercel cron route groups:**
  - `/api/cron/*`: abandoned-carts, buybox, group-buy-expiry, independent-backup, payouts, price-alerts, ssl-check, supplier-escalation.
  - `/api/v1/cron/*`: bnpl-charge (daily 9 AM BNPL auto-charge), cashback-process (daily cashback release), float-track (daily float income), fuel-fetch (fuel price pull), aff-calculate-commissions, aff-calculate-tiered-rates, aff-cleanup-stale-clicks, aff-expire-promotions, aff-fraud-scan, aff-process-payouts.
- **Supabase pg_cron functions** (in migrations): `00010_kcc_v3_cron_jobs.sql` defines 5 (supplier escalation, price alerts, group buy expiry, price history recording, daily cleanup); Phase 15 added `kv_aff_*` functions; BNPL/cashback/float logic is orchestrated from Vercel routes calling engine code.
- **Scheduling:** `vercel.json` exists (cron schedules declared there). Cron endpoints are POST and must validate the caller (Vercel cron header/secret).
- **Maintenance scripts:** `scripts/workspace-index.mjs` (regenerate workspace index), `scripts/setup-demo-accounts.js` (demo seeding).

## Rules

1. Batch work = cron route + engine function in `src/lib/`. Routes stay thin (guard → engine → respond).
2. Every cron endpoint authenticates its caller (secret/token or Vercel cron signature). Never callable anonymously.
3. Cron jobs are idempotent: safe to run twice (dedupe by date/key where needed — e.g. BNPL charge per agreement per due date).
4. Jobs that touch money (BNPL, cashback, payouts) log every mutation and run with the service role, never a user session.
5. Long-running work stays under Vercel's function limits; anything bigger is flagged as an evolution target rather than hacked into a handler.
6. New recurring work updates `vercel.json` schedules AND (where DB-side) a pg_cron function in a migration.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Dedicated worker service (BullMQ/Redis or a NestJS service) for heavy batch jobs.
- Dead-letter handling + retry queues for failed jobs.
- Job observability dashboard (queue depth, failures, durations).

## Checklist (Definition of Done for this area)

- [ ] Cron route guarded
- [ ] Job idempotent
- [ ] Money-touching jobs log mutations
- [ ] Schedule registered in vercel.json / migration
