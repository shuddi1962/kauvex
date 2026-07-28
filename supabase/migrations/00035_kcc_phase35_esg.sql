-- PHASE 35: ESG — SUSTAINABILITY SCORING

CREATE TABLE IF NOT EXISTS kv_esg_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  product_id UUID,
  score DECIMAL(4,1) NOT NULL,
  max_score INT DEFAULT 100,
  packaging_score DECIMAL(4,1),
  carbon_score DECIMAL(4,1),
  materials_score DECIMAL(4,1),
  labor_score DECIMAL(4,1),
  energy_score DECIMAL(4,1),
  water_score DECIMAL(4,1),
  waste_score DECIMAL(4,1),
  data JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kv_esg_vendor ON kv_esg_scores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_kv_esg_product ON kv_esg_scores(product_id);
CREATE INDEX IF NOT EXISTS idx_kv_esg_score ON kv_esg_scores(score);

-- Add status column to existing carbon_offsets table
ALTER TABLE carbon_offsets ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Enable RLS
ALTER TABLE kv_esg_scores ENABLE ROW LEVEL SECURITY;

-- Public read for scores
CREATE POLICY "Public read scores" ON kv_esg_scores
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin all scores" ON kv_esg_scores
  FOR ALL USING (auth.role() = 'service_role');