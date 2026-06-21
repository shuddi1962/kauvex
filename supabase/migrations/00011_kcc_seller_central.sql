-- Seller Central Full Replication (Phase 11)
-- Part 35: New tables for catalog gating, university, B2B, brand registry, A+ content, multi-channel

-- Restricted Categories (Gating)
CREATE TABLE IF NOT EXISTS kv_restricted_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID,
  brand_id UUID,
  category_name VARCHAR(200),
  brand_name VARCHAR(200),
  requires_approval BOOLEAN DEFAULT true,
  allowed_conditions TEXT[] DEFAULT '{}',
  required_docs TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restricted_categories_category ON kv_restricted_categories(category_id);
CREATE INDEX idx_restricted_categories_brand ON kv_restricted_categories(brand_id);

-- Approval Requests (for gated categories)
CREATE TABLE IF NOT EXISTS kv_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  restricted_cat_id UUID,
  category_name VARCHAR(200),
  brand_name VARCHAR(200),
  contact_email VARCHAR(200),
  documents JSONB DEFAULT '[]',
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_requests_vendor ON kv_approval_requests(vendor_id);
CREATE INDEX idx_approval_requests_status ON kv_approval_requests(status);

-- University Lessons
CREATE TABLE IF NOT EXISTS kv_university_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  description TEXT,
  category VARCHAR(100),
  content_type VARCHAR(20),
  content_url TEXT,
  content_body TEXT,
  duration_minutes INT,
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_university_lessons_category ON kv_university_lessons(category);
CREATE INDEX idx_university_lessons_status ON kv_university_lessons(status);

-- University Progress
CREATE TABLE IF NOT EXISTS kv_university_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES kv_university_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_user_id, lesson_id)
);

CREATE INDEX idx_university_progress_vendor ON kv_university_progress(vendor_user_id);

-- Business Customers
CREATE TABLE IF NOT EXISTS kv_business_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL,
  company_name VARCHAR(200),
  tax_id VARCHAR(100),
  business_type VARCHAR(100),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B2B Volume Tiers (per-product volume discounts)
CREATE TABLE IF NOT EXISTS kv_b2b_volume_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  min_quantity INT NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_volume_tiers_product ON kv_b2b_volume_tiers(product_id);
CREATE INDEX idx_b2b_volume_tiers_vendor ON kv_b2b_volume_tiers(vendor_id);

-- Brand Registry
CREATE TABLE IF NOT EXISTS kv_brand_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  brand_name VARCHAR(200) UNIQUE NOT NULL,
  trademark_number VARCHAR(100),
  trademark_country VARCHAR(100),
  trademark_doc_url TEXT,
  brand_website TEXT,
  product_images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_registry_vendor ON kv_brand_registry(vendor_id);
CREATE INDEX idx_brand_registry_status ON kv_brand_registry(status);

-- Brand Authorized Sellers
CREATE TABLE IF NOT EXISTS kv_brand_authorized_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES kv_brand_registry(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,
  authorized_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_authorized_sellers_brand ON kv_brand_authorized_sellers(brand_id);

-- Counterfeit Reports
CREATE TABLE IF NOT EXISTS kv_counterfeit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES kv_brand_registry(id) ON DELETE CASCADE,
  reported_product_id UUID,
  reported_vendor_id UUID,
  reporter_vendor_id UUID,
  evidence JSONB DEFAULT '[]',
  description TEXT,
  status VARCHAR(20) DEFAULT 'open',
  admin_decision VARCHAR(50),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_counterfeit_reports_brand ON kv_counterfeit_reports(brand_id);
CREATE INDEX idx_counterfeit_reports_status ON kv_counterfeit_reports(status);

-- A+ Content
CREATE TABLE IF NOT EXISTS kv_aplus_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  brand_id UUID REFERENCES kv_brand_registry(id),
  title VARCHAR(200),
  modules JSONB DEFAULT '[]',
  applied_product_ids UUID[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aplus_content_vendor ON kv_aplus_content(vendor_id);
CREATE INDEX idx_aplus_content_brand ON kv_aplus_content(brand_id);

-- Multi-Channel Product Sync
CREATE TABLE IF NOT EXISTS kv_channel_product_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  kauvex_product_id UUID NOT NULL,
  channel VARCHAR(30) NOT NULL,
  channel_listing_id VARCHAR(200),
  sync_inventory BOOLEAN DEFAULT true,
  sync_price BOOLEAN DEFAULT true,
  channel_specific_price DECIMAL(12,2),
  last_synced TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, kauvex_product_id, channel)
);

CREATE INDEX idx_channel_product_sync_vendor ON kv_channel_product_sync(vendor_id);
CREATE INDEX idx_channel_product_sync_channel ON kv_channel_product_sync(channel);

-- Business B2B Quotes table (extends existing b2b_quotes with vendor-facing features)
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS vendor_response_notes TEXT;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS quoted_moq INT;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS lead_time_days INT;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
