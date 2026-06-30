-- KCC Phase 24 Migration: Manufacturer Reviews + Schema Fixes
-- Adds MfgReview table, production_timeline, inspection_status, responded_at fields

-- 1. Add missing columns to kv_mfg_inquiries
ALTER TABLE kv_mfg_inquiries
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- 2. Add missing columns to kv_mfg_orders
ALTER TABLE kv_mfg_orders
  ADD COLUMN IF NOT EXISTS production_timeline JSONB,
  ADD COLUMN IF NOT EXISTS inspection_status VARCHAR(20);

-- 3. Create MfgReview table
CREATE TABLE IF NOT EXISTS kv_mfg_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES kv_mfg_orders(id),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id),
  buyer_id UUID NOT NULL,
  buyer_name VARCHAR(200),
  buyer_country VARCHAR(10),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  product_type VARCHAR(200),
  order_value DECIMAL(14,2),
  helpful INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for MfgReview
CREATE INDEX IF NOT EXISTS idx_kv_mfg_reviews_manufacturer ON kv_mfg_reviews(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_kv_mfg_reviews_buyer ON kv_mfg_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_kv_mfg_reviews_rating ON kv_mfg_reviews(rating);
