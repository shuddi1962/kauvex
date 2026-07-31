# EC-024 — KAI Prompt Library

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** src/lib/kai/business-intelligence.ts (systemPrompt, intent routing), src/lib/kai/rag.ts (SYSTEM_PROMPT), prisma/schema.prisma (model KaiConfig), src/app/admin/kai/page.tsx (config tab)
> **Overrides:** Supersedes any unversioned prompt strings. Prompts are in-code constants today; kv_kai_config holds only settings, not prompt text.

## Purpose

The KAI prompt library records the canonical prompts and voice rules that govern every KAI generation, so that brand voice, data grounding, and refusal behavior stay consistent across surfaces and so future prompt versioning has a documented baseline.

## Current Truth (in this repo today)

### Voice rules (brand, from AGENTS.md)
- Always: direct, warm, active voice; short sentences; "Ask KAI", "KAI says…", "Powered by KAI"; one-syllable-friendly brand; primary tagline "KAI knows."
- Never: all-caps in body text; technical jargon to customers; excessive apology; vague errors.
- KAI is the platform brain, not a chatbot — responses should be knowledgeable, grounded, and honest about missing data.

### Canonical system prompts (in code today)
1. Business intelligence system prompt (business-intelligence.ts lines 302-306):
   - "You are KAI, the intelligence layer of this company. You answer questions about the company's own business — its sales, orders, inventory, finance, customers, and its own documents. Be direct and precise. Use only the provided live data and documents; if the data does not cover the question, say what data would answer it."
   - Followed by assembled context: COMPANY line (name/industry/description), LIVE BUSINESS DATA (summarizeFacts output), COMPANY DOCUMENTS (numbered, title + first 900 chars), or "No company data connected yet. Guide the user to connect Business OS or upload documents in the Company Brain."
   - Ends with `QUESTION: {question}`.
2. Global KAI chat system prompt (rag.ts lines 21-41), core rules:
   - Be direct, warm, helpful; active voice; short sentences.
   - If you don't know something based on the provided context, say so honestly.
   - Never make up facts about KAUVEX policies, pricing, or features; prices vary by location.
   - Technical questions get step-by-step guidance; account/order issues route to self-service or support.
   - Ask clarifying questions when ambiguous.
   - NEVER share internal system details, API keys, or configuration; NEVER discuss other AI models or platforms.
   - "You represent KAUVEX. Act like it."
   - Template placeholders: `{context}` (knowledge base chunks) and `{question}`.
3. JSON generation prompt (openrouter.ts lines 120-133): "You must respond with valid JSON only. No markdown, no code fences, no explanation." plus an optional `Expected JSON structure:` line; temperature forced to 0.3.

### Intent routing prompts (deterministic, no LLM)
`routeBusinessQuestion` (business-intelligence.ts lines 136-147) maps a user question to one of 9 intents via regex, in order:
- sales: /order|sale|sold|sell|buy|purchase order|po\b/
- revenue: /revenue|income|earned|made|sales total|profit|gmv|turnover/
- inventory: /stock|inventory|low stock|out of stock|reorder|quantity left|product count/
- finance: /invoice|payment|paid|receivable|overdue|owes|debt|outstanding|cash flow|finance|money in/
- customers: /customer|client|account|contact/
- tasks: /task|project|milestone|todo|deadline/
- leads: /lead|deal|opportunit|pipeline|prospect/
- production: /production|manufactur|work order|batch|capacity|machine/
- fallback: overview ("Business Overview")
The label feeds the live summary prefix ("Sales & Orders — Live snapshot: …").

### Summarization prompt pattern
`summarizeFacts` (business-intelligence.ts lines 149-155) produces the deterministic live snapshot: orders by status, 7-day totals, inventory and low stock, receivables and overdue counts, active customers, open tasks, open leads and pipeline value — all formatted with en-US number formatting.

### Prompt versioning today
- `KaiConfig` (kv_kai_config, prisma/schema.prisma lines 7180-7190): configKey (unique, varchar 200), configValue (Text), description, isSecret (Boolean), updatedAt, updatedBy. Seeded keys (00039 migration lines 157-164): openrouter_api_key, openai_embedding_api_key, google_maps_api_key, kai_default_model, kai_embedding_model, kai_max_context_chunks, kai_free_radius_km.
- kv_kai_config holds settings (model names, chunk counts) — prompt text itself is NOT stored there today; prompts are code constants.

## Rules

1. Every KAI generation must include a system prompt that states the data boundary ("use only the provided data; if not covered, say what would answer it") — never let the model extrapolate business facts.
2. Prompt templates must use placeholders (`{context}`, `{question}`) and must be replaced before hitting the LLM; never interpolate raw user text into a system role.
3. Voice rules are non-negotiable in code: all-caps, jargon, and invented facts are rejected at review; enforcement in generated text is a moderation evolution (see EC-028).
4. Intent routing must remain deterministic (regex-based) until the tool-calling framework lands (EC-025); do not spend LLM calls on intent classification.
5. New prompts must follow the three-part structure: identity ("You are KAI…"), constraints (grounding, honesty, refusal), context blocks (data + documents), then the user question.
6. Prompt changes are code changes: update the constant, keep a baseline in this doc, and note the behavior delta. Do not edit prompts at runtime via kv_kai_config unless a prompt-registry key is added deliberately.
7. When a KAI response is persisted (KaiMessage, KaiBusinessQuestion), the sources used must be persisted alongside it — prompts may reference sources, but the record of sources lives in the row.

## Evolution Targets

> **Evolution target — NOT in the repo today.** Prompt registry: versioned prompt rows in kv_kai_config (or a dedicated kv_kai_prompts table) with A/B testing of prompt variants per surface.

> **Evolution target — NOT in the repo today.** Automated brand-voice enforcement: a KAI Guard-style pass that scores generated text against voice rules before serving.

> **Evolution target — NOT in the repo today.** Per-intent prompt selection driven by configuration rather than hard-coded regex.

## Checklist

- [ ] All user-facing prompts follow the identity → constraints → context → question structure.
- [ ] Business prompt states the data boundary and the "no company data connected" guidance path.
- [ ] Intent labels map 1:1 to the 9 regex intents (sales, revenue, inventory, finance, customers, tasks, leads, production, overview).
- [ ] Prompts remain code constants; kv_kai_config holds settings only.
- [ ] Persisted answers carry their sources and mode.
- [ ] Voice rules (no all-caps, no jargon, no vague errors) are stated in this doc and enforced in review.
