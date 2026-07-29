-- ============================================================
-- KAUVEX AI (KAI) — Phase 27b
-- Multi-Agent Workforce + Digital Passport + Subscriptions
-- ============================================================

-- ============================================================
-- KAI6 — BUSINESS REGISTRATION
-- ============================================================
CREATE TABLE kv_kai_businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    VARCHAR(200)  NOT NULL,
  industry        VARCHAR(100),
  staff_count     INT,
  description     TEXT,
  products        TEXT,
  services        TEXT,
  locations       TEXT[],
  website         TEXT,
  logo_url        TEXT,
  contact_email   VARCHAR(200),
  contact_phone   VARCHAR(50),
  onboarded       BOOLEAN       DEFAULT false,
  metadata        JSONB         DEFAULT '{}',
  user_id         UUID UNIQUE,
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_biz_user ON kv_kai_businesses(user_id);
CREATE INDEX idx_kai_biz_industry ON kv_kai_businesses(industry);

-- ============================================================
-- KAI7 — SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE kv_kai_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100)  NOT NULL,
  slug            VARCHAR(100)  UNIQUE NOT NULL,
  description     TEXT,
  price_monthly   DECIMAL(10,2) NOT NULL,
  price_yearly    DECIMAL(10,2),
  currency        VARCHAR(10)   DEFAULT 'USD',
  max_agents      INT           DEFAULT 1,
  max_kb_size_mb  INT           DEFAULT 100,
  features        JSONB         DEFAULT '[]',
  is_active       BOOLEAN       DEFAULT true,
  sort_order      INT           DEFAULT 0,
  created_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE kv_kai_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  plan_id         UUID          NOT NULL REFERENCES kv_kai_plans(id),
  status          VARCHAR(20)   DEFAULT 'active',  -- active | paused | cancelled | expired
  billing_cycle   VARCHAR(10)   DEFAULT 'monthly', -- monthly | yearly
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  auto_renew      BOOLEAN       DEFAULT true,
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_sub_biz ON kv_kai_subscriptions(business_id);
CREATE INDEX idx_kai_sub_status ON kv_kai_subscriptions(status);

-- ============================================================
-- KAI8 — MULTI-AGENT WORKFORCE
-- ============================================================
CREATE TABLE kv_kai_agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  name            VARCHAR(100)  NOT NULL,
  role            VARCHAR(100)  NOT NULL,  -- Sales Manager, Customer Support, Procurement, etc.
  avatar          VARCHAR(10),              -- initials
  color           VARCHAR(30),              -- gradient class
  description     TEXT,
  system_prompt   TEXT,                     -- custom instructions
  knowledge_scope VARCHAR(20)   DEFAULT 'business', -- business | industry | all
  model           VARCHAR(100)  DEFAULT 'openai/gpt-4o-mini',
  temperature     DECIMAL(3,2)  DEFAULT 0.7,
  is_active       BOOLEAN       DEFAULT true,
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now(),

  CONSTRAINT fk_kai_agent_business FOREIGN KEY (business_id) REFERENCES kv_kai_businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_kai_agent_biz ON kv_kai_agents(business_id);
CREATE INDEX idx_kai_agent_role ON kv_kai_agents(role);

CREATE TABLE kv_kai_agent_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID          NOT NULL REFERENCES kv_kai_agents(id) ON DELETE CASCADE,
  resource_type   VARCHAR(50)   NOT NULL,  -- products | orders | inventory | customers | finance | hr
  can_view        BOOLEAN       DEFAULT false,
  can_create      BOOLEAN       DEFAULT false,
  can_edit        BOOLEAN       DEFAULT false,
  can_delete      BOOLEAN       DEFAULT false,
  created_at      TIMESTAMPTZ   DEFAULT now(),

  CONSTRAINT fk_kai_perm_agent FOREIGN KEY (agent_id) REFERENCES kv_kai_agents(id) ON DELETE CASCADE,
  UNIQUE(agent_id, resource_type)
);

-- ============================================================
-- KAI9 — DIGITAL PASSPORT
-- ============================================================
CREATE TABLE kv_digital_passports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50)   NOT NULL,  -- product | company | professional | project | asset | boat | vehicle | building | service
  entity_id       VARCHAR(100)  NOT NULL,  -- ID of the entity in its source table
  title           VARCHAR(500)  NOT NULL,
  status          VARCHAR(50)   DEFAULT 'active',
  trust_score     DECIMAL(5,2),
  qr_code         TEXT,                     -- generated QR data URL
  passport_data   JSONB         DEFAULT '{}', -- flexible metadata
  documents       JSONB         DEFAULT '[]', -- [{name, url, type, uploaded_at}]
  owner_id        UUID,                     -- current owner (user or business)
  is_verified     BOOLEAN       DEFAULT false,
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_passport_type ON kv_digital_passports(entity_type);
CREATE INDEX idx_kai_passport_entity ON kv_digital_passports(entity_type, entity_id);
CREATE INDEX idx_kai_passport_owner ON kv_digital_passports(owner_id);
CREATE INDEX idx_kai_passport_score ON kv_digital_passports(trust_score);

CREATE TABLE kv_digital_passport_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id     UUID          NOT NULL REFERENCES kv_digital_passports(id) ON DELETE CASCADE,
  event_type      VARCHAR(100)  NOT NULL,  -- manufactured | sold | installed | serviced | transferred | inspected | renewed
  title           VARCHAR(500)  NOT NULL,
  description     TEXT,
  event_date      TIMESTAMPTZ   DEFAULT now(),
  performed_by    VARCHAR(200),
  documents       JSONB         DEFAULT '[]',
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_passport_event ON kv_digital_passport_events(passport_id);
CREATE INDEX idx_kai_passport_event_date ON kv_digital_passport_events(event_date);

-- ============================================================
-- SEED: Default subscription plans
-- ============================================================
INSERT INTO kv_kai_plans (name, slug, description, price_monthly, max_agents, features, sort_order) VALUES
  ('Starter', 'starter', 'Perfect for small businesses starting with AI', 29, 1, '["1 AI Employee", "100MB knowledge base", "Basic support", "Email integration"]', 1),
  ('Growth', 'growth', 'For growing teams that need more AI capacity', 99, 5, '["5 AI Employees", "500MB knowledge base", "Priority support", "Email + CRM integration", "Custom workflows"]', 2),
  ('Business', 'business', 'For established businesses with full AI teams', 299, 15, '["15 AI Employees", "2GB knowledge base", "Dedicated support", "Full API access", "Custom workflows", "Multi-agent collaboration", "Advanced analytics"]', 3),
  ('Enterprise', 'enterprise', 'Custom AI workforce for large organizations', 0, 999, '["Unlimited AI Employees", "Unlimited knowledge base", "White-label option", "Dedicated account manager", "On-premise deployment option", "SLA guarantee", "Custom integrations"]', 4);
