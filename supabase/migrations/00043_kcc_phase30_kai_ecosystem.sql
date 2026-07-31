-- ============================================================
-- KCC Phase 30 — KAI Ecosystem (Kauvex Artificial Intelligence)
-- Canvas Document 12: distributed ecosystem of specialized AI
-- agents coordinated by a Master Orchestrator, with memory,
-- knowledge hub, natural-language automation flows, decision
-- support, research engine, content factory, digital employees,
-- AI app store, and a safety audit layer.
-- Prefix: kv_kai_eco_ (extends kv_kai_* from Phases 27/27b/28)
-- ============================================================

-- 1. Global agent catalog (22 specialized agents + orchestrator)
create table if not exists kv_kai_eco_agents (
  id            uuid primary key default gen_random_uuid(),
  code          varchar(50) not null unique,
  name          varchar(100) not null,
  category      varchar(50)  not null default 'general',
  description   text,
  capabilities  jsonb        not null default '[]',
  icon          varchar(50)  default 'bot',
  color         varchar(30)  default '#7C3AED',
  installable   boolean      not null default true,
  default_prompt text,
  sort_order    int          not null default 0,
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now()
);
create index if not exists idx_kai_eco_agents_cat on kv_kai_eco_agents (category);

-- 2. Per-organization agent installs
create table if not exists kv_kai_eco_installs (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  agent_code    varchar(50) not null,
  config        jsonb       not null default '{}',
  is_active     boolean     not null default true,
  installed_at  timestamptz not null default now(),
  installed_by  uuid,
  unique (org_id, agent_code)
);
create index if not exists idx_kai_eco_installs_org on kv_kai_eco_installs (org_id);

-- 3. KAI Memory — per-tenant context memory
create table if not exists kv_kai_eco_memory (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  scope         varchar(30)  not null default 'general',
  key           varchar(200) not null,
  value         text,
  value_json    jsonb,
  source        varchar(50)  default 'manual',
  pinned        boolean      not null default false,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  unique (org_id, scope, key)
);
create index if not exists idx_kai_eco_memory_org on kv_kai_eco_memory (org_id);
create index if not exists idx_kai_eco_memory_scope on kv_kai_eco_memory (scope);

-- 4. KAI Knowledge Hub — company knowledge documents
create table if not exists kv_kai_eco_knowledge (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  title         varchar(500) not null,
  doc_type      varchar(50)  default 'document',
  content       text,
  tags          text[]       default '{}',
  file_url      text,
  file_type     varchar(50),
  status        varchar(20)  not null default 'indexed',
  created_by    uuid,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);
create index if not exists idx_kai_eco_kb_org on kv_kai_eco_knowledge (org_id);
create index if not exists idx_kai_eco_kb_type on kv_kai_eco_knowledge (doc_type);

-- 5. Natural-language automation flows
create table if not exists kv_kai_eco_flows (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  name          varchar(300) not null,
  instruction   text         not null,
  parsed        jsonb        not null default '{}',
  trigger_type  varchar(50),
  is_active     boolean      not null default true,
  run_count     int          not null default 0,
  last_run_at   timestamptz,
  created_by    uuid,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);
create index if not exists idx_kai_eco_flows_org on kv_kai_eco_flows (org_id);

-- 6. Flow run history
create table if not exists kv_kai_eco_flow_runs (
  id            uuid primary key default gen_random_uuid(),
  flow_id       uuid not null,
  org_id        uuid not null,
  status        varchar(20) not null default 'pending',
  result        jsonb       not null default '{}',
  error         text,
  triggered_by  varchar(50) default 'manual',
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_flowruns_flow on kv_kai_eco_flow_runs (flow_id);
create index if not exists idx_kai_eco_flowruns_org on kv_kai_eco_flow_runs (org_id);

-- 7. Decision support records
create table if not exists kv_kai_eco_decisions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  context       text not null,
  options       jsonb not null default '[]',
  recommended   text,
  confidence    numeric(5,2) default 0,
  rationale     text,
  status        varchar(20) not null default 'pending',
  decided_by    uuid,
  decided_at    timestamptz,
  created_by    uuid,
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_decisions_org on kv_kai_eco_decisions (org_id);
create index if not exists idx_kai_eco_decisions_status on kv_kai_eco_decisions (status);

-- 8. Research engine reports
create table if not exists kv_kai_eco_research (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  topic         varchar(300) not null,
  summary       text,
  findings      jsonb not null default '[]',
  sources       jsonb not null default '[]',
  status        varchar(20) not null default 'ready',
  created_by    uuid,
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_research_org on kv_kai_eco_research (org_id);

-- 9. Content factory drafts
create table if not exists kv_kai_eco_content (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  content_type  varchar(50) not null,
  title         varchar(300) not null,
  content       text,
  channel       varchar(30) default 'general',
  language      varchar(10) default 'en',
  status        varchar(20) not null default 'draft',
  created_by    uuid,
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_content_org on kv_kai_eco_content (org_id);
create index if not exists idx_kai_eco_content_status on kv_kai_eco_content (status);

-- 10. Digital employees
create table if not exists kv_kai_eco_employees (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  name          varchar(200) not null,
  role          varchar(100) not null,
  agent_code    varchar(50)  not null,
  assistant_context text,
  status        varchar(20)  not null default 'active',
  shifts        jsonb        not null default '{}',
  metadata      jsonb        not null default '{}',
  created_by    uuid,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);
create index if not exists idx_kai_eco_employees_org on kv_kai_eco_employees (org_id);

-- 11. AI app store packs
create table if not exists kv_kai_eco_app_packs (
  id            uuid primary key default gen_random_uuid(),
  slug          varchar(200) not null unique,
  name          varchar(200) not null,
  industry      varchar(100),
  description   text,
  agents        jsonb not null default '[]',
  price_monthly numeric(10,2) not null default 0,
  icon          varchar(50) default 'package',
  color         varchar(30) default '#0A1628',
  is_active     boolean not null default true,
  install_count int not null default 0,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_apps_industry on kv_kai_eco_app_packs (industry);

-- 12. Safety audit log
create table if not exists kv_kai_eco_audit (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  user_id       uuid,
  action        varchar(100) not null,
  resource      varchar(100),
  detail        jsonb not null default '{}',
  ip_address    varchar(50),
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_audit_org on kv_kai_eco_audit (org_id);
create index if not exists idx_kai_eco_audit_action on kv_kai_eco_audit (action);

-- 13. Orchestrator delegation runs
create table if not exists kv_kai_eco_runs (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  request       text not null,
  delegation    jsonb not null default '[]',
  summary       text,
  user_id       uuid,
  status        varchar(20) not null default 'completed',
  created_at    timestamptz not null default now()
);
create index if not exists idx_kai_eco_runs_org on kv_kai_eco_runs (org_id);
create index if not exists idx_kai_eco_runs_created on kv_kai_eco_runs (created_at);

-- ============================================================
-- RLS
-- ============================================================
alter table kv_kai_eco_agents    enable row level security;
alter table kv_kai_eco_installs  enable row level security;
alter table kv_kai_eco_memory    enable row level security;
alter table kv_kai_eco_knowledge enable row level security;
alter table kv_kai_eco_flows     enable row level security;
alter table kv_kai_eco_flow_runs enable row level security;
alter table kv_kai_eco_decisions enable row level security;
alter table kv_kai_eco_research  enable row level security;
alter table kv_kai_eco_content   enable row level security;
alter table kv_kai_eco_employees enable row level security;
alter table kv_kai_eco_app_packs enable row level security;
alter table kv_kai_eco_audit     enable row level security;
alter table kv_kai_eco_runs      enable row level security;

drop policy if exists "kai_eco_agents_authenticated" on kv_kai_eco_agents;
create policy "kai_eco_agents_authenticated" on kv_kai_eco_agents
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_installs_authenticated" on kv_kai_eco_installs;
create policy "kai_eco_installs_authenticated" on kv_kai_eco_installs
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_memory_authenticated" on kv_kai_eco_memory;
create policy "kai_eco_memory_authenticated" on kv_kai_eco_memory
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_knowledge_authenticated" on kv_kai_eco_knowledge;
create policy "kai_eco_knowledge_authenticated" on kv_kai_eco_knowledge
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_flows_authenticated" on kv_kai_eco_flows;
create policy "kai_eco_flows_authenticated" on kv_kai_eco_flows
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_flow_runs_authenticated" on kv_kai_eco_flow_runs;
create policy "kai_eco_flow_runs_authenticated" on kv_kai_eco_flow_runs
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_decisions_authenticated" on kv_kai_eco_decisions;
create policy "kai_eco_decisions_authenticated" on kv_kai_eco_decisions
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_research_authenticated" on kv_kai_eco_research;
create policy "kai_eco_research_authenticated" on kv_kai_eco_research
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_content_authenticated" on kv_kai_eco_content;
create policy "kai_eco_content_authenticated" on kv_kai_eco_content
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_employees_authenticated" on kv_kai_eco_employees;
create policy "kai_eco_employees_authenticated" on kv_kai_eco_employees
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_app_packs_authenticated" on kv_kai_eco_app_packs;
create policy "kai_eco_app_packs_authenticated" on kv_kai_eco_app_packs
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_audit_authenticated" on kv_kai_eco_audit;
create policy "kai_eco_audit_authenticated" on kv_kai_eco_audit
  for all to authenticated using (true) with check (true);

drop policy if exists "kai_eco_runs_authenticated" on kv_kai_eco_runs;
create policy "kai_eco_runs_authenticated" on kv_kai_eco_runs
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Seeds: 22 specialized agents
-- ============================================================
insert into kv_kai_eco_agents (code, name, category, description, capabilities, icon, color, default_prompt, sort_order) values
('customer', 'Customer AI', 'Customer Experience',
 'Answers questions, tracks orders, explains products, creates quotations, books consultations, handles complaints, and creates tickets.',
 '["Answer questions","Track orders","Explain products","Create quotations","Book consultations","Handle complaints","Create tickets"]',
 'headset', '#0EA5E9',
 'You are Customer AI. Resolve customer questions with warm, clear, honest answers. Escalate complaints and create support tickets when needed.', 1),
('sales', 'Sales AI', 'Sales & Revenue',
 'Drives upselling, cross-selling, bundle recommendations, price negotiation guidance, customer segmentation, lead qualification, and sales forecasting.',
 '["Upselling","Cross-selling","Bundle recommendations","Price negotiation guidance","Customer segmentation","Lead qualification","Sales forecasting"]',
 'trending-up', '#10B981',
 'You are Sales AI. Identify upsell and cross-sell opportunities, qualify leads, and guide pricing conversations.', 2),
('marketplace', 'Marketplace AI', 'Commerce',
 'Product recommendations, vendor matching, supplier discovery, alternative products, product comparison, demand prediction, and marketplace analytics.',
 '["Product recommendations","Vendor matching","Supplier discovery","Alternative products","Product comparison","Demand prediction","Marketplace analytics"]',
 'shopping-bag', '#FF6B00',
 'You are Marketplace AI. Match buyers with the right products, vendors, and suppliers across Kauvex.', 3),
('procurement', 'Procurement AI', 'Supply Chain',
 'Finds suppliers, compares quotations, recommends vendors, analyzes supplier risk and price trends, and automates procurement.',
 '["Find suppliers","Compare quotations","Recommend vendors","Supplier risk analysis","Price trend analysis","Procurement automation"]',
 'truck', '#F59E0B',
 'You are Procurement AI. Source, compare, and recommend the best suppliers with risk and price trend awareness.', 4),
('manufacturing', 'Manufacturing AI', 'Operations',
 'Production planning, capacity planning, material planning, machine scheduling, quality monitoring, cost estimation, and production optimization.',
 '["Production planning","Capacity planning","Material planning","Machine scheduling","Quality monitoring","Cost estimation","Production optimization"]',
 'factory', '#6366F1',
 'You are Manufacturing AI. Plan and optimize production while monitoring quality and costs.', 5),
('fashion', 'Fashion AI', 'Industry',
 'Generates patterns, suggests fabrics, predicts fit, optimizes material usage, generates tech packs, creates collections, and supports virtual fitting.',
 '["Generate patterns","Suggest fabrics","Predict fit","Optimize material usage","Generate tech packs","Create collections","Virtual fitting"]',
 'shirt', '#EC4899',
 'You are Fashion AI. Assist with garment design, material selection, fit, and collection planning.', 6),
('architecture', 'Architecture AI', 'Industry',
 'Generates floor plans, optimizes space, recommends materials, proposes structural concepts and interiors, estimates costs, and assists with building codes.',
 '["Generate floor plans","Space optimization","Material recommendations","Structural concepts","Interior suggestions","Cost estimation","Building code assistance"]',
 'building', '#8B5CF6',
 'You are Architecture AI. Support building design from layout to material and code guidance.', 7),
('marine', 'Marine AI', 'Industry',
 'Boat recommendations, hull optimization, engine selection, marine equipment recommendations, fuel efficiency suggestions, boat maintenance, and marine compliance guidance.',
 '["Boat recommendations","Hull optimization","Engine selection","Marine equipment recommendations","Fuel efficiency suggestions","Boat maintenance","Marine compliance guidance"]',
 'anchor', '#06B6D4',
 'You are Marine AI. Guide boat configuration, engine choice, maintenance, and compliance.', 8),
('printing', 'Printing AI', 'Industry',
 'Artwork preparation, print optimization, material suggestions, color management, cost estimation, and production planning.',
 '["Artwork preparation","Print optimization","Material suggestions","Color management","Cost estimation","Production planning"]',
 'printer', '#3B82F6',
 'You are Printing AI. Prepare artwork and plan print production with the right materials and colors.', 9),
('construction', 'Construction AI', 'Industry',
 'Construction planning, material estimation, equipment recommendations, scheduling, site documentation, safety reminders, and progress tracking.',
 '["Construction planning","Material estimation","Equipment recommendations","Scheduling","Site documentation","Safety reminders","Progress tracking"]',
 'hard-hat', '#F97316',
 'You are Construction AI. Plan construction work, estimate materials, and keep sites safe and on schedule.', 10),
('dredging', 'Dredging AI', 'Industry',
 'Equipment recommendations, production planning, fuel optimization, environmental reporting, maintenance scheduling, and fleet optimization.',
 '["Equipment recommendations","Production planning","Fuel optimization","Environmental reporting","Maintenance scheduling","Fleet optimization"]',
 'waves', '#14B8A6',
 'You are Dredging AI. Optimize dredging operations, equipment, fuel use, and environmental reporting.', 11),
('finance', 'Finance AI', 'Finance',
 'Budget planning, cash flow forecasting, expense analysis, profitability analysis, invoice assistance, and payment recommendations.',
 '["Budget planning","Cash flow forecasting","Expense analysis","Profitability analysis","Invoice assistance","Payment recommendations"]',
 'wallet', '#D97706',
 'You are Finance AI. Keep budgets healthy, forecast cash flow, and analyze profitability.', 12),
('hr', 'HR AI', 'People',
 'Recruitment assistance, resume screening, training recommendations, performance insights, and policy questions.',
 '["Recruitment assistance","Resume screening","Training recommendations","Performance insights","Policy questions"]',
 'users', '#84CC16',
 'You are HR AI. Support hiring, development, and people operations with empathy and clarity.', 13),
('marketing', 'Marketing AI', 'Growth',
 'Campaign generation, content creation, SEO, email marketing, social media planning, trend analysis, and audience segmentation.',
 '["Campaign generation","Content creation","SEO","Email marketing","Social media planning","Trend analysis","Audience segmentation"]',
 'megaphone', '#EF4444',
 'You are Marketing AI. Craft campaigns and content that convert, tuned to audience segments.', 14),
('compliance', 'Compliance AI', 'Governance',
 'ISO guidance, regulatory reminders, audit preparation, policy validation, risk identification, and documentation assistance.',
 '["ISO guidance","Regulatory reminders","Audit preparation","Policy validation","Risk identification","Documentation assistance"]',
 'shield', '#22C55E',
 'You are Compliance AI. Keep the organization compliant with clear, current guidance.', 15),
('legal', 'Legal AI', 'Governance',
 'Contract review assistance, policy drafting, clause suggestions, risk highlighting, and approval routing. Not legal advice.',
 '["Contract review assistance","Policy drafting","Clause suggestions","Risk highlighting","Approval routing"]',
 'scale', '#A855F7',
 'You are Legal AI. Assist with contract and policy review, flagging risks for human counsel.', 16),
('analytics', 'Analytics AI', 'Strategy',
 'Business insights, trend analysis, forecasts, KPI explanations, executive summaries, and decision support.',
 '["Business insights","Trend analysis","Forecasts","KPI explanations","Executive summaries","Decision support"]',
 'bar-chart', '#0A1628',
 'You are Analytics AI. Turn data into insights leaders can act on.', 17),
('design', 'Design AI', 'Design',
 'Suggests materials, dimensions, components, layouts, colors, pricing, manufacturing improvements, and sustainability improvements inside every design studio.',
 '["Material suggestions","Dimensions","Components","Layouts","Colors","Pricing","Manufacturing improvements","Sustainability improvements"]',
 'pen-tool', '#F43F5E',
 'You are Design AI. Advise on every design decision from materials to manufacturing.', 18),
('engineering', 'Engineering AI', 'Engineering',
 'Checks clearance, dimensions, weight distribution, assembly order, material usage, optimization opportunities, and engineering conflicts.',
 '["Clearance checks","Dimension checks","Weight distribution","Assembly order","Material usage","Optimization opportunities","Conflict detection"]',
 'cog', '#64748B',
 'You are Engineering AI. Validate designs for soundness, assembly, and optimization.', 19),
('research', 'Research AI', 'Intelligence',
 'Continuously researches competitors, market trends, technology, regulations, materials, consumer behavior, industry reports, pricing, and innovation, creating summarized reports.',
 '["Competitor research","Market trends","Technology","Regulations","Materials","Consumer behavior","Industry reports","Pricing","Innovation"]',
 'search', '#0EA5E9',
 'You are Research AI. Gather and summarize market intelligence into actionable reports.', 20),
('estimating', 'Estimator AI', 'Finance',
 'Quantity takeoff, cost estimation, budget forecasts, and quotation preparation for projects and production.',
 '["Quantity takeoff","Cost estimation","Budget forecasts","Quotation preparation"]',
 'calculator', '#F59E0B',
 'You are Estimator AI. Produce accurate cost estimates and budgets.', 21),
('scheduling', 'Scheduling AI', 'Operations',
 'Production schedules, resource allocation, timeline planning, and dependency management.',
 '["Production schedules","Resource allocation","Timeline planning","Dependency management"]',
 'calendar', '#3B82F6',
 'You are Scheduling AI. Build realistic schedules that respect capacity and dependencies.', 22)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  capabilities = excluded.capabilities,
  icon = excluded.icon,
  color = excluded.color,
  default_prompt = excluded.default_prompt,
  sort_order = excluded.sort_order;

-- ============================================================
-- Seeds: AI app store packs
-- ============================================================
insert into kv_kai_eco_app_packs (slug, name, industry, description, agents, price_monthly, icon, color, sort_order) values
('marine-ai-pack', 'Marine AI Pack', 'Marine', 'Boat configuration, hull and engine guidance, maintenance, fuel efficiency, and compliance for marine businesses.',
 '["marine","engineering","estimating","scheduling"]', 49, 'anchor', '#06B6D4', 1),
('fashion-ai-pack', 'Fashion AI Pack', 'Fashion', 'Pattern generation, fabric suggestions, fit prediction, tech packs, and collection planning.',
 '["fashion","design","marketing","analytics"]', 49, 'shirt', '#EC4899', 2),
('construction-ai-pack', 'Construction AI Pack', 'Construction', 'Construction planning, material estimation, equipment recommendations, scheduling, and site safety.',
 '["construction","architecture","estimating","scheduling","compliance"]', 49, 'hard-hat', '#F97316', 3),
('manufacturing-ai-pack', 'Manufacturing AI Pack', 'Manufacturing', 'Production planning, capacity, material planning, machine scheduling, quality, and cost optimization.',
 '["manufacturing","engineering","estimating","scheduling","analytics"]', 49, 'factory', '#6366F1', 4),
('healthcare-ai-pack', 'Healthcare AI Pack', 'Healthcare', 'Operations, scheduling, compliance, and patient experience support for healthcare organizations.',
 '["customer","scheduling","compliance","analytics"]', 49, 'activity', '#22C55E', 5),
('agriculture-ai-pack', 'Agriculture AI Pack', 'Agriculture', 'Farming operations, supply chain, equipment, and market intelligence for agribusiness.',
 '["marketplace","procurement","research","analytics"]', 49, 'sprout', '#84CC16', 6),
('hospitality-ai-pack', 'Hospitality AI Pack', 'Hospitality', 'Guest experience, reservations, marketing, and operations for hotels and hospitality businesses.',
 '["customer","sales","marketing","scheduling"]', 49, 'bed', '#F43F5E', 7),
('education-ai-pack', 'Education AI Pack', 'Education', 'Student support, content creation, scheduling, and institutional analytics.',
 '["customer","content","scheduling","analytics"]', 49, 'graduation-cap', '#8B5CF6', 8),
('legal-ai-pack', 'Legal AI Pack', 'Legal', 'Contract review, policy drafting, clause suggestions, and risk highlighting for legal teams.',
 '["legal","compliance","research","analytics"]', 49, 'scale', '#A855F7', 9),
('retail-ai-pack', 'Retail AI Pack', 'Retail', 'Customer experience, sales, inventory, marketing, and marketplace analytics for retailers.',
 '["customer","sales","marketplace","marketing","analytics"]', 49, 'shopping-bag', '#FF6B00', 10)
on conflict (slug) do update set
  name = excluded.name,
  industry = excluded.industry,
  description = excluded.description,
  agents = excluded.agents,
  price_monthly = excluded.price_monthly,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order;
