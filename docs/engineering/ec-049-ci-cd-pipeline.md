# EC-049 — CI/CD Pipeline

> **Status:** Active
> **Phase:** G — Deployment
> **Canonical code:** vercel.json, package.json, next.config.mjs, supabase/migrations/, scripts/workspace-index.mjs
> **Overrides:** None (supersedes nothing; the absence of CI is stated here as fact, not hidden).

## Purpose

Defines how Kauvex code gets from a commit to production: what the pipeline does today (Vercel auto-deploy from git), what quality gates must be added to compensate for the build's disabled checks, and the honest target pipeline to establish. The build on Vercel deliberately skips TypeScript and ESLint (`next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to fit the 2-core/8GB build machine), so the gates this document defines are not optional ceremony — they are the only thing standing between a broken commit and production.

## Current Truth (in this repo today)

**What exists:**

- **No CI configuration.** Verified: there is no `.github/` directory and no workflow files. There is no GitHub Actions pipeline, no test runner, and no post-deploy smoke automation.
- **Vercel auto-deploy from git.** Pushes to the connected branch deploy automatically. `vercel.json` sets `"framework": "nextjs"`, `"buildCommand": "npm run build"`, `"installCommand": "npm install"`, and compute region `iad1`.
- **Build pipeline:** `npm run build` = `prisma generate && next build` (`package.json`). `postinstall` also runs `prisma generate`, so fresh installs generate the Prisma client before build.
- **Build skips quality gates:** `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` with an explicit comment (memory limits on Vercel's build machine). This means a deploy can succeed with type errors and lint errors.
- **Available scripts** (`package.json`): `dev` (next dev), `build`, `start` (next start), `lint` (next lint), `db:generate`, `db:push` (prisma db push — do NOT use in production), `db:studio`, `seed:partners`.
- **No `typecheck` script exists.** The standard is running `npx tsc --noEmit` manually (this is how type errors are caught today). Adding a `typecheck` npm script is a recommended improvement (see Rules).
- **No tests exist.** No test framework is installed in `package.json` and no `test` script is defined.
- **Migrations are manual.** Schema migrations live in `supabase/migrations/00001_initial_schema.sql` through `00046_kcc_phase33_kai_business_intel.sql` (46 files) and are applied by hand via the Supabase SQL Editor (project `stbgamqenraauqpgtbkv`) or `supabase migration up`. Nothing in CI applies them, and nothing should.
- **Repo repair tooling:** `scripts/repair_migrations.ps1` and `scripts/repair_all.bat` exist for fixing migration drift locally.
- **Workspace index:** `scripts/workspace-index.mjs` regenerates `.opencode/workspace-index.md` (`node scripts/workspace-index.mjs`) — run it after major structural changes so the agent orientation file stays fresh.

**What does NOT exist (verified):**

- No GitHub Actions workflows (no `.github/`).
- No test script, no test framework, no test directory.
- No staging/QA environment beyond Vercel previews.
- No automated migration validation, no drift check, no post-deploy smoke checks.
- No Dockerfile, no container registry, no Kubernetes manifests.

## Rules

1. **The pipeline to establish (in order of priority):**
   - (a) PR previews — every pull request gets a Vercel preview deployment; the preview is the review artifact.
   - (b) Type gate — run `npx tsc --noEmit` before merge. Because the build skips type checking, this is mandatory, not best-effort. Improvement: add `"typecheck": "tsc --noEmit"` to `package.json` scripts and use it in docs and commands.
   - (c) Lint gate — run `npm run lint` (i.e., `next lint`) when a lint configuration is in place and passing; today `lint` exists but nothing enforces it.
   - (d) Build verification — a local `npm run build` (or a Vercel preview build) must pass before merge.
2. **Migration discipline:**
   - Schema changes ship as two artifacts: a Prisma model update in `prisma/schema.prisma` and a numbered SQL file `supabase/migrations/000NN_kcc_<phase>_<name>.sql` (next free number after the highest existing file).
   - Migrations are applied manually to Supabase (SQL Editor or `supabase migration up`) by the user — never automatically from CI, never during build.
   - `prisma db push` (`db:push`) is for local prototyping only; it is never used against the production database.
   - After a schema change, run `npx prisma generate` so the client in `src/generated/prisma/` is current; the build regenerates it anyway.
   - Migration order must be preserved; do not renumber, delete, or hand-edit applied migration files (see `scripts/repair_migrations.ps1` only if the user asks).
3. **Post-deploy smoke checks (manual until automated):** after a production deploy, verify in this order: homepage + one storefront path renders; a server API route answers (`/api/v1/...`); Sentry shows no new errors in the last 5 minutes; Vercel function logs show healthy invocations; any touched cron route ran or is pending without failure.
4. **Cron awareness:** changes to `vercel.json` crons or `src/app/api/cron/**` / `src/app/api/v1/cron/**` routes must be called out in the change summary; cron scheduling outside `vercel.json` is managed in the Vercel dashboard.
5. **Previews over local-only work:** if a change cannot be exercised in a Vercel preview (env-dependent), state that explicitly in the summary instead of claiming it was deployed-tested.
6. **Do not weaken the build skip flags** without user approval; instead strengthen the pipeline so the flags are a documented trade-off, not a hidden risk. Revisit removing them when the build machine is upgraded or the app is split.
7. **Version tags and releases:** no release process exists; deploys are plain pushes to the connected branch. Do not invent tag-based release steps in docs or scripts without user approval.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **GitHub Actions pipeline:** a `.github/workflows/` file with jobs: `typecheck` (`npx tsc --noEmit`), `lint` (`next lint`), `test` (once a framework exists), `build` (docker or `npm run build`), and a preview-deploy step. Blocks merge on failure.
- **Test infrastructure:** a test framework (to be chosen via EC-009) and a `test` script in `package.json`.
- **Automated migration validation:** a CI job that lints SQL migrations (`supabase db lint`), checks numbering continuity (00001..000NN, no gaps/duplicates), and dry-runs migrations against a disposable database. It never touches production.
- **Post-deploy smoke automation:** a scheduled or deploy-triggered check hitting key routes and reporting to Sentry/alerting.
- **Staging environment:** a dedicated branch/database pairing so migrations are rehearsed before touching production.
- **Docker images:** containerizing the app (Dockerfile, registry, tags) for reproducible builds and portable deploys. No Dockerfile exists today.
- **Dependency scanning:** automated audit of `package.json`/lockfile for known vulnerabilities in CI (e.g., `npm audit` step) and Dependabot or equivalent.

## Checklist

- [ ] `.github/` created only as a deliberate user-approved step, not silently
- [ ] `npx tsc --noEmit` passes locally before any merge recommendation
- [ ] `npm run lint` passes (once lint is clean in the repo)
- [ ] `npm run build` passes locally before merge
- [ ] Schema change ships with both `prisma/schema.prisma` update and `supabase/migrations/000NN_*.sql` (next free number)
- [ ] `npx prisma generate` run after schema edits; client committed/regenerated as the repo expects
- [ ] No CI step ever runs migrations or `prisma db push` against production
- [ ] Post-deploy smoke checks run and results stated in the change summary
- [ ] Cron route changes flagged in the change summary
- [ ] `node scripts/workspace-index.mjs` re-run after major structural changes
