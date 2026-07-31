# EC-023 — KAI Memory System

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** prisma/schema.prisma (models KaiKnowledgeChunk, KaiDocument, KaiConversation, KaiMessage, KaiFeedback), src/lib/kai/business-intelligence.ts (chunkText, trainBusinessDocument, searchBusinessChunks, getBusinessBrain), src/lib/kai/rag.ts (generateEmbedding), src/lib/kai/knowledge-base.ts (addToKnowledgeBase, reindexAll), supabase/migrations/00046_kcc_phase33_kai_business_intel.sql, supabase/migrations/00039_kcc_phase27_kai.sql
> **Overrides:** Supersedes any single-table "chat history" framing. Memory is layered: knowledge chunks (long-term RAG), documents (source of truth for training), conversations (short-term), and the business question log (audit).

## Purpose

KAI memory is the set of persisted stores that let KAI answer from what it has been taught rather than from a prompt alone. This document describes the four layers that exist today — knowledge chunks, documents, conversations/messages, and the business question log — plus the training and retrieval flows that keep them consistent.

## Current Truth (in this repo today)

### Layer 1 — Knowledge chunks (long-term, retrievable)
`KaiKnowledgeChunk` (kv_kai_knowledge_chunks, prisma/schema.prisma lines 7192-7216):
- Fields: id, category (required, varchar 50), subcategory (varchar 100), title (varchar 500), content (Text), businessId (nullable, uuid — added in Phase 33), metadata (Json), sourceUrl (Text), language (default "en"), chunkIndex (Int, default 0), parentId (self-relation for chunk hierarchy), isActive (default true), createdAt, updatedAt.
- The `embedding` column is NOT a Prisma field: it is created in SQL by supabase/migrations/00039_kcc_phase27_kai.sql (line 18: `embedding VECTOR(1536)`, ivfflat index `idx_kai_kb_embedding` with vector_cosine_ops, lists = 100). Prisma writes rows through Supabase direct insert (src/lib/kai/knowledge-base.ts) when embeddings are needed; Prisma ORM calls omit the column.
- businessId scoping: Phase 33 migration adds `business_id uuid` plus partial index `idx_kai_kb_business` on (business_id) where business_id is not null (00046 lines 10-15). Existing rows stay global (platform knowledge); new business-trained rows are scoped.
- Retrieval: global via RPC `kv_kai_search_embeddings(query_embedding vector(1536), match_limit int default 10, filter_category, filter_subcategory)`; business-scoped via `kv_kai_search_business_embeddings(query_embedding, business_id, match_limit default 5)`. See EC-027.

### Layer 2 — Documents (training source of truth)
`KaiDocument` (kv_kai_documents, prisma/schema.prisma lines 7568-7588):
- Fields: id, businessId (required, cascade), name (varchar 500), type (varchar 50), fileUrl (Text), fileSize (Int), mimeType (varchar 100), source (default "upload", varchar 20), isIndexed (default false), metadata (Json), createdAt, updatedAt. Indexed by businessId, type, isIndexed.

### Training flow — trainBusinessDocument (src/lib/kai/business-intelligence.ts lines 212-255)
1. Accepts { name, content, type?, fileUrl?, mimeType? }; type defaults to "manual".
2. Chunks content with `chunkText(content)` (see chunking rules below).
3. Creates the KaiDocument row with `source: "upload"`, `isIndexed: true`, `fileSize: content.length` (characters, not bytes), `metadata: { chunkCount }`.
4. For each chunk: try `generateEmbedding(chunk)` (counts as embedded on success, otherwise undefined); create a KaiKnowledgeChunk with category `"business"`, subcategory = document type, title = `"{name} — part {i+1}"` when multi-chunk else name, businessId, chunkIndex = i, metadata { source: "upload", documentId, documentName }, sourceUrl = fileUrl.
5. Returns { document, chunks, embedded }.
- Note: fileSize is set from string length and chunk creation uses Prisma (no embedding column), so trained chunks carry no embedding unless a later reindex pass writes one.

### Chunking rules (chunkText, business-intelligence.ts lines 194-210)
- Target chunk size: 800 characters (parameter `size = 800`).
- Input is normalized (CRLF → LF) and trimmed; empty input returns [].
- Chunks are built on paragraph boundaries (split on blank lines); a paragraph is appended while the running chunk stays under the size cap, then the chunk is flushed.
- If paragraphs alone exceed the cap, the leftover paragraph becomes the next chunk; a single oversized paragraph is kept whole (no hard character split within a paragraph), and a fully empty-splitting input falls back to `cleaned.slice(0, size)`.

### Layer 3 — Conversations and messages (short-term memory)
- `KaiConversation` (kv_kai_conversations, lines 7218-7236): userId, sessionId (varchar 100), persona (default "sarah"), context (Json), metadata (Json), messageCount (Int), isActive. Indexed by userId, sessionId, isActive.
- `KaiMessage` (kv_kai_messages, lines 7238-7255): conversationId (cascade), role (varchar 10), content, sources (Json), tokensUsed (Int, default 0 — estimated as `Math.ceil(answer.length / 4)` in rag.ts), latencyMs (Int), metadata, createdAt.
- `KaiFeedback` (kv_kai_feedback, lines 7257-7271): messageId (cascade), userId, rating (Int 1-5), helpful (Boolean), feedbackText (Text). Indexed by messageId and rating.
- Conversation history is injected into chat prompts when provided via `askKAI` options.conversationHistory (rag.ts lines 130-152). There is no summarization or persistence-of-summary today.

### Layer 4 — Business question log (audit + memory of answers)
- `KaiBusinessQuestion` (kv_kai_business_questions, lines 7614-7632): businessId, orgId, userId, question, answer, mode (live | rag | hybrid | fallback), liveData (Json), sources (Json), latencyMs, feedback (Int: 1 helpful, -1 not helpful), createdAt. Indexed by businessId, orgId, createdAt.
- Every `answerBusinessQuestion` call persists a row (business-intelligence.ts lines 327-340). `getBusinessBrain` returns the latest 10 questions alongside documents and chunk counts.

### Retrieval behavior
- `searchBusinessChunks(businessId, question, limit = 5)` (business-intelligence.ts lines 163-190): tries embedding search via the business RPC first; on any error or empty non-error result, falls back to Prisma `contains` (case-insensitive) over title OR content with `isActive: true`, ordered by createdAt desc.
- `answerBusinessQuestion` calls it with limit 4, then truncates each chunk to 900 chars in the prompt (lines 282-290).
- Global chat retrieval: `searchKnowledgeBase` in rag.ts uses `kv_kai_search_embeddings` with match_limit 5 (default 10) and optional category filter; no business scoping.

## Rules

1. Business-trained memory must always set businessId on both the KaiDocument and every KaiKnowledgeChunk — never leave business data global.
2. Embeddings are 1536-dim vectors from `text-embedding-3-small`; never change dimension without changing both RPC signatures and the ivfflat index.
3. Chunk size stays 800 chars at paragraph boundaries; do not split mid-paragraph unless the paragraph itself exceeds the cap.
4. Conversation history passed to prompts must be capped (chat uses the provided array as-is; keep max_tokens at 1024 per EC-021).
5. Soft-delete chunks by flipping isActive (knowledge-base.ts pattern), never hard-delete, so retrieval can be audited.
6. Every business question/answer pair must be persisted to kv_kai_business_questions before the API returns — the row is the audit record (see EC-028).
7. Reindexing (embedding null → generate → update) must run through `reindexAll` or an equivalent batching loop; never embed in a hot request path.

## Evolution Targets

> **Evolution target — NOT in the repo today.** Long-term memory layers beyond chunks: entity memory, conversation summarization/compaction, and time-decayed recall.

> **Evolution target — NOT in the repo today.** Background indexing for uploaded binary files (PDFs/docs): today training requires text content passed to the API.

> **Evolution target — NOT in the repo today.** Cross-business memory isolation enforcement beyond the RPC filter (see EC-028 governance for the direction).

## Checklist

- [ ] Training flow writes a KaiDocument (isIndexed true) plus one chunk per 800-char paragraph group with businessId set.
- [ ] Chunks respect the 800-char cap and paragraph-boundary rule.
- [ ] Business retrieval filters by business_id in SQL (RPC) and by businessId in the Prisma fallback.
- [ ] Conversations store role/content/sources/tokensUsed/latencyMs per message.
- [ ] Feedback rows link to KaiMessage; business question feedback uses the Int 1/-1 field.
- [ ] Question log rows persist for every answered business question with mode, sources, latencyMs.
