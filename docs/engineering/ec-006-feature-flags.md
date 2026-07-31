# EC-006 — Feature Flags

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** `src/app/api/v1/kai/config/route.ts`, `kv_kai_config` table (migration `00039_kcc_phase27_kai.sql`), `next.config.mjs`
> **Overrides:** none (previously undocumented).

## Purpose

Feature flags decide whether a capability is live, staged, or dead — without redeploying code. On Kauvex they come in two forms: environment variables (server-side, per-environment, set in Vercel) and database configuration rows (runtime-changeable, per-row). This document defines where flags live, how they are read, how a rollout proceeds, and what a kill switch must never do.

## Current Truth (in this repo today)

- Environment-var flags: set via Vercel env vars, read at runtime in route handlers and server code with `process.env.*`. Public values use `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SUPABASE_URL`); secrets NEVER use `NEXT_PUBLIC_` (EC-007). `.env.example` documents the shape; `.env` and `.env.local` are gitignored.
- Database flags: the `kv_kai_config` table (created in `00039_kcc_phase27_kai.sql`) has columns `config_key`, `config_value`, `description`, `is_secret`, `updated_at` and is managed through `GET/POST /api/v1/kai/config` (`src/app/api/v1/kai/config/route.ts`, Supabase upsert on `config_key`). The KAI admin console (`src/app/admin/kai/page.tsx`, Configuration tab) reads and writes it.
- Runtime flags for feature phases are also reflected in the Prisma schema as model enums/status fields (e.g. `kv_kai_plans.is_active`), which the product reads directly.
- No dedicated flag SDK, no client-side flag service, and no per-user flag tables exist today.

## Rules

1. Two flag forms only: (a) server-side env vars in Vercel for deploy-time/environment differences; (b) rows in a `kv_*` config table (follow the `kv_kai_config` pattern: `config_key`, `config_value`, `description`, `is_secret`) for runtime-toggleable features. Anything else is an evolution target.
2. Server-side flags are read in route handlers and server components with `process.env.*` or a config lookup via Supabase/Prisma. Never import a client component that evaluates a server secret.
3. Client components may read public flags only via the server (passed as props or fetched from an API route). Client-side flag evaluation NEVER gates security checks — authorization is enforced server-side regardless of what the UI shows.
4. `is_secret = true` config rows are never returned in full by API responses; the API returns only a masked value (the `config` route must redact). Config rows never store passwords or API keys — those belong in Vercel env vars only.
5. Kill-switch rule: any newly shipped feature with external side effects (crons, external API calls, charging users) must be behind a flag that can turn it off without a deploy. The kill switch must stop NEW work; it must never orphan in-flight legitimate transactions (e.g. BNPL rules in AGENTS.md: never cancel a shipped order).
6. Rollout order for a new feature: (1) code merged behind a default-OFF flag; (2) enabled in staging; (3) enabled for internal use; (4) enabled for real users with monitoring (Sentry + logs); (5) when stable, flag value documented as default-ON. Remove dead flags (code paths that can never run) during later phases.
7. Every flag must be documented in the feature's EC doc or the flag's purpose must be obvious from `config_key` naming (`feature_`, `rate_`, `enabled_` prefixes). Undocumented flags are dead weight.
8. Env-var flags used in `next.config.mjs` are build-time (they freeze at build); runtime behavior flags must be read at request time, not baked into the build.
9. New flag tables in migrations follow the naming `kv_<module>_config` or reuse `kv_kai_config` when the flag is KAI-scoped.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- A feature-flag service (LaunchDarkly, Flagsmith, or Vercel Flag SDK).
- Per-user / per-vendor flag overrides.
- Client-side experimentation (A/B) framework.

## Checklist

- [ ] New feature has a default-OFF flag (env var or config row) if it has external side effects.
- [ ] Kill switch exists and stops new work only.
- [ ] No secret stored in config rows or client flags.
- [ ] Security authorization unaffected by client-side flag evaluation.
- [ ] Dead flags removed or documented.
