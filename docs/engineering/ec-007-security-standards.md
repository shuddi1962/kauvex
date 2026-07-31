# EC-007 — Security Standards

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** `src/lib/security/`, `src/lib/api-helpers.ts`, `src/lib/permissions.ts`, `src/middleware.ts`, `next.config.mjs`
> **Overrides:** EC-001 Rule 11 on conflicts

## Purpose

Defines the defense-in-depth security model of KCC: Supabase RLS as the first line, a guarded API layer as the second, plus the Phase 25 security engine (firewall, fraud, file scanning, OTP rate limits, backups, credential rotation, identity verification). Every feature must pass the checklist below before it is "done".

## Current Truth (in this repo today)

- **Database:** PostgreSQL on Supabase with RLS policies per table family (e.g. `kv_kai_business_questions` has `kai_bq_authenticated` policy). RLS is the first line of defense.
- **API guards** (`src/lib/api-helpers.ts`): `requireAdmin(request)` → admin-only; `getAuthUser(request)` → any authenticated user; `requireVendor(request)` → vendor role; `validateBody(schema)` → Zod validation (Zod v4, schemas in `src/lib/validators/`); `successResponse`/`errorResponse`/`paginatedResponse` are the only response shapes.
- **RBAC:** roles seeded by `prisma/seeds/roles.ts`; permission checks via `src/lib/permissions.ts`. Role types: customer, vendor, admin, logistics partner, manufacturer, pro (KPN), warehouse staff, supplier, affiliate/partner.
- **Phase 25 security engine** (`src/lib/security/`): `firewall.ts` (attack patterns, IP blocking, WAF log), `fraud-rules.ts` (risk scoring), `file-scan.ts` (VirusTotal + Sightengine), `otp-rate-limit.ts` (3 attempts/15 min, 30 min lockout), `backups.ts` (Cloudflare R2 lifecycle), `credentials.ts` (API key rotation audit), `identity-verification.ts` (Smile Identity + Onfido KYC). Tables `kv_sec_*` (8): blocked_requests, identity_verifications, fraud_scores, blacklist, file_scans, backups, credential_audit, otp_rate_limits.
- **Security headers** in `next.config.mjs`: X-Frame-Options DENY, X-Content-Type-Options nosniff, X-XSS-Protection, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geolocation off), HSTS preload.
- **Secrets:** Vercel env vars only, server-side. Never `NEXT_PUBLIC_` for secrets. Sentry configured (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`).
- **OTP/2FA:** Supabase Auth + `otp-rate-limit.ts`; fraud/identity review dashboards under `src/app/admin/security/` (firewall, fraud, identity-review, backups, credentials).
- **External services:** VirusTotal + Sightengine (file scans), Smile Identity + Onfido (KYC), Cloudflare R2 (backups) — all keyed via server env vars.

## Rules

1. Every route handler that touches user or tenant data MUST call `requireAdmin`, `getAuthUser`, or `requireVendor` from `src/lib/api-helpers.ts`. No handler is exempt.
2. Every POST/PATCH body MUST pass `validateBody` with a Zod schema. Never trust raw request JSON.
3. Never trust client-supplied IDs for authorization — always verify ownership/role server-side.
4. Secrets never appear in code, comments, docs, client components, or commits. `NEXT_PUBLIC_` is only for genuinely public config.
5. RLS policies are written for every new table family (authenticated scoping); API-layer checks are the second line, never the only line.
6. File uploads go through `src/lib/security/file-scan.ts` (VirusTotal + Sightengine) before storage is permanent.
7. OTP flows use `otp-rate-limit.ts` — 3 attempts per 15 minutes, 30-minute lockout. Never bypass for any user tier.
8. Security-relevant events are logged to `kv_sec_*` tables; fraud signals feed `fraud-rules.ts` risk scoring.
9. Secrets are rotated on schedule via `credentials.ts` audit tracking; admin reviews in `/admin/security/credentials`.
10. Never log tokens, session cookies, API keys, or PII. Error responses return generic messages via `errorResponse` (details stay server-side).
11. New dependencies that touch security (auth, crypto, payments, scanning) require EC-002 approval before use.
12. Domain provisioning (Vercel/Cloudflare API tokens in `src/lib/domains/provisioning.ts`) runs server-side only — tokens never reach the client.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Web application firewall service (WAF is currently a module; a managed WAF is future).
- Automated secret scanning in CI (GitHub Actions — see EC-049).
- Key rotation automation (currently tracked + reminded, not auto-rotated).
- Rate limiting at the edge (currently in-application via `security.ts`/`otp-rate-limit.ts`).

## Checklist (Definition of Done for this area)

- [ ] Route handler has a guard (`requireAdmin`/`getAuthUser`/`requireVendor`) where applicable
- [ ] Body validated with Zod via `validateBody`
- [ ] No secrets in code or client components
- [ ] New tables have RLS policies and Prisma models
- [ ] File uploads scanned; OTP flows rate-limited
- [ ] Security events logged where relevant
- [ ] `npx tsc --noEmit` passes
