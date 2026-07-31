# EC-009 — Testing Standards

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** repo-wide; `package.json` scripts
> **Overrides:** nothing

## Purpose

Defines how KCC verifies correctness today and how it will evolve. Honest baseline: the repo has no test framework configured yet (no test script in package.json). The standard is a pragmatic ladder: type checks → build gate → manual API smoke tests → targeted automated tests as the platform grows.

## Current Truth (in this repo today)

- Scripts in `package.json`: `dev`, `build` (`prisma generate && next build`), `start`, `lint` (`next lint`), `postinstall`, `db:generate`, `db:push`, `db:studio`, `seed:partners`.
- No unit/integration test framework installed (no vitest/jest in dependencies — verified).
- Verification today: `npx prisma validate && npx prisma generate` for schema correctness; `npx tsc --noEmit` for type safety; `npm run build` (or `next build`) as the integration gate; manual smoke tests via browser and `curl` against API routes.
- Seed scripts exist (`prisma/seeds/roles.ts`, `scripts/setup-demo-accounts.js` with demo accounts for manual testing: `manufacturer@kauvex.com`, `wholesale@kauvex.com`).
- Migration discipline (EC-011) is the de-facto database test: migrations are reviewed as SQL before applying.

## Rules

1. Every change MUST pass `npx tsc --noEmit` before being considered done. Type errors are release blockers.
2. Schema changes require `npx prisma validate` to pass, and a matching migration file (EC-011).
3. Before committing a feature, run a manual smoke test of the primary user path (page loads, API returns `successResponse` shape, no console errors).
4. API route changes are smoke-tested with a request (curl or browser devtools) covering happy path + one failure path (validation/authorization).
5. Never skip verification "because it's urgent" — a green `tsc` is the minimum bar.
6. Tests written later MUST be isolated from the live Supabase database (use a test project or mocks), never run against production data.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Vitest + React Testing Library for unit/component tests (first test framework to adopt).
- Playwright for end-to-end flows (storefront checkout, vendor onboarding, admin panels).
- API contract tests against `/api/v1/*` with a staging Supabase project.
- CI gates (see EC-049): tsc + lint + tests in GitHub Actions before deploy.

## Checklist (Definition of Done for this area)

- [ ] `npx tsc --noEmit` passes
- [ ] `npx prisma validate` passes (if schema touched)
- [ ] Primary user path smoke-tested
- [ ] API happy + failure path smoke-tested
- [ ] No tests skipped silently; known gaps recorded in docs/PROGRESS.md
