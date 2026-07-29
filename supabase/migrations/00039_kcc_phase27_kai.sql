-- ============================================================
-- KAUVEX AI (KAI) — Phase 27
-- pgvector extension + knowledge base + chat infrastructure
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- KAI1 — KNOWLEDGE BASE (RAG SYSTEM)
-- ============================================================
CREATE TABLE kv_kai_knowledge_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      VARCHAR(50)  NOT NULL,          -- platform | industry | product | professional | policy
  subcategory   VARCHAR(100),                    -- e.g. "shipping", "returns", "surveillance"
  title         VARCHAR(500) NOT NULL,
  content       TEXT         NOT NULL,
  embedding     VECTOR(1536),                    -- OpenAI text-embedding-3-small dimensions
  metadata      JSONB        DEFAULT '{}',
  source_url    TEXT,
  language      VARCHAR(10)  DEFAULT 'en',
  chunk_index   INT          DEFAULT 0,
  parent_id     UUID,                            -- for hierarchical chunks
  is_active     BOOLEAN      DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT now(),
  updated_at    TIMESTAMPTZ  DEFAULT now(),

  CONSTRAINT fk_kai_chunk_parent FOREIGN KEY (parent_id) REFERENCES kv_kai_knowledge_chunks(id) ON DELETE CASCADE
);

CREATE INDEX idx_kai_kb_category ON kv_kai_knowledge_chunks(category);
CREATE INDEX idx_kai_kb_subcategory ON kv_kai_knowledge_chunks(subcategory);
CREATE INDEX idx_kai_kb_active ON kv_kai_knowledge_chunks(is_active);
CREATE INDEX idx_kai_kb_embedding ON kv_kai_knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- KAI2 — CONVERSATIONS & MESSAGES
-- ============================================================
CREATE TABLE kv_kai_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,                              -- nullable for anonymous users
  session_id    VARCHAR(100) NOT NULL,              -- browser session for anonymous
  persona       VARCHAR(50)  DEFAULT 'sarah',       -- which KAI persona
  context       JSONB        DEFAULT '{}',           -- extracted context from conversation
  metadata      JSONB        DEFAULT '{}',
  message_count INT          DEFAULT 0,
  is_active     BOOLEAN      DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT now(),
  updated_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX idx_kai_conv_user ON kv_kai_conversations(user_id);
CREATE INDEX idx_kai_conv_session ON kv_kai_conversations(session_id);
CREATE INDEX idx_kai_conv_active ON kv_kai_conversations(is_active);

CREATE TABLE kv_kai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID           NOT NULL,
  role            VARCHAR(10)    NOT NULL,          -- user | assistant | system
  content         TEXT           NOT NULL,
  sources         JSONB,                            -- [{ chunk_id, title, score }] — RAG context used
  tokens_used     INT            DEFAULT 0,
  latency_ms      INT            DEFAULT 0,
  metadata        JSONB          DEFAULT '{}',
  created_at      TIMESTAMPTZ    DEFAULT now(),

  CONSTRAINT fk_kai_msg_conv FOREIGN KEY (conversation_id) REFERENCES kv_kai_conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_kai_msg_conv ON kv_kai_messages(conversation_id);
CREATE INDEX idx_kai_msg_created ON kv_kai_messages(created_at);

-- ============================================================
-- KAI3 — FEEDBACK & RATINGS
-- ============================================================
CREATE TABLE kv_kai_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    UUID           NOT NULL,
  user_id       UUID,
  rating        INT            NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful       BOOLEAN,
  feedback_text TEXT,
  created_at    TIMESTAMPTZ    DEFAULT now(),

  CONSTRAINT fk_kai_fb_msg FOREIGN KEY (message_id) REFERENCES kv_kai_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_kai_fb_msg ON kv_kai_feedback(message_id);
CREATE INDEX idx_kai_fb_rating ON kv_kai_feedback(rating);

-- ============================================================
-- KAI4 — SEARCH FUNCTIONS (cosine similarity)
-- ============================================================
CREATE OR REPLACE FUNCTION kv_kai_search_embeddings(
  query_embedding VECTOR(1536),
  match_limit INT DEFAULT 10,
  filter_category VARCHAR(50) DEFAULT NULL,
  filter_subcategory VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  category VARCHAR(50),
  subcategory VARCHAR(100),
  title VARCHAR(500),
  content TEXT,
  metadata JSONB,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.category,
    k.subcategory,
    k.title,
    k.content,
    k.metadata,
    k.source_url,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM kv_kai_knowledge_chunks k
  WHERE k.is_active = true
    AND k.embedding IS NOT NULL
    AND (filter_category IS NULL OR k.category = filter_category)
    AND (filter_subcategory IS NULL OR k.subcategory = filter_subcategory)
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;

-- Increment message count function (used by API)
CREATE OR REPLACE FUNCTION kv_kai_increment_message_count(conv_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE kv_kai_conversations
  SET message_count = message_count + 1, updated_at = now()
  WHERE id = conv_id;
END;
$$;

-- ============================================================
-- KAI5 — CONFIGURATION (API keys, settings — admin-managed)
-- ============================================================
CREATE TABLE kv_kai_config (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  is_secret  BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO kv_kai_config (config_key, config_value, description, is_secret) VALUES
  ('openrouter_api_key', '', 'OpenRouter API key for AI chat completion', true),
  ('openai_embedding_api_key', '', 'OpenAI API key for text-embedding-3-small', true),
  ('google_maps_api_key', '', 'Google Maps API key for Distance Matrix', true),
  ('kai_default_model', 'openai/gpt-4o-mini', 'Default LLM model for KAI responses', false),
  ('kai_embedding_model', 'text-embedding-3-small', 'Embedding model for vector search', false),
  ('kai_max_context_chunks', '5', 'Number of knowledge base chunks per query', false),
  ('kai_free_radius_km', '10', 'Default free travel radius for professionals (km)', false);

-- ============================================================
-- SEED: Platform knowledge base entries
-- ============================================================
INSERT INTO kv_kai_knowledge_chunks (category, subcategory, title, content, metadata) VALUES
-- Platform Knowledge
('platform', 'general', 'What is KAUVEX?', 'KAUVEX is a global multi-vendor e-commerce platform based in Nigeria. We connect buyers with verified sellers, professionals, and services across 15+ industries including security, marine, construction, solar, dredging, and more. Our platform combines marketplace, professional services (KPN), logistics, and industry-specific tools.', '{"source": "platform-docs", "priority": 1}'),
('platform', 'general', 'Platform mission', 'KAUVEX''s mission is "Everything. Everywhere. Delivered." We provide a unified commerce platform that handles marketplace sales, professional installation services, logistics, and industry-specific solutions.', '{"source": "platform-docs", "priority": 1}'),
('platform', 'payment', 'Payment methods', 'KAUVEX accepts multiple payment methods: Wallet (KAUVEX Pay), Card payments (Mastercard, Visa, Verve), Bank transfers (via virtual accounts), USSD codes, BNPL (Buy Now Pay Later — 25% upfront, 3 installments over 9 weeks), and Cash on Delivery (select locations). Available methods vary by country.', '{"source": "platform-docs", "priority": 2}'),
('platform', 'payment', 'KAUVEX Pay wallet', 'Every KAUVEX user gets a wallet on registration. You can top up via card, bank transfer (virtual account), or USSD. Use wallet for one-click checkout, split payments (wallet + card), and withdrawals. Withdrawals under ₦50K are instant; above ₦50K require manual review within 24 hours.', '{"source": "platform-docs", "priority": 2}'),
('platform', 'payment', 'BNPL — Buy Now Pay Later', 'KAUVEX BNPL allows customers to pay 25% upfront and receive items immediately. The remaining 75% is split into 3 installments over 9 weeks (21 days apart). Vendors receive full payment on Day 1 — KAUVEX holds the credit risk. Late fee: ₦500 after 7-day grace period.', '{"source": "platform-docs", "priority": 2}'),
('platform', 'shipping', 'Delivery options', 'KAUVEX offers multi-tier delivery: TIER 1 — Same-day/next-day via local partners (GIG, Kwik, independent riders) within city. TIER 2 — 1-5 day domestic freight between cities. TIER 3 — International shipping via DHL, FedEx, Aramex, and freight forwarders. Free delivery on orders over ₦100,000.', '{"source": "platform-docs", "priority": 2}'),
('platform', 'returns', 'Return policy', 'KAUVEX offers a 7-day return policy on most items. Items must be unused, in original packaging, with all accessories. Some categories (marine engines, dredging equipment, custom orders) are non-returnable. Return shipping is covered by KAUVEX for defective items.', '{"source": "platform-docs", "priority": 2}'),
('platform', 'warranty', 'Warranty coverage', 'All products on KAUVEX come with a minimum 12-month manufacturer warranty. Extended warranty options are available at checkout. Installation services include a 90-day workmanship warranty.', '{"source": "platform-docs", "priority": 2}'),

-- Professional Services (KPN)
('professional', 'kpn-overview', 'KPN — Kauvex Professional Network', 'KPN is KAUVEX''s network of verified professionals offering installation, maintenance, and technical services. Professionals are vetted, certified, and rated. Services include: CCTV installation, fire alarm systems, access control, solar installation, kitchen fitting, dredging operations, boat building, and general maintenance.', '{"source": "kpn-docs", "priority": 1}'),
('professional', 'installation', 'Installation service process', 'When you add installation to your cart: 1) System calculates distance from your address to nearest professional. 2) Full cost breakdown shown (base fee + distance surcharge + materials + travel time). 3) You confirm booking. 4) Professional receives job details and arrives within the estimated window. 5) Job completed with digital signature and photo documentation.', '{"source": "kpn-docs", "priority": 2}'),
('professional', 'installation', 'Installation pricing', 'Installation fees are calculated based on: Professional''s base rate (set by professional), Distance from professional to your location (auto-calculated), Fuel costs (from KAUVEX Fuel Intelligence System), Travel time, Materials/consumables, and any complex job surcharges. The system always matches the nearest qualified professional first to minimize your cost.', '{"source": "kpn-docs", "priority": 2}'),

-- Country-specific
('platform', 'countries', 'Available countries', 'KAUVEX operates in 15 countries: Nigeria (NGN), United Kingdom (GBP), United States (USD), UAE (AED), India (INR), Australia (AUD), Germany (EUR), Canada (CAD), Ghana (GHS), Kenya (KES), South Africa (ZAR), Saudi Arabia (SAR), Brazil (BRL), Japan (JPY), and France (EUR). Each country has local pricing, payment methods, and logistics partners.', '{"source": "platform-docs", "priority": 1}'),

-- Logistics
('platform', 'logistics', 'KAUVEX Express courier', 'KAUVEX Express is our own courier service operating in Nigeria. Features: real-time tracking with GPS, same-day delivery within major cities, scheduled delivery windows, and carbon footprint tracking. International shipments use partner carriers (DHL, FedEx, Aramex).', '{"source": "logistics-docs", "priority": 2}'),
('platform', 'logistics', 'FBK — Fulfilled by KAUVEX', 'FBK (Fulfilled by KAUVEX) is our warehouse and fulfillment service. Vendors send stock to KAUVEX warehouses. We store, pick, pack, and ship orders. Benefits: faster delivery, Prime-style badge, easier returns handling. Fees: inbound handling, storage (monthly), pick & pack, and long-term surcharge after 180 days unsold.', '{"source": "logistics-docs", "priority": 2}'),

-- Industries
('industry', 'surveillance', 'Surveillance & CCTV on KAUVEX', 'KAUVEX offers a comprehensive range of surveillance products: IP cameras, analog cameras, NVRs/DVRs, cabling, mounts, and accessories. Top brands: Hikvision, Dahua, Bosch, Axis. Professional installation available through KPN installers nationwide.', '{"source": "industry-docs", "priority": 1}'),
('industry', 'marine', 'Marine & Boat Building on KAUVEX', 'KAUVEX serves the marine industry with boat engines (Yamaha, Mercury, Suzuki), marine accessories, navigation equipment, safety gear, and boat building services through KPN professionals. Custom boat configuration available through our Boat Configurator.', '{"source": "industry-docs", "priority": 1}'),
('industry', 'solar', 'Solar & Renewable Energy on KAUVEX', 'KAUVEX provides solar panels, inverters, batteries, charge controllers, and complete system design through our Solar Configurator. Professional installation available. We serve residential, commercial, and industrial customers across all 15 countries.', '{"source": "industry-docs", "priority": 1}'),
('industry', 'construction', 'Construction & Dredging on KAUVEX', 'KAUVEX''s construction and dredging marketplace includes heavy equipment, dredgers, excavators, construction materials, and professional services. Project Hub for large-scale project management with contractor bidding.', '{"source": "industry-docs", "priority": 1}'),
('industry', 'security', 'Security systems on KAUVEX', 'KAUVEX offers comprehensive security solutions: access control systems, biometric terminals, intruder alarms, fire detection systems, and integrated security management. Professional design and installation available.', '{"source": "industry-docs", "priority": 1}'),
('industry', 'kitchen', 'Kitchen equipment on KAUVEX', 'Commercial and residential kitchen equipment: cooking ranges, extraction hoods, refrigeration, preparation equipment, and complete kitchen design through our Kitchen Configurator.', '{"source": "industry-docs", "priority": 1}'),

-- Seller/Vendor Knowledge
('vendor', 'getting-started', 'Selling on KAUVEX', 'To sell on KAUVEX: 1) Register as a vendor. 2) Complete your store profile. 3) List your products (single or bulk CSV upload). 4) Set your shipping rules. 5) Start selling. Vendors can choose fulfillment by merchant or FBK (Fulfilled by KAUVEX). Commission rates vary by category.', '{"source": "vendor-docs", "priority": 1}'),
('vendor', 'analytics', 'Vendor analytics', 'Vendors have access to: Sales reports, customer analytics, product performance, advertising ROI, inventory levels, and account health metrics (ODR, cancellation rate, late shipment rate).', '{"source": "vendor-docs", "priority": 2}'),
('vendor', 'advertising', 'KAUVEX advertising', 'Vendors can promote products through: Sponsored Products (pay-per-click), Sponsored Brands (brand awareness), Display Ads (banner placements), and Deals & Coupons. Campaign creation wizard available in Seller Central.', '{"source": "vendor-docs", "priority": 2}');