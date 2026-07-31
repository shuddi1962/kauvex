# EC-021 — KAI Core: Identity, Orchestration, and Module Map

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** src/lib/kai/rag.ts, src/lib/kai/knowledge-base.ts, src/lib/kai/business-intelligence.ts, src/lib/ai/openrouter.ts, src/lib/ai/product-description.ts, src/lib/ai/seo-generator.ts, src/lib/ai/recommendations.ts, src/app/admin/kai/page.tsx, src/app/business/layout.tsx, prisma/schema.prisma (models KaiConfig, KaiConversation, KaiMessage, KaiFeedback, KaiKnowledgeChunk)
> **Overrides:** Supersedes any earlier ad-hoc "KAI chatbot" framing. KAI is the platform brain, not a chatbot.

## Purpose

KAI (Kauvex Artificial Intelligence) is the intelligence layer of the entire Kauvex Commerce Cloud — "KAI knows." This document fixes KAI's identity, maps today's orchestration reality (KAI 1.0 Platform Intelligence: RAG + OpenRouter/Claude-compatible LLM APIs), enumerates every surface where KAI appears, and records the cost/error controls that apply to every KAI call in this repo today.

## Current Truth (in this repo today)

### Identity
- KAI = Kauvex Artificial Intelligence. Brand voice rules (from AGENTS.md): short, warm, active voice, short sentences; never all-caps in body text; never technical jargon to customers; never vague errors. Primary tagline: "KAI knows."
- KAI versions (brand roadmap, not all built): 1.0 Platform Intelligence (RAG + Claude/OpenRouter API — this is what exists), 2.0 Industry Intelligence (fine-tuned open-source, Year 2), 3.0 Foundation Intelligence (multi-modal, Years 4-5).
- Sub-products: KAI Chat, KAI Design, KAI Logistics, KAI Pro, KAI Guard, KAI Predict, KAI for Business.

### Orchestration layering today (KAI 1.0)
1. Retrieval layer: `generateEmbedding` + Supabase RPC vector search (global `kv_kai_search_embeddings`, business-scoped `kv_kai_search_business_embeddings`) with Prisma `contains` fallback. See EC-027.
2. Generation layer: direct `fetch` to `https://openrouter.ai/api/v1/chat/completions` (business-intelligence.ts, rag.ts) or the client wrapper in src/lib/ai/openrouter.ts (`createOpenRouterClient` → `generateCompletion` / `generateJSON`).
3. Feature modules in src/lib/ai/ (product-description.ts, seo-generator.ts, recommendations.ts, inventory-forecast.ts, fraud-detection.ts, dynamic-pricing.ts) each own their prompts and call the OpenRouter client.
4. Deterministic intent routing for business Q&A (`routeBusinessQuestion`) — no native tool calling today. See EC-025.

### Where KAI surfaces
- KAI Chat (global customer RAG chat): `askKAI` in src/lib/kai/rag.ts; conversations persist to `KaiConversation`/`KaiMessage`/`KaiFeedback`.
- Ask KAI (business portal): src/app/business/ai/page.tsx, backed by `/api/v1/kai-business/ask` → `answerBusinessQuestion`.
- Company Brain (business RAG): src/app/business/brain/page.tsx, backed by `/api/v1/kai-business/brain`.
- Workflow Studio: src/app/business/studio/page.tsx. Skills Marketplace: src/app/business/skills/page.tsx. Onboarding: src/app/business/onboard/page.tsx.
- KAI Ecosystem portal: src/app/kai/ (chat, knowledge, memory, agents, employees, flows, decisions, research, content, apps, audit) backed by `KaiEco*` models in prisma/schema.prisma (lines 8573-8790).
- Admin console: src/app/admin/kai/page.tsx (11 tabs: dashboard, knowledge, conversations, config, plans, subscriptions, businesses, agents, workflows, skills, passport-templates; 1888 lines) and src/app/admin/kai/business-intelligence/page.tsx.
- Business nav shell: src/app/business/layout.tsx (Dashboard, AI Employee, Ask KAI, Workflow Studio, Company Brain, Skills Marketplace, Digital Passports).

### Module map (src/lib/kai/)
- rag.ts — `generateEmbedding` (OpenAI `text-embedding-3-small`, 1536-d), `searchKnowledgeBase` (global RPC), `askKAI` (chat with conversation history support).
- knowledge-base.ts — `addToKnowledgeBase`, `removeFromKnowledgeBase` (soft-delete via is_active), `reindexAll` (embeds rows with null embedding via Supabase direct insert).
- business-intelligence.ts — Company Brain engine: business resolution, live Business OS facts, intent routing, business RAG, document training, `answerBusinessQuestion`. See EC-023/EC-027.
- distance-calculator.ts, digital-passport.ts — auxiliary intelligence features.

### Cost controls
- Default model: `openai/gpt-4o-mini` (constant DEFAULT_MODEL in src/lib/ai/openrouter.ts; also hard-coded in business-intelligence.ts and rag.ts).
- Business answers: temperature 0.4, max_tokens 700 (business-intelligence.ts).
- Chat: temperature default 0.7, max_tokens 1024 (rag.ts, openrouter.ts).
- `generateJSON`: temperature forced to 0.3 (openrouter.ts).
- Context budget: RAG uses 5 chunks for chat; business answers use up to 4 chunks, each truncated to 900 chars before prompt assembly.

### Env keys (server-side only)
- `OPENROUTER_API_KEY` — primary LLM key (OpenRouter).
- `OPENAI_EMBEDDING_API_KEY` — embeddings key; falls back to `OPENROUTER_API_KEY` (rag.ts line 44).
- `OPENAI_API_KEY` — secondary LLM fallback used by business-intelligence.ts line 293 (`OPENROUTER_API_KEY || OPENAI_API_KEY`).
- `NEXT_PUBLIC_OPENROUTER_API_KEY` — client-side fallback read by openrouter.ts `getApiKey` (last resort; secrets must stay server-side).
- Mirrored admin-managed keys live in `kv_kai_config` (openrouter_api_key, openai_embedding_api_key, google_maps_api_key) and `kv_kai_config` defaults (kai_default_model = openai/gpt-4o-mini, kai_embedding_model = text-embedding-3-small, kai_max_context_chunks = 5, kai_free_radius_km = 10).

### Call patterns
- Direct fetch: `fetch("https://openrouter.ai/api/v1/chat/completions")` with `Authorization: Bearer <key>`, `model`, `messages` (system + user), `temperature`, `max_tokens` (business-intelligence.ts lines 309-313; rag.ts lines 140-152).
- Client wrapper: `createOpenRouterClient()` — adds `HTTP-Referer` (NEXT_PUBLIC_SITE_URL) and `X-Title: KAUVEX` headers, 30s AbortController timeout, 429 Retry-After handling, and a client-level rate-limit guard (`lastRateLimit` module variable in openrouter.ts).

### Rate limiting and error fallbacks
- Client wrapper: on HTTP 429, stores `lastRateLimit = now + Retry-After*1000`; `enforceRateLimit()` throws before the next request; 30s abort → "request timed out" error.
- Business answers (no wrapper): try/catch around the LLM call; on failure the answer degrades to the live facts summary (`summarizeFacts`) or a static guidance string (business-intelligence.ts lines 308-325).
- Embedding failure in `searchBusinessChunks` falls through to Prisma `contains` search over title/content with `isActive: true` (business-intelligence.ts lines 166-189).
- No LLM key configured at all → business answers are assembled purely from live facts / document titles (business-intelligence.ts lines 319-325); chat falls back to a canned apology string (rag.ts line 155).

## Rules

1. Every user-facing KAI response must follow the voice rules: short, warm, active voice; no all-caps body text; no internal jargon, API keys, or configuration details exposed (rag.ts SYSTEM_PROMPT rules are canonical).
2. LLM and embedding keys must only be read from server-side env or `kv_kai_config`; never hard-code a key or ship one in a public file.
3. All new KAI features must call the LLM through either the OpenRouter client (src/lib/ai/openrouter.ts) or the direct-fetch pattern with the same default model `openai/gpt-4o-mini`, and must have a non-LLM fallback path (facts summary, canned text, or stored chunks).
4. All KAI costs are bounded: default temperature <= 0.7, max_tokens <= 1024, RAG context <= 5 chunks, business answer context <= 4 chunks x 900 chars.
5. Never invent KAI capabilities beyond the KAI 1.0 reality (RAG + hosted LLM API). Fine-tuned models and multi-modal are roadmap only.
6. `kv_kai_config` is the single source of truth for admin-managed KAI settings (model names, context chunk counts); code defaults must match the seeded values.
7. Any new KAI surface must be wired into either src/app/business/layout.tsx nav or src/app/kai/ (ecosystem) so users can reach it.

## Evolution Targets

> **Evolution target — NOT in the repo today.** KAI 2.0 Industry Intelligence (fine-tuned open-source model per industry) and KAI 3.0 Foundation Intelligence (multi-modal) — these are brand roadmap items with no code.

> **Evolution target — NOT in the repo today.** Central orchestration service (agentic dispatcher, streaming, tool-calling across surfaces). Today each module calls the LLM directly.

> **Evolution target — NOT in the repo today.** Per-question cost metering and token accounting tied to `kv_kai_subscriptions`. Today only `KaiMessage.tokensUsed` (estimate: length/4) exists.

## Checklist

- [ ] KAI module map (src/lib/kai, src/lib/ai) matches the table in this doc after any new feature.
- [ ] New AI feature uses `openai/gpt-4o-mini` default or an explicit per-feature model constant.
- [ ] New AI feature has a non-LLM fallback and a bounded token/temperature budget.
- [ ] No API key exists anywhere under src/ except through env access patterns.
- [ ] Business portal nav still lists Ask KAI, Company Brain, Workflow Studio, Skills Marketplace.
- [ ] Admin KAI console (src/app/admin/kai/page.tsx) still exposes the 11 tabs and config tab matches kv_kai_config seeds.
