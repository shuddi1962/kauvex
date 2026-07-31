# EC-026 — KAI Model Routing

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** src/lib/ai/openrouter.ts, src/lib/kai/rag.ts, src/lib/kai/business-intelligence.ts, src/lib/ai/product-description.ts, src/lib/ai/seo-generator.ts, src/lib/ai/recommendations.ts
> **Overrides:** Supersedes any per-feature model drift. One default model (openai/gpt-4o-mini), one embedding model (text-embedding-3-small, 1536-d), env-resolved keys.

## Purpose

Model routing decides which model, key, and parameters serve each KAI feature and what happens when the provider fails. This document fixes the current routing matrix, the env-based key resolution order, and the degradation strategy so every feature has a predictable cost and fallback profile.

## Current Truth (in this repo today)

### Default generation model
- Constant `DEFAULT_MODEL = 'openai/gpt-4o-mini'` in src/lib/ai/openrouter.ts (line 2). The same string is hard-coded in the direct-fetch call sites: rag.ts line 147 and business-intelligence.ts line 312.
- Admin default mirrors it in kv_kai_config key `kai_default_model` (seeded 'openai/gpt-4o-mini', migration 00039 line 161). The env is authoritative for code; the config row is the documented admin default.

### Embedding model
- `generateEmbedding` (rag.ts lines 43-68) POSTs to `https://api.openai.com/v1/embeddings` with `model: "text-embedding-3-small"`, returns `data[0].embedding` (1536-dim). kv_kai_config key `kai_embedding_model` is seeded 'text-embedding-3-small'.
- Dimension must match the vector columns and RPC signatures (VECTOR(1536)) in migrations 00039 and 00046 — see EC-027.

### Key resolution order (env-based, server-side)
- LLM: business-intelligence.ts line 293 — `process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY`. The chat wrapper openrouter.ts `getApiKey()` — `process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY` (client-facing fallback; last resort only).
- Embeddings: rag.ts line 44 — `process.env.OPENAI_EMBEDDING_API_KEY || process.env.OPENROUTER_API_KEY`.
- All keys are read at request time; there is no cached/rotating key store in code (kv_kai_config holds admin-managed mirror values but code reads env).

### Per-feature parameter matrix (today)
| Feature | Model | Temperature | Max tokens | Call site |
| --- | --- | --- | --- | --- |
| Business Q&A answers | openai/gpt-4o-mini | 0.4 | 700 | business-intelligence.ts:312 |
| Global chat (no history) | client DEFAULT_MODEL | 0.7 | 1024 | openrouter.ts generateCompletion |
| Global chat (with history) | openai/gpt-4o-mini | 0.7 (option) | 1024 | rag.ts:140-152 |
| JSON generation | client DEFAULT_MODEL | forced 0.3 | client default | openrouter.ts generateJSON |
| Feature modules (SEO, descriptions, recommendations, forecasting, pricing, fraud) | client DEFAULT_MODEL | module-chosen | module-chosen | src/lib/ai/* |
| Embeddings | text-embedding-3-small | n/a | n/a | rag.ts:50-60 |

### Fallback strategy
- LLM failure (network, 429, empty content, missing key) in business Q&A → answer degrades to `liveSummary` (deterministic facts summary via summarizeFacts) or a static guidance string; the persisted row still records mode, sources, and latency (business-intelligence.ts lines 308-325).
- No LLM key at all → answers assembled from live facts or document titles only (lines 319-325).
- Chat wrapper failure → throws typed errors ("Rate limited by OpenRouter…", "request timed out after 30000ms", "OpenRouter returned empty response"); callers must catch and surface the canned apology.
- Embedding failure in retrieval → Prisma `contains` search fallback (see EC-027).

### Mode field (what actually happened per answer)
`answerBusinessQuestion` computes `mode` from what data was available (business-intelligence.ts line 287):
- hybrid — Business OS org connected AND a KAI business (brain) exists (live facts + RAG).
- rag — business brain exists but no org connected (documents only).
- live — org connected but no brain (live facts only).
- fallback — neither (static guidance answer).
The mode is persisted on every kv_kai_business_questions row — the cheapest correctness signal in the system.

## Rules

1. All new generation features must default to `openai/gpt-4o-mini` (the DEFAULT_MODEL constant); deviating requires an explicit model constant and a documented reason.
2. Key resolution must stay env-first: OPENROUTER_API_KEY for LLM, OPENAI_EMBEDDING_API_KEY (then OPENROUTER_API_KEY) for embeddings, OPENAI_API_KEY as LLM secondary. Never invert this order silently.
3. Every feature with an LLM call must define a non-LLM fallback before it ships (facts summary, canned text, or chunk titles).
4. Keep temperatures within EC-021 bounds: <= 0.7 default, 0.3 for JSON, 0.4 for business answers.
5. Never change the embedding dimension without updating migration 00039 (vector column + ivfflat index), migration 00046 (both RPC signatures), and the search call sites in the same change.
6. New feature modules in src/lib/ai/ must go through the OpenRouter client or the documented direct-fetch pattern — no new HTTP stacks for LLM calls.
7. Model names must remain provider-prefixed (e.g. "openai/gpt-4o-mini") as OpenRouter requires; do not strip the prefix.

## Evolution Targets

> **Evolution target — NOT in the repo today.** Per-tier model selection: cheaper/smaller models for free plans, larger models for paid subscriptions (kv_kai_plans/kv_kai_subscriptions exist as the billing substrate).

> **Evolution target — NOT in the repo today.** KAI 2.0 fine-tuned open-source models per industry, routed instead of the hosted default.

> **Evolution target — NOT in the repo today.** Latency and cost telemetry: per-route model stats surfaced in the admin console (latencyMs and tokensUsed already exist on rows — the aggregation UI does not).

> **Evolution target — NOT in the repo today.** Model fallback chains (retry a second model on 429/5xx) and circuit breakers per feature.

## Checklist

- [ ] DEFAULT_MODEL constant is the only default used by new features.
- [ ] Key resolution order matches this doc (LLM: OPENROUTER_API_KEY → OPENAI_API_KEY; embeddings: OPENAI_EMBEDDING_API_KEY → OPENROUTER_API_KEY).
- [ ] Every LLM feature has a working fallback path exercised in code.
- [ ] Embedding dimension (1536) is consistent across code, migrations, and RPCs.
- [ ] mode (hybrid/rag/live/fallback) is computed and persisted for every business answer.
- [ ] No provider-specific or fine-tuned model strings exist in code (roadmap only).
