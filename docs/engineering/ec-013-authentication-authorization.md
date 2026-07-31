# EC-013 — Authentication & Authorization

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/middleware.ts`, `src/lib/api-helpers.ts`, `src/lib/permissions.ts`, `prisma/seeds/roles.ts`, `src/lib/security/`
> **Overrides:** nothing

## Purpose

Defines who can access what: Supabase Auth for identity, RBAC roles for authorization, per-role guards for the API, and the security extras (OTP rate limits, 2FA, KYC) layered on top.

## Current Truth (in this repo today)

- **Identity:** Supabase Auth (`@supabase/ssr` 0.12 + `@supabase/supabase-js` 2.108). Server client resolves sessions via cookies; `src/middleware.ts` handles cookie refresh + storefront/domain routing (x-storefront-* headers).
- **Guards** (`src/lib/api-helpers.ts`): `getAuthUser(request)` → returns user or error; `requireAdmin(request)` → admin only; `requireVendor(request)` → vendor role. Used at the top of every protected handler.
- **RBAC:** roles seeded via `prisma/seeds/roles.ts` (`/api/setup/seed-roles`, Bearer `SEED_SECRET`). Permission checks via `src/lib/permissions.ts`. Known role types: customer, vendor, admin, logistics partner, manufacturer, pro (KPN professional), warehouse staff, supplier, affiliate/partner.
- **Account surfaces per role:** `/account/` (customer: wallet, orders, pay-later, passports), `/vendor/` (vendor dashboard + granular staff permissions grid with audit history at `/vendor/settings/permissions`), `/admin/` (admin), `/logistics/` (partner), `/manufacturers/` (manufacturer), `/pro/` (KPN), `/warehouse/` (staff), `/partners/` (affiliates).
- **Security extras (Phase 25):** OTP rate limiting (`otp-rate-limit.ts` — 3 attempts/15 min, 30 min lockout), identity verification / KYC (`identity-verification.ts` — Smile Identity + Onfido) with admin review at `/admin/security/identity-review`, fraud signals (`fraud-rules.ts`), credential rotation audit (`credentials.ts`).
- **Pay security:** wallet 4-digit PIN (`src/lib/pay/wallet.ts`), daily spend limits, BNPL eligibility checks (account age, order history, debt status).

## Rules

1. Identity always comes from Supabase session — never trust client-declared roles or user IDs.
2. Every protected handler starts with `getAuthUser`/`requireAdmin`/`requireVendor` and returns early on failure.
3. Role checks are server-side (`requireAdmin`/`requireVendor` + `permissions.ts`). Client-side hiding of buttons is UI only, never security.
4. New role types require: role row in `prisma/seeds/roles.ts`, permission entries in `permissions.ts`, and a dedicated portal route group.
5. OTP flows respect `otp-rate-limit.ts`; 2FA where configured must not be bypassable by user agent tricks.
6. Vendor staff permissions are granular per resource (`can_view/create/edit/delete`) and every change is audit-logged (`/vendor/settings/permissions/history`).
7. Sessions: cookie-based, HTTP-only; middleware refreshes tokens; serverless-safe (no in-memory session state).
8. KYC thresholds: identity verification before high-value actions (BNPL ≥ threshold, manufacturer gold verification, high-value withdrawals) — enforced in the relevant engines.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Social OAuth providers (verify current provider config before enabling; only enabled providers may be used).
- Passkeys / WebAuthn.
- Fine-grained RLS-per-tenant dynamic policies beyond static role policies.
- SCIM/SSO for enterprise customers (B2B plans).

## Checklist (Definition of Done for this area)

- [ ] Guard present on protected handlers
- [ ] New roles seeded + in permissions.ts
- [ ] OTP flows rate-limited
- [ ] Session handling via Supabase SSR + middleware
- [ ] No client-trusted authorization
