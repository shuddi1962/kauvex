-- ============================================================
-- KCC Phase 31 — K Platform (SDK & Developer Ecosystem)
-- Canvas Document 13: module registry, app marketplace,
-- API keys, OAuth apps, webhooks, event bus, reviews,
-- and developer earnings. Prefix: kv_kp_
-- ============================================================

-- 1. Global module / app registry (apps, plugins, themes, templates, AI agents, industry modules, studio tools, reports, dashboards)
create table if not exists kv_kp_modules (
  id             uuid primary key default gen_random_uuid(),
  slug           varchar(200) not null unique,
  name           varchar(200) not null,
  module_type    varchar(50)  not null default 'app',
  version        varchar(20)  not null default '1.0.0',
  description    text,
  developer_id   uuid,
  icon           varchar(50)  default 'package',
  color          varchar(30)  default '#FF6B00',
  dependencies   jsonb        not null default '[]',
  permissions    jsonb        not null default '[]',
  navigation     jsonb        not null default '{}',
  api_endpoints  jsonb        not null default '[]',
  ui_components  jsonb        not null default '[]',
  ai_capabilities jsonb       not null default '[]',
  settings       jsonb        not null default '{}',
  status         varchar(20)  not null default 'draft',
  license        varchar(50)  default 'proprietary',
  price_monthly  numeric(10,2) not null default 0,
  commission_rate numeric(5,2) not null default 15,
  install_count  int          not null default 0,
  rating         numeric(3,2) not null default 0,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);
create index if not exists idx_kp_modules_type on kv_kp_modules (module_type);
create index if not exists idx_kp_modules_status on kv_kp_modules (status);

-- 2. Per-organization module installs
create table if not exists kv_kp_installs (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  module_id     uuid not null,
  version       varchar(20) not null default '1.0.0',
  config        jsonb       not null default '{}',
  status        varchar(20) not null default 'installed',
  installed_by  uuid,
  installed_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, module_id)
);
create index if not exists idx_kp_installs_org on kv_kp_installs (org_id);

-- 3. API keys for external developers
create table if not exists kv_kp_api_keys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  org_id        uuid,
  name          varchar(200) not null,
  key_prefix    varchar(16)  not null,
  key_hash      varchar(128) not null,
  scopes        jsonb        not null default '[]',
  last_used_at  timestamptz,
  expires_at    timestamptz,
  revoked       boolean      not null default false,
  created_at    timestamptz  not null default now()
);
create index if not exists idx_kp_keys_user on kv_kp_api_keys (user_id);
create index if not exists idx_kp_keys_prefix on kv_kp_api_keys (key_prefix);

-- 4. OAuth applications
create table if not exists kv_kp_oauth_apps (
  id               uuid primary key default gen_random_uuid(),
  developer_id     uuid not null,
  name             varchar(200) not null,
  description      text,
  client_id        varchar(64)  not null unique,
  client_secret_hash varchar(128) not null,
  redirect_uris    jsonb        not null default '[]',
  scopes           jsonb        not null default '[]',
  status           varchar(20)  not null default 'active',
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

-- 5. Webhooks
create table if not exists kv_kp_webhooks (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null,
  name              varchar(200) not null,
  event_types       jsonb not null default '[]',
  url               text not null,
  secret            varchar(128),
  is_active         boolean not null default true,
  failure_count     int not null default 0,
  last_delivered_at timestamptz,
  created_by        uuid,
  created_at        timestamptz not null default now()
);
create index if not exists idx_kp_webhooks_org on kv_kp_webhooks (org_id);

-- 6. Event bus ledger
create table if not exists kv_kp_events (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid,
  event_type   varchar(100) not null,
  payload      jsonb not null default '{}',
  source       varchar(100),
  status       varchar(20) not null default 'pending',
  attempts     int not null default 0,
  delivered_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_kp_events_type on kv_kp_events (event_type);
create index if not exists idx_kp_events_org on kv_kp_events (org_id);

-- 7. Module reviews & ratings
create table if not exists kv_kp_reviews (
  id         uuid primary key default gen_random_uuid(),
  module_id  uuid not null,
  org_id     uuid not null,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);
create index if not exists idx_kp_reviews_module on kv_kp_reviews (module_id);

-- 8. Developer earnings (sales, commissions, payouts)
create table if not exists kv_kp_developer_earnings (
  id           uuid primary key default gen_random_uuid(),
  developer_id uuid not null,
  module_id    uuid,
  amount       numeric(14,2) not null default 0,
  earning_type varchar(30) not null default 'sale',
  status       varchar(20) not null default 'pending',
  period       varchar(10),
  created_at   timestamptz not null default now()
);
create index if not exists idx_kp_earnings_dev on kv_kp_developer_earnings (developer_id);

-- ============================================================
-- RLS
-- ============================================================
alter table kv_kp_modules          enable row level security;
alter table kv_kp_installs         enable row level security;
alter table kv_kp_api_keys         enable row level security;
alter table kv_kp_oauth_apps       enable row level security;
alter table kv_kp_webhooks         enable row level security;
alter table kv_kp_events           enable row level security;
alter table kv_kp_reviews          enable row level security;
alter table kv_kp_developer_earnings enable row level security;

drop policy if exists "kp_modules_authenticated" on kv_kp_modules;
create policy "kp_modules_authenticated" on kv_kp_modules
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_installs_authenticated" on kv_kp_installs;
create policy "kp_installs_authenticated" on kv_kp_installs
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_api_keys_authenticated" on kv_kp_api_keys;
create policy "kp_api_keys_authenticated" on kv_kp_api_keys
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_oauth_apps_authenticated" on kv_kp_oauth_apps;
create policy "kp_oauth_apps_authenticated" on kv_kp_oauth_apps
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_webhooks_authenticated" on kv_kp_webhooks;
create policy "kp_webhooks_authenticated" on kv_kp_webhooks
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_events_authenticated" on kv_kp_events;
create policy "kp_events_authenticated" on kv_kp_events
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_reviews_authenticated" on kv_kp_reviews;
create policy "kp_reviews_authenticated" on kv_kp_reviews
  for all to authenticated using (true) with check (true);

drop policy if exists "kp_earnings_authenticated" on kv_kp_developer_earnings;
create policy "kp_earnings_authenticated" on kv_kp_developer_earnings
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Seeds: platform modules (SDK starter packs)
-- ============================================================
insert into kv_kp_modules (slug, name, module_type, version, description, icon, color, dependencies, permissions, api_endpoints, ui_components, ai_capabilities, settings, status, license, price_monthly) values
('k-sdk-typescript', 'K SDK (TypeScript)', 'sdk', '1.0.0', 'Official TypeScript SDK — auth, organizations, orders, products, studios, KAI, files, notifications, and billing.', 'code', '#3178C6',
 '[]', '["organizations:read","orders:read","orders:write","products:read","products:write","kai:use","files:read","files:write","billing:read"]',
 '["/sdk/typescript/*"]', '["AuthProvider","KaiProvider"]', '["sdk_codegen"]',
 '{"languages":["typescript","javascript"],"supports":["rest","websocket"]}', 'published', 'mit', 0),
('k-sdk-python', 'K SDK (Python)', 'sdk', '1.0.0', 'Official Python SDK for server-side integrations, automation, and data pipelines.', 'code', '#3776AB',
 '[]', '["organizations:read","orders:read","products:read","files:read","billing:read"]',
 '["/sdk/python/*"]', '[]', '["sdk_codegen"]',
 '{"languages":["python"],"supports":["rest"]}', 'published', 'mit', 0),
('k-sdk-csharp', 'K SDK (C#)', 'sdk', '1.0.0', 'Official C# SDK for .NET enterprise integrations.', 'code', '#512BD4',
 '[]', '["organizations:read","orders:read","products:read","files:read"]',
 '["/sdk/csharp/*"]', '[]', '["sdk_codegen"]',
 '{"languages":["csharp"],"supports":["rest"]}', 'published', 'mit', 0),
('k-sdk-go', 'K SDK (Go)', 'sdk', '1.0.0', 'Official Go SDK for high-throughput services and edge workloads.', 'code', '#00ADD8',
 '[]', '["organizations:read","orders:read","products:read","files:read"]',
 '["/sdk/go/*"]', '[]', '["sdk_codegen"]',
 '{"languages":["go"],"supports":["rest"]}', 'published', 'mit', 0),
('k-sdk-java', 'K SDK (Java)', 'sdk', '1.0.0', 'Official Java SDK for enterprise and Android integrations.', 'code', '#F89820',
 '[]', '["organizations:read","orders:read","products:read","files:read"]',
 '["/sdk/java/*"]', '[]', '["sdk_codegen"]',
 '{"languages":["java"],"supports":["rest"]}', 'published', 'mit', 0),
('k-sdk-php', 'K SDK (PHP)', 'sdk', '1.0.0', 'Official PHP SDK for web platforms and e-commerce stacks.', 'code', '#777BB4',
 '[]', '["organizations:read","orders:read","products:read","files:read"]',
 '["/sdk/php/*"]', '[]', '["sdk_codegen"]',
 '{"languages":["php"],"supports":["rest"]}', 'published', 'mit', 0),
('k-webhook-relay', 'Webhook Relay', 'plugin', '1.0.0', 'Reliable webhook delivery with retries, signatures, and delivery logs for any Kauvex event.', 'zap', '#FF6B00',
 '["k-sdk-typescript"]', '["webhooks:manage"]', '["/webhooks/*"]', '["WebhookConfigurator"]', '["webhook_delivery"]',
 '{"retries":5,"signing":"hmac-sha256"}', 'published', 'proprietary', 19),
('k-api-gateway', 'K API Gateway', 'plugin', '1.0.0', 'Central gateway for REST, GraphQL, WebSockets, and streaming APIs with rate limiting and analytics.', 'shield', '#0A1628',
 '[]', '["api:manage"]', '["/gateway/*"]', '["GatewayConsole"]', '["api_analytics"]',
 '{"rate_limits":true,"versioning":true}', 'published', 'proprietary', 49),
('k-report-builder', 'Report Builder', 'report', '1.0.0', 'Drag-and-drop report builder with PDF, Excel, CSV, and PowerPoint export.', 'bar-chart', '#0EA5E9',
 '[]', '["reports:read","reports:write"]', '["/reports/*"]', '["ReportCanvas","ChartPicker"]', '["report_generation"]',
 '{"exports":["pdf","excel","csv","pptx"]}', 'published', 'proprietary', 29),
('k-studio-toolkit', 'Studio Toolkit', 'studio_tool', '1.0.0', 'Reusable design studio components: canvases, inspectors, material pickers, and render previews.', 'pen-tool', '#7C3AED',
 '[]', '["studios:read","studios:write"]', '["/studios/toolkit/*"]', '["StudioCanvas","MaterialPicker","RenderPreview"]', '["design_assist"]',
 '{"components":["canvas","inspector","materials","renders"]}', 'published', 'proprietary', 39)
on conflict (slug) do update set
  name = excluded.name,
  module_type = excluded.module_type,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  status = excluded.status,
  price_monthly = excluded.price_monthly;
