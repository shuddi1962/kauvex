# EC-018 — Search Architecture

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/lib/search-engine.ts`, `src/components/search/`, `src/lib/kai/business-intelligence.ts`, `supabase/migrations/00046_kcc_phase33_kai_business_intel.sql`
> **Overrides:** nothing

## Purpose

Defines the three search surfaces of KCC — storefront product search (PostgreSQL full-text), enterprise/knowledge search (embedding-based RAG), and AI-assisted search — and when each applies.

## Current Truth (in this repo today)

- **Product search:** PostgreSQL full-text + autocomplete via `src/lib/search-engine.ts` (client utilities: autocomplete, filters, sorting). UI in `src/components/search/` (including voice search + barcode scanner components).
- **Live search equivalents** built natively (AGENTS.md CS-Cart addon equivalents list): FTS + autocomplete, product comparison, back-in-stock notifications.
- **Embedding search (KAI RAG):** 1536-dim vectors stored on `kv_kai_knowledge_chunks`; two Supabase RPCs: `kv_kai_search_embeddings` (global) and `kv_kai_search_business_embeddings` (business-scoped, Phase 33 — params include business_id + match limit). Called from `src/lib/kai/business-intelligence.ts` (`searchBusinessChunks`), with a Prisma `contains` fallback when the RPC is unavailable.
- **Hybrid business Q&A:** `answerBusinessQuestion` combines live Business OS facts + business-scoped RAG (modes: hybrid | rag | live | fallback) — the Ask KAI flow at `/business/ai`.
- **Admin analytics:** search analytics dashboards under `src/app/admin/analytics/` (search tab).

## Rules

1. Storefront product search uses FTS + `search-engine.ts` utilities — do not build a separate search stack for catalog pages.
2. Knowledge search uses the embedding RPCs; always business-scope where tenant knowledge is involved (EC-014 Rule 4).
3. Every embedding search has a non-embedding fallback (contains/ILike) so the platform degrades gracefully when the RPC/vector store is unavailable.
4. Search results for products are filtered by storefront/currency/visibility rules server-side.
5. New search surfaces (e.g. global admin search) reuse existing engines before inventing new ones.
6. Embedding generation goes through `generateEmbedding` (server-side, EC-026 model routing).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Dedicated search service (Typesense/Meilisearch) when catalog volume or relevance tuning demands it.
- Typo tolerance/fuzzy matching beyond FTS config.
- Semantic product search (embedding-based catalog matching).
- Search personalization per customer.

## Checklist (Definition of Done for this area)

- [ ] Search surface reuses an existing engine where possible
- [ ] Tenant scoping enforced in knowledge search
- [ ] Fallback path exists for embedding searches
- [ ] Storefront filters applied server-side
