-- ============================================================
-- KCC Phase 32 — K Cloud (Kauvex Cloud Platform)
-- Canvas Document 14: multi-tenant cloud workspaces, storage,
-- backups, deployments, serverless functions, scheduler,
-- render cloud, event platform, usage billing, and regions.
-- Prefix: kv_kc_
-- ============================================================

-- 1. Per-organization cloud workspaces (auto-provisioned on org creation)
create table if not exists kv_kc_workspaces (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null unique,
  plan          varchar(30)  not null default 'starter',
  region        varchar(30)  not null default 'us-east-1',
  status        varchar(20)  not null default 'provisioned',
  storage_used_mb int        not null default 0,
  compute_units int          not null default 0,
  ai_credits    numeric(14,2) not null default 0,
  render_credits int         not null default 0,
  api_requests  bigint       not null default 0,
  bandwidth_mb  bigint       not null default 0,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);
create index if not exists idx_kc_ws_region on kv_kc_workspaces (region);

-- 2. Cloud storage (files, assets, versions)
create table if not exists kv_kc_storage (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  folder        varchar(200) default 'root',
  name          varchar(500) not null,
  file_type     varchar(50),
  size_bytes    bigint not null default 0,
  url           text,
  version       int not null default 1,
  checksum      varchar(128),
  tags          text[] default '{}',
  watermark     boolean not null default false,
  preview_url   text,
  status        varchar(20) not null default 'stored',
  uploaded_by   uuid,
  created_at    timestamptz not null default now()
);
create index if not exists idx_kc_storage_org on kv_kc_storage (org_id);
create index if not exists idx_kc_storage_folder on kv_kc_storage (org_id, folder);

-- 3. Backup center
create table if not exists kv_kc_backups (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  backup_type   varchar(20) not null default 'daily',
  status        varchar(20) not null default 'completed',
  size_mb       int not null default 0,
  stored_until  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_kc_backups_org on kv_kc_backups (org_id);

-- 4. Deployments (development / testing / staging / production)
create table if not exists kv_kc_deployments (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null,
  name            varchar(200) not null,
  stage           varchar(30) not null default 'development',
  status          varchar(20) not null default 'active',
  last_deployed_at timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_kc_deploys_org on kv_kc_deployments (org_id);

-- 5. Serverless functions
create table if not exists kv_kc_functions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null,
  name            varchar(200) not null,
  runtime         varchar(30) not null default 'nodejs',
  trigger         varchar(50) not null default 'http',
  code_ref        text,
  config          jsonb not null default '{}',
  status          varchar(20) not null default 'active',
  invocations     bigint not null default 0,
  last_invoked_at timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_kc_fn_org on kv_kc_functions (org_id);

-- 6. Scheduler
create table if not exists kv_kc_schedules (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        varchar(200) not null,
  cron        varchar(100) not null,
  job_type    varchar(50) not null default 'report',
  config      jsonb not null default '{}',
  status      varchar(20) not null default 'active',
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists idx_kc_sched_org on kv_kc_schedules (org_id);

-- 7. Render cloud jobs
create table if not exists kv_kc_render_jobs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  asset_refs  jsonb not null default '[]',
  quality     varchar(20) not null default 'draft',
  status      varchar(20) not null default 'queued',
  progress    int not null default 0,
  output_url  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_kc_render_org on kv_kc_render_jobs (org_id);

-- 8. Cloud event platform
create table if not exists kv_kc_events (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null,
  event_type varchar(100) not null,
  payload    jsonb not null default '{}',
  source     varchar(100),
  status     varchar(20) not null default 'recorded',
  created_at timestamptz not null default now()
);
create index if not exists idx_kc_events_org on kv_kc_events (org_id);
create index if not exists idx_kc_events_type on kv_kc_events (event_type);

-- 9. Usage & billing logs
create table if not exists kv_kc_usage_logs (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null,
  resource   varchar(30) not null,
  amount     numeric(14,2) not null default 0,
  unit       varchar(20) default 'units',
  billed     boolean not null default false,
  period     varchar(10),
  created_at timestamptz not null default now()
);
create index if not exists idx_kc_usage_org on kv_kc_usage_logs (org_id);
create index if not exists idx_kc_usage_resource on kv_kc_usage_logs (resource);

-- 10. Global regions
create table if not exists kv_kc_regions (
  id        uuid primary key default gen_random_uuid(),
  code      varchar(30) not null unique,
  name      varchar(100) not null,
  active    boolean not null default true,
  latency_ms int not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table kv_kc_workspaces enable row level security;
alter table kv_kc_storage enable row level security;
alter table kv_kc_backups enable row level security;
alter table kv_kc_deployments enable row level security;
alter table kv_kc_functions enable row level security;
alter table kv_kc_schedules enable row level security;
alter table kv_kc_render_jobs enable row level security;
alter table kv_kc_events enable row level security;
alter table kv_kc_usage_logs enable row level security;
alter table kv_kc_regions enable row level security;

drop policy if exists "kc_workspaces_authenticated" on kv_kc_workspaces;
create policy "kc_workspaces_authenticated" on kv_kc_workspaces
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_storage_authenticated" on kv_kc_storage;
create policy "kc_storage_authenticated" on kv_kc_storage
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_backups_authenticated" on kv_kc_backups;
create policy "kc_backups_authenticated" on kv_kc_backups
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_deployments_authenticated" on kv_kc_deployments;
create policy "kc_deployments_authenticated" on kv_kc_deployments
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_functions_authenticated" on kv_kc_functions;
create policy "kc_functions_authenticated" on kv_kc_functions
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_schedules_authenticated" on kv_kc_schedules;
create policy "kc_schedules_authenticated" on kv_kc_schedules
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_render_jobs_authenticated" on kv_kc_render_jobs;
create policy "kc_render_jobs_authenticated" on kv_kc_render_jobs
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_events_authenticated" on kv_kc_events;
create policy "kc_events_authenticated" on kv_kc_events
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_usage_logs_authenticated" on kv_kc_usage_logs;
create policy "kc_usage_logs_authenticated" on kv_kc_usage_logs
  for all to authenticated using (true) with check (true);

drop policy if exists "kc_regions_authenticated" on kv_kc_regions;
create policy "kc_regions_authenticated" on kv_kc_regions
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Seeds: global regions
-- ============================================================
insert into kv_kc_regions (code, name, latency_ms) values
('us-east-1', 'US East (Virginia)', 90),
('eu-west-1', 'Europe West (Ireland)', 110),
('ap-south-1', 'Asia South (Mumbai)', 140),
('af-south-1', 'Africa South (Cape Town)', 180),
('me-central-1', 'Middle East (UAE)', 120)
on conflict (code) do update set
  name = excluded.name,
  latency_ms = excluded.latency_ms;
