# EC-011 — Database Architecture

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `prisma/schema.prisma`, `supabase/migrations/`, `src/lib/api-helpers.ts`
> **Overrides:** EC-001 Rule 8 on conflicts

## Purpose

Governs the single PostgreSQL database: schema ownership, naming, migration workflow, indexing, RLS, and money/JSON conventions. One database, one Prisma schema, append-only migrations.

## Current Truth (in this repo today)

- PostgreSQL on Supabase (project `stbgamqenraauqpgtbkv`). Prisma 7.8.0, schema `prisma/schema.prisma` (~9,100 lines, 375+ models). Client generated to `src/generated/prisma` (gitignored).
- Migrations: 45 SQL files in `supabase/migrations/00001..00046` named `000NN_kcc_phaseXX_name.sql` (e.g. `00046_kcc_phase33_kai_business_intel.sql`). Applied via Supabase SQL Editor or `supabase migration up`; then `npx prisma generate`.
- Naming: Prisma models PascalCase (`KaiBusinessQuestion`); tables snake_case with `@map`; module tables carry prefixes — `kv_aff_` (affiliates), `kv_kai_` (KAI, 19+ tables), `kv_sec_` (security, 8), `kv_glx_` (global logistics), `kv_dom_` (domains), `kv_kpn_`/`kv_kps_` (professionals), `kv_mfg_` (manufacturers), `kv_kp_` (K Platform), `kv_kc_` (K Cloud), `kv_bos_` (Business OS), `kv_pay_`, `kv_lgx_`, `kv_fuel_`, `kv_pkg_`, `kv_uni_`/`kv_university_`, `kv_brand_`, `kv_digital_`, `kv_restricted_`, `kv_channel_`, `kv_aplus_`, `kv_counterfeit_`, `kv_b2b_`, `kv_business_`, `kv_wishlist_`, `kv_ussd_`, `kv_blog_`, `kv_esg_`, `kv_approval_`, `kv_ksp_`.
- Fields: snake_case via `@map`; UUID ids (`@default(uuid()) @db.Uuid`); timestamps `createdAt`/`updatedAt` with `@map("created_at"/"updated_at")`; money as `Decimal(10, 2)`; flexible extras as `Json @default("{}")`; arrays as `String[] @db.Text` where used.
- RLS: policies per table family (e.g. `kai_bq_authenticated` on `kv_kai_business_questions`). RLS is the first line of defense (EC-007).
- Indexes: `@@index` with `@map("idx_<table>_<cols>")` (e.g. `idx_kai_biz_user`); partial/specific indexes defined in migration SQL where Prisma can't express them.
- Seeding: roles via `prisma/seeds/roles.ts` (POST `/api/setup/seed-roles`, Bearer `SEED_SECRET`); demo accounts via `scripts/setup-demo-accounts.js`; domain/mfg/kai seed data inside migrations (e.g. 15 hubs in `00024`, 15 hub seeds in `00038`, carrier seeds in `00023`).
- Database functions/crons live in migrations: `kv_kai_search_business_embeddings` RPC (Phase 33, 1536-dim vectors), 5 cron functions in `00010`, BNPL/cashback/float crons, `kv_aff_*` cron functions (Phase 15).

## Rules

1. All data access is via Prisma. Raw SQL appears ONLY in `supabase/migrations/` (functions, RLS, indexes, seeds). No inline SQL in route handlers or lib.
2. Schema changes = Prisma model append/update AND a matching `supabase/migrations/000NN_...sql`. Never ship one without the other (EC-001 Rule 8).
3. Migrations are append-only and never edited after being applied. Fix forward with a new migration.
4. New module tables use the module's `kv_<mod>_` prefix; existing core tables (users, products, orders) keep their legacy names — never rename.
5. Every new table gets: UUID id, `createdAt`, RLS policy, and indexes on every FK + filter column.
6. Money is `Decimal(10, 2)` (or higher precision for escrow), never float. Currency stored per row/storefront.
7. JSON columns hold flexible metadata only — never data that needs filtering, indexing, or joins.
8. Soft-delete/audit: use status columns + audit tables where required (security events in `kv_sec_*`); no silent hard deletes of business records.
9. `npx prisma validate && npx prisma generate` must pass after every schema change, and `npx tsc --noEmit` must pass (generated client is typed).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Dedicated Postgres extensions (pgvector is used via Supabase RPC vectors; PostGIS/TimescaleDB not yet active).
- Read replicas and connection pooling at scale (Supabase pooler when needed).
- Table partitioning for very large audit/event tables.
- Database per region (multi-region deployment).

## Checklist (Definition of Done for this area)

- [ ] Prisma model + migration file both present
- [ ] Migration named `000NN_kcc_phaseXX_name.sql`
- [ ] RLS policy included for new tables
- [ ] Indexes on FKs/filter columns
- [ ] `prisma validate` + `generate` pass
- [ ] Money as Decimal; JSON only for metadata
