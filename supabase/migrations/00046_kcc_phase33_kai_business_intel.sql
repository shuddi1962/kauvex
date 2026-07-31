-- ============================================================
-- KCC Phase 33 — KAI Business Intelligence (Company Brain)
-- Canvas Document 9: KAI that knows everything happening in the
-- business. Business-scoped RAG on kv_kai_knowledge_chunks,
-- live Business OS data queries, and a question/answer log.
-- ============================================================

-- 1. Business-scoped knowledge chunks
-- (existing rows stay global — platform knowledge)
alter table kv_kai_knowledge_chunks
  add column if not exists business_id uuid;

create index if not exists idx_kai_kb_business
  on kv_kai_knowledge_chunks (business_id)
  where business_id is not null;

-- 2. Business-scoped vector search (RAG over a company's own documents)
create or replace function kv_kai_search_business_embeddings(
  query_embedding vector(1536),
  business_id uuid,
  match_limit int default 5
)
returns table(
  id uuid,
  category varchar(50),
  subcategory varchar(100),
  title varchar(500),
  content text,
  metadata jsonb,
  source_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    k.id,
    k.category,
    k.subcategory,
    k.title,
    k.content,
    k.metadata,
    k.source_url,
    1 - (k.embedding <=> query_embedding) as similarity
  from kv_kai_knowledge_chunks k
  where k.is_active = true
    and k.embedding is not null
    and k.business_id = business_id
  order by k.embedding <=> query_embedding
  limit match_limit;
end;
$$;

-- 3. Business question log — every question KAI answers for a business
-- (live data answers, RAG answers, or hybrid), with sources and latency.
create table if not exists kv_kai_business_questions (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid,
  org_id       uuid,
  user_id      uuid,
  question     text not null,
  answer       text not null,
  mode         varchar(20) not null default 'hybrid', -- live | rag | hybrid | fallback
  live_data    jsonb not null default '{}',
  sources      jsonb not null default '[]',
  latency_ms   int not null default 0,
  feedback     int,                                   -- 1 helpful | -1 not helpful
  created_at   timestamptz not null default now()
);
create index if not exists idx_kai_bq_business on kv_kai_business_questions (business_id);
create index if not exists idx_kai_bq_org on kv_kai_business_questions (org_id);
create index if not exists idx_kai_bq_created on kv_kai_business_questions (created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table kv_kai_business_questions enable row level security;

drop policy if exists "kai_bq_authenticated" on kv_kai_business_questions;
create policy "kai_bq_authenticated" on kv_kai_business_questions
  for all to authenticated using (true) with check (true);
