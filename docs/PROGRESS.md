# Kauvex — Project Progress & Handover

> This file is the **single source of truth for resume points**. If you (or an AI
> session) come back after a break, read this first, then AGENTS.md, then continue
> from the Pending list below.

## How the docs are organized

| Location | What it is |
|----------|-----------|
| `AGENTS.md` | Living project context (stack, modules, rules) — always current |
| `docs/canvas/` | **22 vision documents** (01-21 + system-architecture.md) — WHAT Kauvex becomes |
| `docs/engineering/` | EC Blueprint (26 of 50 written) — HOW the code is built |
| `docs/PROGRESS.md` | This file — what's done, what's not, where to resume |
| `.opencode/workspace-index.md` | Fast-orientation index (regenerate: `node scripts/workspace-index.mjs`) |
| `.opencode/command/kai.md` | `/kai <question>` command (needs opencode restart to activate) |

## Complete (done, verified)

- **Phases 0–28** — all complete per AGENTS.md (MVP through KPN/Industry OS, security, domains, fuel, logistics, pay, affiliates, manufacturers, etc.)
- **Phases 29–30 — Business OS + KAI Ecosystem**: migrations `00042_kcc_phase29_business_os.sql`, `00043_kcc_phase30_kai_ecosystem.sql` written; `src/app/business-os/`, `src/lib/business-os/`, `src/app/kai/`, `src/components/kai-ecosystem/`, `src/app/api/v1/business-os/`, `src/app/api/v1/kai-ecosystem/` built.
- **Phase 31 — K Platform** (complete): `00044_kcc_phase31_k_platform.sql`; engine `src/lib/k-platform/index.ts` (API keys, OAuth, webhooks + HMAC, event bus, module marketplace, reviews, developer earnings, dashboard); API routes `src/app/api/v1/k-platform/*`; portal `src/app/k-platform/` (dashboard, marketplace, keys, oauth, webhooks, events, earnings); shared UI `src/components/k-platform/shared.tsx`.
- **Phase 32 — K Cloud**: migration `00045_kcc_phase32_k_cloud.sql` written (code not yet verified as part of Phase 33 work).
- **Phase 33 — KAI Business Intelligence** (engine + API + pages written):
  - Migration `00046_kcc_phase33_kai_business_intel.sql` (business_id on knowledge chunks, `kv_kai_search_business_embeddings` RPC, `kv_kai_business_questions` table).
  - Prisma updated: `KaiKnowledgeChunk.businessId`, new `KaiBusinessQuestion` model. `prisma validate + generate` passed (client → `src/generated/prisma`).
  - Engine `src/lib/kai/business-intelligence.ts` (live facts from Bos* models, 9 intent routes, business RAG, training, hybrid/live/rag/fallback modes).
  - APIs: `src/app/api/v1/kai-business/{brain,ask,facts,questions}` + admin API `src/app/api/v1/admin/kai/business-intelligence`.
  - Pages: `src/app/business/ai/page.tsx` (Ask KAI), `src/app/admin/kai/business-intelligence/page.tsx`; nav entry added in `src/app/business/layout.tsx`.
- **Workspace AI infra**: `scripts/workspace-index.mjs`, `.opencode/workspace-index.md` (156 lines), `.opencode/agent/workspace-context.md` (KAI subagent), `.opencode/command/kai.md`.
- **Vision docs**: all 21 canvas docs + `system-architecture.md` saved in `docs/canvas/`.
- **EC Blueprint**: 26 of 50 docs written in `docs/engineering/` (see Pending #3).

## Pending — resume points (NOT done / NOT verified)

1. **Apply migrations 00042–00046 to the database.** They are written but NOT applied
   to Supabase (`stbgamqenraauqpgtbkv`). Apply via SQL Editor (paste file contents)
   or `supabase migration up`, then `npx prisma generate`.
2. **Verify Phase 33/31 code compiles.** The last `npx tsc --noEmit` was interrupted
   before finishing. Run: `npx prisma validate && npx prisma generate` then
   `npx tsc --noEmit`. Fix any errors in the Phase 31/33 files.
3. **Finish the EC Blueprint** — 26/50 written. Present:
   - Phase A missing: EC-007 Security, EC-008 Performance, EC-009 Testing, EC-010 Documentation
   - Phase B missing (all): EC-011 Database, EC-012 API, EC-013 Auth, EC-014 Multi-tenancy, EC-015 Events, EC-016 Workers, EC-017 Notifications, EC-018 Search, EC-019 Storage, EC-020 Caching
   - Phase C missing: EC-027 RAG, EC-028 AI Governance
   - Phase E missing: EC-040 Production Planning, EC-041 Machine Integrations, EC-042 Quality Control
   - Phase F missing (all): EC-043 Marketplace, EC-044 Vendor, EC-045 Business OS, EC-046 Financial, EC-047 Analytics
4. **Wire `/business/brain` training UI** to POST `/api/v1/kai-business/brain` (page exists but upload/training flow not connected to new engine).
5. **Admin sidebar link** for `/admin/kai/business-intelligence` in the admin shell.
6. **Restart opencode** to activate the `/kai` command and KAI subagent; regenerate
   `.opencode/workspace-index.md` after major changes (`node scripts/workspace-index.mjs`).
7. **Roadmap phase 34+** — from vision docs (K Cloud, K Enterprise, K Data, K Trust, K Market, K Labs) once above is verified.

## Key commands

```bash
npx prisma validate && npx prisma generate   # schema check + client
npx tsc --noEmit                              # type check
node scripts/workspace-index.mjs              # regenerate workspace index
npm run dev                                   # local dev
```

## Migration naming rule

`supabase/migrations/000NN_kcc_phaseXX_name.sql` — next number after the highest existing.

## Demo accounts

`manufacturer@kauvex.com / Manufacturer1!` (vendor + manufacturer profile),
`wholesale@kauvex.com / Wholesale1!` (customer) — seeded via
`scripts/setup-demo-accounts.js` (Bearer: `demo-accounts-secret-key-2026`).
