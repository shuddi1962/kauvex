# EC-001 — Engineering Constitution

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** entire repo — `src/`, `prisma/schema.prisma`, `supabase/migrations/`, `docs/`
> **Overrides:** all other EC documents, AGENTS.md, and older guidance on conflict. Supersedes nothing else in the repo.

## Purpose

This is the master rulebook for the Kauvex Commerce Cloud (KCC): one Next.js 14 App Router + TypeScript application, one PostgreSQL database on Supabase, one Prisma schema, and one AI coding agent (OpenCode) working alongside the human founder. It defines the vision, the engineering principles, what the agent may and may not do, folder ownership, review rules, security principles, and the conflict-resolution hierarchy. Every other EC document derives from this one; where any document disagrees, this one wins.

## Current Truth (in this repo today)

- Single application: Next.js 14.2.35 App Router, code in `src/` (`src/app`, `src/lib`, `src/components`, `src/middleware.ts`, `src/generated/prisma`).
- No monorepo, no separate services, no queue workers. All runtime code ships in one Vercel deployment.
- Database: PostgreSQL on Supabase (project `stbgamqenraauqpgtbkv`). Prisma 7.8.0 schema at `prisma/schema.prisma` (9111 lines, ~375+ models); client generated to `src/generated/prisma` by `npx prisma generate` (`package.json` build = `prisma generate && next build`; `src/generated/prisma` is gitignored).
- Schema changes ship as SQL migrations in `supabase/migrations/00001..00046` (e.g. `00046_kcc_phase33_kai_business_intel.sql`).
- Git: single `main` branch, tracked against `origin/main`. No branching conventions documented until EC-005.
- The AI agent is a first-class engineer on this repo: it reads AGENTS.md, the EC series, and `.opencode/workspace-index.md` (regenerated via `node scripts/workspace-index.mjs`).
- Vision lives in `docs/canvas/` (21 numbered vision documents 01–21 plus `system-architecture.md`). These are user-owned and are the "what"; the EC series is the "how".

## Rules

1. The repo is and stays ONE Next.js application. Any change that implies a second service (NestJS, Redis/BullMQ workers, monorepo) is an evolution target and requires explicit user approval before any code is written.
2. The agent MAY create new files anywhere under `src/`, append models to `prisma/schema.prisma`, and add new SQL files under `supabase/migrations/` following the `NNN_kcc_phaseXX_name.sql` naming rule (EC-010).
3. The agent MUST NOT rewrite or refactor stable modules (as listed under Folder Ownership below) without explicit user instruction. "Stable" means: shipped, working, and not the subject of the current task.
4. The agent MUST NOT perform mass renames (files, models, columns, routes) across the repo. Renames happen one feature at a time, with a stated reason and user approval.
5. The agent MUST NOT introduce any library, framework, or service not listed in EC-002. New libraries enter only by updating EC-002 first, with user approval.
6. The agent MUST NOT edit anything in `docs/canvas/` — those documents are user-owned vision. The agent MAY reference them.
7. The agent MUST NOT modify `docs/engineering/README.md` or EC-001..EC-005 without explicit user approval. EC-006..EC-010 may evolve with new phases, but "Current Truth" sections must stay honest.
8. Database changes require BOTH a Prisma schema append (if a model is affected) and a Supabase SQL migration. Never ship one without the other.
9. Every session begins by reading AGENTS.md and `.opencode/workspace-index.md` if present; every change ends with Definition of Done from the applicable EC document.
10. Conflict hierarchy, highest to lowest: (1) explicit user instruction in the current session, (2) EC-001, (3) other EC documents, (4) AGENTS.md, (5) `docs/canvas/` vision. When EC docs and user instruction conflict, the user wins; when EC docs conflict with each other, EC-001 wins.
11. Security is non-negotiable and follows EC-007: secrets live only in Vercel env vars (server-side), never in code, comments, or commits. Never log secrets or tokens.
12. Performance and accessibility are feature requirements, not afterthoughts (EC-008, EC-004). A feature that ships and makes the platform slower without a documented reason is a defect.
13. Every fact written by the agent into docs must be verified against the repo. Never document a path, model, or command that does not exist today.
14. The agent commits only when explicitly asked (EC-005). Uncommitted work is normal between sessions.

## Folder Ownership

- `docs/canvas/` — user-owned vision. Agent reads only.
- `docs/engineering/` — agent-owned engineering standards (EC series). EC-001..EC-005 user-approved to change; EC-006..EC-010 may evolve with phases.
- `AGENTS.md` — shared project context. Agent updates when facts change (new phases, new module directories).
- `src/app/` — application routes and pages. Agent-owned, additive.
- `src/lib/` — module engines (e.g. `src/lib/pay/`, `src/lib/logistics/`, `src/lib/kai/`). Agent-owned, additive; stable modules protected by Rule 3.
- `src/components/` — shared UI (`src/components/ui/`) and per-area components. Agent-owned, additive.
- `src/generated/prisma/` — generated client. NEVER hand-edited; regenerated via `npx prisma generate` (gitignored).
- `prisma/schema.prisma` — single source of truth for models. Appends only, unless user approves a migration of the schema.
- `supabase/migrations/` — SQL migrations, append-only, never edited after applying (EC-010).
- `scripts/` — maintenance scripts (`workspace-index.mjs`, `setup-demo-accounts.js`, `verify_rls.js`, etc.). Agent-owned.
- `public/` — static assets. Agent-owned, additive.
- Root config files (`next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `prisma.config.ts`, sentry configs) — agent-owned but changes must be deliberate and verified against build behavior.

## Security Principles

- Supabase RLS is the first line of defense; the API layer is the second. Every route handler guards with `requireAdmin` / `getAuthUser` / `requireVendor` from `src/lib/api-helpers.ts` as appropriate.
- Secrets are server-side only via Vercel env vars. Nothing secret is ever written to client components, the `NEXT_PUBLIC_` namespace, code, or docs.
- File uploads are scanned (VirusTotal/Sightengine via `src/lib/security/file-scan.ts`); identity checks go through `src/lib/security/identity-verification.ts` (Smile Identity/Onfido).
- Auditability: security-relevant actions are logged to `kv_sec_*` tables; never trust client-supplied roles or IDs.

## Performance Targets

- Core Web Vitals: LCP under 2.5 s, INP under 200 ms, CLS under 0.1 on typical pages (EC-008 defines budgets and query rules).
- Data pages are server-rendered; interactive islands are minimal "use client" components.
- Any endpoint that reads the database must use Prisma with `include`/`select` instead of N+1 loops, and list endpoints must paginate.

## Scalability Goals

- Current scale target: the single Next.js app on Vercel with PostgreSQL handles the full roadmap through MVP and Phase A of expansion. If a workload outgrows the current shape (long-running jobs, event fan-out), the answer is an evolution target (Redis/BullMQ or NestJS services), approved by the user first — never a homegrown background executor in a route handler.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Separate service layer (NestJS) for background processing.
- Redis cache + BullMQ queue for jobs.
- Monorepo or multi-package structure.
- Test framework (see EC-009 — Vitest is the intended evolution).

## Checklist

- [ ] EC-001 read at the start of every session; conflicts resolved per Rule 10.
- [ ] Changes are additive; no stable module rewritten, no mass renames.
- [ ] No new library without EC-002 approval.
- [ ] `docs/canvas/` untouched.
- [ ] DB changes ship as Prisma append + SQL migration pair.
- [ ] No secrets in code, docs, or commits; no logs of tokens.
- [ ] Definition of Done from the relevant EC document satisfied.
