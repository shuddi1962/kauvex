# EC-027 — RAG Architecture

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** `src/lib/kai/business-intelligence.ts`, `supabase/migrations/00046_kcc_phase33_kai_business_intel.sql`, `src/app/api/v1/kai-business/**`
> **Overrides:** EC-018 on knowledge retrieval details

## Purpose

Defines KAI's retrieval-augmented generation: how documents become knowledge, how retrieval is scoped per tenant, and how answers combine live data with document knowledge. This is the "Company Brain" plumbing (Phase 33).

## Current Truth (in this repo today)

- **Knowledge storage:** `kv_kai_knowledge_chunks` — chunk rows with embedding (1536-dim), content, source, and nullable `business_id`. `business_id = NULL` = platform-global knowledge; non-NULL = tenant-scoped (EC-014 Rule 4). Phase 33 added the column + partial index.
- **Documents:** `kv_kai_documents` (via `KaiDocument` model) — businessId, name, type, fileUrl, mimeType, fileSize, source ("upload"), isIndexed. Training flow: `trainBusinessDocument` in `src/lib/kai/business-intelligence.ts` creates the document + embedded chunk rows.
- **Chunking:** `chunkText` — 800-character chunks in `business-intelligence.ts`.
- **Retrieval:** Supabase RPC `kv_kai_search_business_embeddings` (business_id + match_limit params); global RPC `kv_kai_search_embeddings` for platform knowledge. Fallback: Prisma `contains` search when RPC unavailable (EC-018 Rule 3).
- **Answer pipeline:** `answerBusinessQuestion` in `business-intelligence.ts` — modes:
  - `hybrid`: live Business OS facts + business-scoped RAG → LLM (default)
  - `rag`: documents only
  - `live`: live facts only
  - `fallback`: no LLM (facts summary returned directly)
  - Every answer persists to `kv_kai_business_questions` (question, answer, mode, live_data, sources, latency_ms).
- **Live facts:** `getBusinessFacts(orgId)` — parallel queries over Bos models (sales orders, items, invoices, customers, tasks, leads, deals, production orders) with a 7-day window; errors degrade to empty facts (never crash the answer).
- **APIs:** `/api/v1/kai-business/{brain,ask,facts,questions}`; UI at `/business/ai` (Ask KAI).

## Rules

1. Retrieval is always tenant-scoped: business questions search `business_id = X` only. Global chunks are admin-owned.
2. Every RAG path has a non-embedding fallback (contains search) — embedding failure must never break Q&A.
3. Live facts queries run in parallel, are time-bounded (7-day windows for aggregates), and degrade to empty rather than fail.
4. Answers are mode-labeled (hybrid/rag/live/fallback) and persisted — this is both audit and history (EC-028).
5. Chunking is deterministic (`chunkText`, 800 chars); re-training a document replaces its chunk set (upsert by document reference).
6. LLM calls use the model routing rules (EC-026); costs tracked per answer (latency_ms + mode).
7. Sources returned with answers come from actual matched chunks — never invented citations.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Streaming answers (SSE) for long responses.
- Hybrid score fusion (vector + keyword + recency weighted).
- Multi-document citation with page-level references.
- Embedding cache and bulk re-index pipeline for large corpora.

## Checklist (Definition of Done for this area)

- [ ] Tenant-scoped retrieval everywhere
- [ ] Fallback path implemented
- [ ] Live facts parallel + bounded
- [ ] Answers persisted with mode + latency
- [ ] Sources are real chunk matches
