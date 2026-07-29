-- ============================================================
-- KAUVEX KAI (KAI) — Phase 28
-- Strategic Layer: Workflows, Skills Marketplace, Passport+
-- ============================================================

-- ============================================================
-- KAI CONFIG (MISSING FROM PHASE 27)
-- ============================================================
CREATE TABLE kv_kai_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key      VARCHAR(200) UNIQUE NOT NULL,
  config_value    TEXT,
  description     TEXT,
  is_secret       BOOLEAN       DEFAULT false,
  updated_at      TIMESTAMPTZ   DEFAULT now(),
  updated_by      UUID
);

-- ============================================================
-- KAI10 — WORKFLOW DEFINITIONS
-- ============================================================
CREATE TABLE kv_kai_workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  name            VARCHAR(200)  NOT NULL,
  description     TEXT,
  trigger_type    VARCHAR(50)   NOT NULL,
  trigger_config  JSONB         DEFAULT '{}',
  is_active       BOOLEAN       DEFAULT true,
  version         INT           DEFAULT 1,
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_wf_biz_active ON kv_kai_workflows(business_id, is_active);

-- ============================================================
-- KAI11 — WORKFLOW STEPS
-- ============================================================
CREATE TABLE kv_kai_workflow_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID          NOT NULL REFERENCES kv_kai_workflows(id) ON DELETE CASCADE,
  step_order      INT           NOT NULL,
  step_type       VARCHAR(50)   NOT NULL,
  step_config     JSONB         DEFAULT '{}',
  next_on_success UUID,
  next_on_failure UUID,
  created_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_wf_step_order ON kv_kai_workflow_steps(workflow_id, step_order);

-- ============================================================
-- KAI12 — AI SKILLS MARKETPLACE
-- ============================================================
CREATE TABLE kv_kai_skills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200)  NOT NULL,
  slug            VARCHAR(200)  UNIQUE NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  industry        VARCHAR(100),
  price_monthly   DECIMAL(10,2) DEFAULT 0,
  capabilities    JSONB         DEFAULT '[]',
  system_prompt   TEXT,
  icon            VARCHAR(50),
  color           VARCHAR(30),
  is_active       BOOLEAN       DEFAULT true,
  is_official     BOOLEAN       DEFAULT true,
  developer_id    UUID,
  install_count   INT           DEFAULT 0,
  rating          DECIMAL(3,2)  DEFAULT 0,
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_skills_cat_ind_active ON kv_kai_skills(category, industry, is_active);

-- ============================================================
-- KAI13 — SKILL INSTALLS
-- ============================================================
CREATE TABLE kv_kai_skill_installs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id        UUID          NOT NULL REFERENCES kv_kai_skills(id) ON DELETE CASCADE,
  agent_id        UUID          NOT NULL REFERENCES kv_kai_agents(id) ON DELETE CASCADE,
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  is_active       BOOLEAN       DEFAULT true,
  installed_at    TIMESTAMPTZ   DEFAULT now(),
  UNIQUE(skill_id, agent_id)
);

-- ============================================================
-- KAI14 — INDUSTRY PACKS
-- ============================================================
CREATE TABLE kv_kai_industry_packs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(200)  NOT NULL,
  slug                VARCHAR(200)  UNIQUE NOT NULL,
  industry            VARCHAR(100)  NOT NULL,
  description         TEXT,
  price_monthly       DECIMAL(10,2) DEFAULT 0,
  price_yearly        DECIMAL(10,2),
  skills              JSONB         DEFAULT '[]',
  knowledge_base_docs JSONB         DEFAULT '[]',
  icon                VARCHAR(50),
  color               VARCHAR(30),
  is_active           BOOLEAN       DEFAULT true,
  sort_order          INT           DEFAULT 0,
  created_at          TIMESTAMPTZ   DEFAULT now()
);

-- ============================================================
-- KAI15 — AI-TO-AI MESSAGES
-- ============================================================
CREATE TABLE kv_kai_agent_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_agent_id   UUID          NOT NULL REFERENCES kv_kai_agents(id) ON DELETE CASCADE,
  receiver_agent_id UUID          NOT NULL REFERENCES kv_kai_agents(id) ON DELETE CASCADE,
  workflow_id       UUID          REFERENCES kv_kai_workflows(id) ON DELETE SET NULL,
  subject           VARCHAR(500),
  message           TEXT          NOT NULL,
  context           JSONB         DEFAULT '{}',
  status            VARCHAR(20)   DEFAULT 'pending',
  read_at           TIMESTAMPTZ,
  acted_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_agent_msgs_sender ON kv_kai_agent_messages(sender_agent_id);
CREATE INDEX idx_kai_agent_msgs_receiver ON kv_kai_agent_messages(receiver_agent_id);
CREATE INDEX idx_kai_agent_msgs_status ON kv_kai_agent_messages(status);

-- ============================================================
-- KAI16 — DOCUMENT HUB (COMPANY BRAIN)
-- ============================================================
CREATE TABLE kv_kai_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  name            VARCHAR(500)  NOT NULL,
  type            VARCHAR(50),
  file_url        TEXT,
  file_size       INT,
  mime_type       VARCHAR(100),
  source          VARCHAR(20)   DEFAULT 'upload',
  is_indexed      BOOLEAN       DEFAULT false,
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_docs_biz_type ON kv_kai_documents(business_id, type, is_indexed);

-- ============================================================
-- KAI17 — EXTERNAL CONNECTIONS
-- ============================================================
CREATE TABLE kv_kai_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID          NOT NULL REFERENCES kv_kai_businesses(id) ON DELETE CASCADE,
  name            VARCHAR(200)  NOT NULL,
  provider        VARCHAR(100)  NOT NULL,
  config          JSONB         DEFAULT '{}',
  is_connected    BOOLEAN       DEFAULT false,
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   DEFAULT now(),
  updated_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_conn_biz_provider ON kv_kai_connections(business_id, provider);

-- ============================================================
-- DIGITAL PASSPORT — TEMPLATES
-- ============================================================
CREATE TABLE kv_digital_passport_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50)  UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  icon            VARCHAR(50),
  color           VARCHAR(30),
  schema_fields   JSONB        DEFAULT '[]',
  is_active       BOOLEAN      DEFAULT true,
  created_at      TIMESTAMPTZ  DEFAULT now()
);

-- ============================================================
-- DIGITAL PASSPORT — TRANSFERS
-- ============================================================
CREATE TABLE kv_digital_passport_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id     UUID          NOT NULL REFERENCES kv_digital_passports(id) ON DELETE CASCADE,
  from_owner_id   UUID,
  to_owner_id     UUID,
  transfer_type   VARCHAR(20)   DEFAULT 'sale',
  status          VARCHAR(20)   DEFAULT 'pending',
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_kai_passport_transfer ON kv_digital_passport_transfers(passport_id, status);

-- ============================================================
-- DIGITAL PASSPORT — DIGITAL VAULT
-- ============================================================
CREATE TABLE kv_digital_passport_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id     UUID          NOT NULL REFERENCES kv_digital_passports(id) ON DELETE CASCADE,
  name            VARCHAR(500)  NOT NULL,
  type            VARCHAR(50),
  file_url        TEXT,
  file_size       INT,
  mime_type       VARCHAR(100),
  uploaded_by     UUID,
  metadata        JSONB         DEFAULT '{}',
  created_at      TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX idx_kai_passport_doc ON kv_digital_passport_documents(passport_id);

-- ============================================================
-- SEED: Industry Packs
-- ============================================================
INSERT INTO kv_kai_industry_packs (name, slug, industry, description, price_monthly, icon, color, sort_order) VALUES
  ('Marine & Offshore Pack', 'marine-pack', 'marine', 'Specialized AI knowledge for marine engineering, boat building, and offshore operations. Includes vessel specifications, marine engines, navigation systems, and IMO terminology.', 29, 'Ship', 'blue', 1),
  ('Solar & Renewable Pack', 'solar-pack', 'solar', 'AI-powered solar calculations, battery sizing, energy audits, inverter compatibility, and installation planning for solar energy professionals.', 29, 'Sun', 'orange', 2),
  ('Dredging & Mining Pack', 'dredging-pack', 'dredging', 'Expert knowledge for dredging operations: dredger types, soil classification, cutter heads, pump curves, river engineering, and land reclamation.', 39, 'Tractor', 'yellow', 3),
  ('CCTV & Security Pack', 'cctv-pack', 'security', 'Comprehensive AI for security professionals: camera specifications, system design, cable calculations, storage planning, and installation standards.', 19, 'Shield', 'indigo', 4),
  ('Construction & Building Pack', 'construction-pack', 'construction', 'AI assistant for construction: building materials, structural calculations, project planning, compliance checks, and contractor management.', 29, 'Building2', 'green', 5);

-- ============================================================
-- SEED: AI Skills (10 starter skills)
-- ============================================================
INSERT INTO kv_kai_skills (name, slug, description, category, industry, price_monthly, icon, color, capabilities, system_prompt) VALUES
  ('Sales Manager AI', 'sales-manager', 'Handles inquiries, generates quotations, follows up leads, and closes deals. Knows your full product catalogue and pricing.', 'function', NULL, 20, 'TrendingUp', 'green', '["lead-qualification", "quotation-generation", "follow-up", "cross-selling", "customer-tracking"]', 'You are a professional Sales Manager for the company. Your role is to handle customer inquiries, generate accurate quotations, follow up on leads, and close deals. You know the product catalogue thoroughly. Always be professional, persuasive, and helpful.'),
  ('Customer Support AI', 'customer-support', 'Answers FAQs, troubleshoots issues, checks warranty status, and escalates to human agents when needed.', 'function', NULL, 15, 'Headphones', 'blue', '["faq-answering", "troubleshooting", "warranty-check", "ticket-management", "escalation"]', 'You are a Customer Support agent. Your job is to help customers with their questions and issues. You have access to FAQs, manuals, warranty info, and troubleshooting guides. Be patient, clear, and helpful. If you cannot resolve an issue, escalate to a human.'),
  ('Procurement AI', 'procurement', 'Finds suppliers, compares prices, suggests purchase orders, and manages vendor relationships.', 'function', NULL, 25, 'Package', 'purple', '["supplier-search", "price-comparison", "po-generation", "vendor-management", "negotiation-support"]', 'You are a Procurement Officer. Your job is to source products, compare supplier prices, generate purchase orders, and manage vendor relationships. Always find the best value for the company.'),
  ('Inventory AI', 'inventory', 'Tracks stock levels, alerts on low stock, predicts demand, and coordinates with Procurement AI.', 'function', NULL, 20, 'Layers', 'amber', '["stock-tracking", "low-stock-alerts", "demand-forecasting", "reorder-suggestions", "inventory-audit"]', 'You are an Inventory Manager. Track all stock levels, alert when items are low, forecast demand based on history, and suggest reorders. Coordinate with Procurement AI when stock needs replenishing.'),
  ('HR Assistant AI', 'hr-assistant', 'Manages employee records, leave requests, onboarding checklists, and policy answers.', 'function', NULL, 15, 'Users', 'pink', '["employee-records", "leave-management", "onboarding", "policy-qa", "training-tracking"]', 'You are an HR Assistant. Manage employee records, handle leave requests, guide new hires through onboarding, answer policy questions, and track training. Maintain confidentiality.'),
  ('Finance AI', 'finance', 'Handles invoicing, expense tracking, cash flow monitoring, and basic financial reporting.', 'function', NULL, 25, 'DollarSign', 'emerald', '["invoicing", "expense-tracking", "cash-flow", "financial-reports", "budget-monitoring"]', 'You are a Finance Officer. Handle invoicing, track expenses, monitor cash flow, generate financial reports, and watch budgets. Be precise and accurate with all numbers.'),
  ('Marketing AI', 'marketing', 'Creates social media posts, email campaigns, ad copy, and content calendars.', 'function', NULL, 20, 'Megaphone', 'rose', '["social-media", "email-campaigns", "ad-copy", "content-creation", "analytics"]', 'You are a Marketing specialist. Create engaging social media posts, email campaigns, ad copy, and content calendars. Track campaign performance and suggest improvements. Be creative and data-driven.'),
  ('Project Manager AI', 'project-manager', 'Creates project plans, assigns tasks, tracks milestones, and generates progress reports.', 'function', NULL, 25, 'ClipboardCheck', 'indigo', '["project-planning", "task-assignment", "milestone-tracking", "progress-reports", "resource-management"]', 'You are a Project Manager. Plan projects, assign tasks, track milestones, generate progress reports, and manage resources. Keep everything on schedule and within budget.'),
  ('CEO Assistant AI', 'ceo-assistant', 'Executive assistant: summarizes reports, prepares briefings, manages schedule, and provides business insights.', 'function', NULL, 40, 'Crown', 'gold', '["report-summarization", "briefing-preparation", "insights", "meeting-management", "decision-support"]', 'You are an Executive Assistant to the CEO. Summarize reports, prepare briefings, provide business insights, manage schedules, and support decision-making. Be concise, strategic, and professional.'),
  ('BOQ Generator AI', 'boq-generator', 'Generates Bills of Quantities from project specifications. Supports construction, solar, marine, and security projects.', 'tool', NULL, 15, 'Calculator', 'slate', '["boq-generation", "quantity-takeoff", "cost-estimation", "material-breakdown"]', 'You are a Quantity Surveyor AI. Generate accurate Bills of Quantities from project specifications. Break down materials, labor, and equipment costs. Support construction, solar, marine, and security projects.');

-- ============================================================
-- SEED: Passport Templates (10 entity types)
-- ============================================================
INSERT INTO kv_digital_passport_templates (entity_type, name, icon, color, schema_fields) VALUES
  ('product', 'Product Passport', 'Package', 'blue', '[{"key":"manufacturer","label":"Manufacturer","type":"string","required":true},{"key":"brand","label":"Brand","type":"string","required":true},{"key":"model","label":"Model","type":"string","required":true},{"key":"serialNumber","label":"Serial Number","type":"string","required":false},{"key":"productionDate","label":"Production Date","type":"date","required":false},{"key":"countryOfOrigin","label":"Country of Origin","type":"string","required":false},{"key":"warrantyMonths","label":"Warranty (months)","type":"number","required":false}]'),
  ('asset', 'Asset Passport', 'HardDrive', 'indigo', '[{"key":"assetType","label":"Asset Type","type":"string","required":true},{"key":"purchaseDate","label":"Purchase Date","type":"date","required":true},{"key":"purchaseValue","label":"Purchase Value","type":"number","required":false},{"key":"currentValue","label":"Current Value","type":"number","required":false},{"key":"usageHours","label":"Usage Hours","type":"number","required":false},{"key":"location","label":"Location","type":"string","required":false}]'),
  ('company', 'Company Passport', 'Building2', 'green', '[{"key":"registrationNumber","label":"Registration Number","type":"string","required":true},{"key":"taxId","label":"Tax ID","type":"string","required":false},{"key":"certifications","label":"Certifications","type":"array","required":false},{"key":"industriesServed","label":"Industries Served","type":"array","required":false},{"key":"yearEstablished","label":"Year Established","type":"number","required":false},{"key":"branches","label":"Branches","type":"number","required":false},{"key":"employeeCount","label":"Employee Count","type":"number","required":false}]'),
  ('professional', 'Professional Passport', 'UserCheck', 'violet', '[{"key":"fullName","label":"Full Name","type":"string","required":true},{"key":"profession","label":"Profession","type":"string","required":true},{"key":"certifications","label":"Certifications","type":"array","required":false},{"key":"yearsExperience","label":"Years Experience","type":"number","required":false},{"key":"specialization","label":"Specialization","type":"string","required":false}]'),
  ('project', 'Project Passport', 'FolderKanban', 'amber', '[{"key":"projectType","label":"Project Type","type":"string","required":true},{"key":"clientName","label":"Client Name","type":"string","required":true},{"key":"contractor","label":"Contractor","type":"string","required":false},{"key":"budget","label":"Budget","type":"number","required":false},{"key":"startDate","label":"Start Date","type":"date","required":false},{"key":"endDate","label":"End Date","type":"date","required":false},{"key":"status","label":"Status","type":"string","required":true}]'),
  ('service', 'Service Passport', 'Wrench', 'cyan', '[{"key":"serviceType","label":"Service Type","type":"string","required":true},{"key":"technician","label":"Technician","type":"string","required":true},{"key":"customerName","label":"Customer Name","type":"string","required":true},{"key":"completionDate","label":"Completion Date","type":"date","required":true},{"key":"partsUsed","label":"Parts Used","type":"array","required":false}]'),
  ('boat', 'Boat Passport', 'Ship', 'blue', '[{"key":"hullNumber","label":"Hull Number","type":"string","required":true},{"key":"boatType","label":"Boat Type","type":"string","required":true},{"key":"builder","label":"Builder","type":"string","required":true},{"key":"yearBuilt","label":"Year Built","type":"number","required":true},{"key":"length","label":"Length (m)","type":"number","required":false},{"key":"engineModel","label":"Engine Model","type":"string","required":false},{"key":"engineHours","label":"Engine Hours","type":"number","required":false}]'),
  ('dredger', 'Dredger Passport', 'Tractor', 'yellow', '[{"key":"dredgerType","label":"Dredger Type","type":"string","required":true},{"key":"pumpHours","label":"Pump Hours","type":"number","required":true},{"key":"cutterHours","label":"Cutter Hours","type":"number","required":false},{"key":"productionVolume","label":"Production Volume (m³)","type":"number","required":false},{"key":"fuelCapacity","label":"Fuel Capacity (L)","type":"number","required":false}]'),
  ('building', 'Building Passport', 'Building', 'gray', '[{"key":"buildingType","label":"Building Type","type":"string","required":true},{"key":"architect","label":"Architect","type":"string","required":false},{"key":"contractor","label":"Contractor","type":"string","required":true},{"key":"yearBuilt","label":"Year Built","type":"number","required":true},{"key":"floors","label":"Floors","type":"number","required":false},{"key":"totalArea","label":"Total Area (sqm)","type":"number","required":false}]'),
  ('vehicle', 'Vehicle Passport', 'Truck', 'slate', '[{"key":"make","label":"Make","type":"string","required":true},{"key":"model","label":"Model","type":"string","required":true},{"key":"year","label":"Year","type":"number","required":true},{"key":"licensePlate","label":"License Plate","type":"string","required":false},{"key":"vin","label":"VIN","type":"string","required":false},{"key":"fuelType","label":"Fuel Type","type":"string","required":false},{"key":"mileage","label":"Mileage (km)","type":"number","required":false}]');