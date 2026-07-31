# Kauvex Engineering Blueprint (EC Series)

The engineering "constitution" of the Kauvex Commerce Cloud (KCC). These 50 documents
are written for the AI coding agent (OpenCode) and human engineers alike. They are the
**permanent reference** that every coding session must follow — the bridge between the
20 vision documents (`docs/canvas/`) and the actual codebase.

> **Rule zero:** every EC document describes the **actual repo** (Next.js 14, Prisma,
> Supabase, single app). Anything not yet built is marked `Evolution target` and is
> never presented as current truth.

## How to use these documents

1. **EC-001 (Constitution)** — read first, always. Overrides all other docs on conflict.
2. **EC-002 (Stack Bible)** — the only approved libraries. Do not introduce anything
   not listed here without updating EC-002 first.
3. **EC-004 (Coding Standards)** — how code is written and reviewed.
4. **Domain docs** (EC-011..EC-047) — deep-dive per module. Consult when working in
   that area.
5. **EC-050 (Master Prompt)** — the session opener every AI coding session starts with.

## Document Index

### Phase A — Engineering Foundation

| ID | Document | Purpose |
|----|----------|---------|
| EC-001 | Engineering Constitution | Master rulebook; allowed/forbidden actions; folder ownership; review rules |
| EC-002 | Technology Stack Bible | Every approved technology, library, and tool |
| EC-003 | Repository Structure | Canonical folder map of the single repo |
| EC-004 | Coding Standards | TypeScript, React, Prisma, SQL, styling conventions |
| EC-005 | Git & Branching Strategy | Branch naming, commit style, PR expectations |
| EC-006 | Feature Flag Architecture | Runtime + code flags, rollout, kill switches |
| EC-007 | Security Standards | Auth, RLS, API keys, secrets, OWASP checklist |
| EC-008 | Performance Standards | Budgets, caching, image/video, DB query rules |
| EC-009 | Testing Standards | Test pyramid, frameworks, what must be tested |
| EC-010 | Documentation Standards | Where docs live, formats, doc-strings, READMEs |

### Phase B — Platform Architecture

| ID | Document | Purpose |
|----|----------|---------|
| EC-011 | Database Architecture | Prisma schema, naming, migrations, RLS, indexes |
| EC-012 | API Architecture | REST `/api/v1/*`, response helpers, validation, versioning |
| EC-013 | Authentication & Authorization | Supabase Auth, RBAC, sessions, 2FA |
| EC-014 | Multi-tenancy | Storefronts, vendors, orgs, scoping rules |
| EC-015 | Event System | Domain events, webhooks, K Platform event bus |
| EC-016 | Background Workers | Cron routes, Supabase cron, queue evolution target |
| EC-017 | Notification Engine | Email/SMS/push/in-app template system |
| EC-018 | Search Architecture | Postgres FTS, `search-engine.ts`, embedding search |
| EC-019 | File & Asset Storage | Supabase Storage, R2, uploads, file scanning |
| EC-020 | Caching Strategy | Client/server caching, revalidation, Supabase cache |

### Phase C — KAI Architecture

| ID | Document | Purpose |
|----|----------|---------|
| EC-021 | KAI Core | Platform AI brand, orchestration, cost controls |
| EC-022 | AI Agent System | `kv_kai_agents`, permissions, agent messages |
| EC-023 | Memory System | Knowledge chunks, company brain, RAG memory |
| EC-024 | Prompt Library | KAI voice, system prompts, prompt versioning |
| EC-025 | Tool Calling Framework | Skill/tool invocation model for agents |
| EC-026 | Model Routing | OpenRouter models, fallbacks, per-feature selection |
| EC-027 | RAG Architecture | Embeddings, RPC search, business-scoped retrieval |
| EC-028 | AI Governance | Safety, moderation, audit, monetization (usage billing) |

### Phase D — Universal Design Engine

| ID | Document | Purpose |
|----|----------|---------|
| EC-029 | Universal CAD Engine | Parametric 2D/3D design core (evolution target) |
| EC-030 | 2D Graphics Engine | Fabric.js canvas layer (POD studio, current) |
| EC-031 | 3D Engine | Three.js/R3F viewports (evolution target) |
| EC-032 | Material System | Material/color/fabric catalog model |
| EC-033 | Physics & Simulation | Constraints, measurements, validation (evolution target) |
| EC-034 | Parametric Modeling | Configurator sessions (`kv_kpn_configurator_sessions`) |
| EC-035 | Rendering Pipeline | Server-side render, thumbnails, exports |
| EC-036 | Export System | PDF/SVG/PNG/vector export, print files |

### Phase E — Manufacturing Engine

| ID | Document | Purpose |
|----|----------|---------|
| EC-037 | Manufacturing Workflow | Mfg portal stages, production tracker |
| EC-038 | BOM Engine | Bill of materials model (evolution target) |
| EC-039 | Cost Estimation | Landed cost, quote drafting, escrow |
| EC-040 | Production Planning | Production orders, 8-stage pipeline |
| EC-041 | Machine Integrations | CNC/print integrations (evolution target) |
| EC-042 | Quality Control | Verification tiers, samples, disputes |

### Phase F — Marketplace & Business OS

| ID | Document | Purpose |
|----|----------|---------|
| EC-043 | Marketplace Engine | Catalog, buybox, offers, bundles, search |
| EC-044 | Vendor Architecture | Vendor panels, store builder, permissions |
| EC-045 | Business OS Modules | BOS models (sales, inventory, finance, tasks) |
| EC-046 | Financial Engine | Pay wallet, BNPL, payouts, accounting |
| EC-047 | Analytics Architecture | Dashboards, realtime analytics, BI |

### Phase G — Deployment

| ID | Document | Purpose |
|----|----------|---------|
| EC-048 | Cloud Infrastructure | Vercel, Supabase, R2, domains, monitoring |
| EC-049 | CI/CD Pipeline | GitHub Actions, builds, previews, deploys |
| EC-050 | OpenCode Master Prompt | Session opener; role, rules, Definition of Done |

## Conventions

- File names: `ec-00N-short-name.md` in `docs/engineering/`.
- Every doc has the same header block (see template below) so the agent can scan quickly.
- `Evolution target` = not in the repo today. Marked with a warning box in every doc.
- The 20 vision documents (`docs/canvas/`) define *what*; the EC series defines *how*.

## Template

```markdown
# EC-00N — Title

> **Status:** Active | Draft
> **Phase:** A — Engineering Foundation
> **Canonical code:** src/lib/..., src/app/...
> **Overrides:** (list docs this one supersedes on conflict)

## Purpose
One paragraph: what this document governs and why.

## Current Truth (in this repo today)
Concrete facts — real paths, real models, real commands.

## Rules
Numbered, enforceable rules for the agent.

## Evolution Targets
Future-state items that do NOT exist in the repo yet. Never built speculatively;
only when an EC-xxx revision or the roadmap says so.

## Checklist (Definition of Done for this area)
```

## Ownership

- Owner: OpenCode + user (Founder/Technical Lead).
- Change process: any change to EC-001..EC-005 must be a deliberate user-approved
  edit; other EC docs may evolve with new phases, always keeping "Current Truth" honest.
