# EC-048 — Cloud Infrastructure

> **Status:** Active
> **Phase:** G — Deployment
> **Canonical code:** src/middleware.ts, src/lib/domains/, src/lib/security/backups.ts, src/lib/db.ts, src/lib/supabase/, vercel.json, next.config.mjs, .env.example, supabase/migrations/
> **Overrides:** None (supersedes nothing; on conflict with AGENTS.md notes about hosting or security headers, this document is canonical).

## Purpose

Defines the production infrastructure of Kauvex Commerce Cloud: the hosted topology (Vercel frontend, Supabase backend, Cloudflare R2, Sentry), the environment-variable and secret-management rules, domain provisioning and storefront routing, monitoring and alerting, and the honest evolution targets (multi-region, dedicated database, edge functions, containerization). Every claim in this document was verified against the repo at time of writing.

## Current Truth (in this repo today)

**Hosting topology (single-region, two providers):**

- **Vercel** hosts the entire Next.js application. `vercel.json` declares `"framework": "nextjs"`, `"buildCommand": "npm run build"`, `"installCommand": "npm install"`, and pins compute to the `iad1` region. Build is `prisma generate && next build` (`package.json`).
- **Supabase** (project `stbgamqenraauqpgtbkv`) provides Postgres, Auth, Storage, and Realtime. Three client factories exist in `src/lib/supabase/`: `client.ts` (browser), `server.ts` (server components), `admin.ts` (service-role admin client), plus `middleware.ts` for session refresh. Postgres is also reached directly by Prisma through `src/lib/db.ts`, which builds a `pg` Pool on `DATABASE_URL` and passes a `PrismaPg` adapter to `PrismaClient`.
- **Prisma 7.8** (`prisma/schema.prisma`) generates its client to `src/generated/prisma/` (gitignored; produced by `prisma generate` via `postinstall` and the build script).
- **Cloudflare R2** is the backup target. `src/lib/security/backups.ts` records lifecycle in the `kv_sec_backup` table with retention of 7 daily / 4 weekly / 12 monthly, and `cleanupOldBackups()` prunes expired rows. R2 credentials come from `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET`. Backup endpoints: `src/app/api/cron/independent-backup/route.ts` and `src/app/api/v1/cron/independent-backup/route.ts`; admin UI at `src/app/admin/security/backups/`.
- **Sentry** (`@sentry/nextjs` 9.x) is initialized in three files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. DSN and org settings are injected from `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

**External APIs (all keys server-side only):**

- AI: `OPENROUTER_API_KEY` (and legacy `OPENAI_API_KEY`) for KAI features.
- Payments: Paystack (`PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`), Flutterwave, Stripe (`stripe` in `package.json`).
- Identity/KYC: `SMILE_IDENTITY_API_KEY`, `SMILE_IDENTITY_PARTNER_ID`, `ONFIDO_API_TOKEN`, `PERSONA_API_KEY`.
- File scanning: `VIRUSTOTAL_API_KEY`, `SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`.
- Communications: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TERMII_API_KEY`, `RESEND_API_KEY`, `SENDGRID_API_KEY`.
- Geocoding: `W3W_API_KEY`, `GOOGLE_MAPS_API_KEY`; geo/currency free APIs `NEXT_PUBLIC_GEO_API_URL`, `NEXT_PUBLIC_EXCHANGE_RATE_API`.
- Domain provisioning: API tokens for Vercel and Cloudflare consumed by `src/lib/domains/provisioning.ts`.
- Internal secrets: `SEED_SECRET` (RBAC seed, `src/app/api/setup/seed-roles`), demo-accounts secret (`scripts/setup-demo-accounts.js`).
- Full reference list: `.env.example` (94 lines). Local copies live in `.env.local` (gitignored); never commit `.env`.

**Environment strategy (three environments):**

1. **Production** — env vars set in the Vercel dashboard, server-side only for anything secret.
2. **Preview** — every push/PR gets a Vercel preview; env vars inherited from production or overridden in the dashboard.
3. **Local** — `.env.local` copied from `.env.example`; `npm run dev` (`next dev`). Never point local dev at production service-role keys.

**Domain provisioning and storefront routing:**

- `src/middleware.ts` is the single routing authority: skips `/_next`, `/api/*`, and dot-paths; maps core subdomains (`admin`, `seller`, `partners`, `logistics`, `warehouse`, `express`, `supplier`); recognizes 14 reserved Kauvex country TLDs (`kauvex.co.uk`, `kauvex.ng`, etc.) with currency/language config; rewrites country path prefixes (`/ng`, `/uk`, `/ca`, `/au`, ...). Helpers in `src/lib/middleware/helpers.ts`.
- `src/lib/domains/` implements provisioning: `country-domains.ts`, `vendor-subdomain.ts`, `vendor-custom-domain.ts`, `whitelabel-domain.ts`, `remove-domain.ts`, `provisioning.ts`. Domain records live in `kv_dom_*` tables; SSL is provisioned automatically by Vercel for verified domains.

**Security headers (verified in `next.config.mjs`, applied to all routes):**

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https:; media-src 'self' https:;`
- `poweredByHeader: false`; `reactStrictMode: true`.
- Note: `X-XSS-Protection` is NOT set (modern browsers ignore it); do not add it back without user approval.

**Cron and scheduled work:**

- Vercel-registered crons in `vercel.json`: `/api/cron/payouts` (02:00 daily), `/api/cron/abandoned-carts` (06:00 daily), `/api/cron/buybox` (10:00 daily).
- Additional cron endpoints exist as routes: `/api/cron/ssl-check`, `/api/cron/independent-backup`, and `/api/v1/cron/{bnpl-charge,cashback-process,float-track,fuel-fetch,aff-calculate-commissions,aff-process-payouts,aff-expire-promotions,aff-fraud-scan,aff-cleanup-stale-clicks,aff-calculate-tiered-rates}`. Scheduling for these lives outside `vercel.json` (Vercel dashboard or external scheduler); confirm before assuming a route is scheduled.
- Supabase-side scheduled functions: `supabase/migrations/00010_kcc_v3_cron_jobs.sql` defines five `cron_*` functions (supplier escalation, price alerts, group-buy expiry, price history, daily cleanup); their `cron.schedule` registrations are commented out in the migration and must be enabled in the Supabase dashboard if the DB-side jobs are wanted.

**Data residency:** the Supabase project (`stbgamqenraauqpgtbkv`) has a fixed region chosen at project creation; the exact region is visible in the Supabase dashboard project settings. Vercel compute is pinned to `iad1` via `vercel.json`. Do not claim a specific region in docs without checking the dashboard.

**Monitoring and alerting (current):**

- Sentry for error tracking and performance across client, server, and edge runtimes.
- Vercel dashboard for deployment health, function logs, runtime metrics, and cron run history.
- Admin security dashboards in-app: firewall, fraud, identity review, backups, credentials (`src/app/admin/security/`).
- No external uptime/SLO monitoring and no paging integration exist today.

## Rules

1. Never put a server-only secret in a `NEXT_PUBLIC_` variable. `NEXT_PUBLIC_` values are public by definition.
2. Never commit `.env`, `.env.local`, or any file containing real keys. `.env.example` is the only committed env file, and it ships with placeholder values.
3. Never log environment variables, headers, tokens, or PII. Secrets must not appear in Sentry breadcrumbs or Vercel logs either — scrub before logging.
4. Set every server secret in the Vercel dashboard per environment (production/preview). Local development uses `.env.local` only.
5. All external API calls must use server-side routes (`src/app/api/**`) or server components; the browser never receives a service-role or third-party secret key.
6. Use the existing client factories (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`) — never create ad-hoc Supabase clients with raw credentials.
7. Route all database access through Prisma (`src/lib/db.ts`) with `DATABASE_URL`; never hardcode connection strings.
8. Domain changes go through `src/lib/domains/` modules and the `kv_dom_*` tables — never mutate Vercel/Cloudflare DNS directly from application code outside those modules.
9. Keep the security headers in `next.config.mjs` intact; if a feature genuinely needs a relaxed policy, get explicit user approval and document the change in this file.
10. Keep `vercel.json` region pinned unless a multi-region decision is made deliberately (see evolution targets).
11. Backups: retention in `src/lib/security/backups.ts` (7/4/12) is canonical; a restore/verify must be exercised at least monthly and recorded via `verifyBackup`.
12. Every new external service must be added to `.env.example` with a placeholder and to EC-002 (Stack Bible) before code ships.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Multi-region deployment:** replicas outside `iad1` with regional Supabase/edge routing. Requires schema-level thinking about cross-region Postgres reads and cache affinity.
- **Dedicated / managed database:** moving from Supabase shared Postgres to a dedicated instance (or Supabase Enterprise) with point-in-time recovery and read replicas.
- **Supabase Edge Functions:** moving compute out of Vercel for Webhook/realtime workloads that are latency-sensitive to the database.
- **Containerization:** Docker images for the Next.js app and a Kubernetes deployment strategy. Today the app is a single Vercel deploy — no Dockerfile, no Kubernetes manifests exist.
- **Enhanced observability:** uptime/SLO monitoring, external alerting (paging) on Sentry and Vercel alerts, structured logs, OpenTelemetry traces.
- **WAF/CDN hardening:** Vercel Firewall configuration is not yet enforced in the repo; `VERCEL_FIREWALL_ENABLED` exists in `.env.example` only.

## Checklist

- [ ] New external service added to `.env.example` with placeholder and to EC-002
- [ ] Secret keys live only in Vercel dashboard (production/preview) and local `.env.local` — never in git
- [ ] No `NEXT_PUBLIC_` variable holds a server-only secret
- [ ] New API integrations called server-side only
- [ ] Security headers in `next.config.mjs` unchanged (or change documented here)
- [ ] Domain provisioning changes use `src/lib/domains/` modules
- [ ] Backup verification (restore test) recorded via `verifyBackup` within the last month
- [ ] Cron routes confirmed scheduled in Vercel dashboard when added to `vercel.json` or the cron folders
- [ ] Supabase region and Vercel region documented correctly (checked in dashboards, not assumed)
