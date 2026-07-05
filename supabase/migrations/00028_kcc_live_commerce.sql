-- ============================================================
-- Phase 28: Live Commerce - Complete Tables & Fixes
-- ============================================================
-- Adds missing tables: live_comments, live_gifts, live_analytics
-- Adds proper FK relations and indexes
-- ============================================================

-- 1. LIVE COMMENTS
CREATE TABLE IF NOT EXISTS live_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_comments_stream ON live_comments(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_comments_created ON live_comments(created_at DESC);

-- Enable RLS
ALTER TABLE live_comments ENABLE ROW LEVEL SECURITY;

-- 2. LIVE GIFTS
CREATE TABLE IF NOT EXISTS live_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID,
  gift_type TEXT,
  gift_value DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_gifts_stream ON live_gifts(stream_id);

-- Enable RLS
ALTER TABLE live_gifts ENABLE ROW LEVEL SECURITY;

-- 3. LIVE ANALYTICS
CREATE TABLE IF NOT EXISTS live_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  peak_viewers INT DEFAULT 0,
  total_viewers INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_analytics_stream ON live_analytics(stream_id);

-- Enable RLS
ALTER TABLE live_analytics ENABLE ROW LEVEL SECURITY;

-- 4. Add thumbnail_url and stream_url columns to live_streams if missing
ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS stream_url TEXT,
  ADD COLUMN IF NOT EXISTS recording_url TEXT,
  ADD COLUMN IF NOT EXISTS total_likes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(14, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT TRUE;

-- 5. RLS Policies
-- Live comments: anyone can read, authenticated users can insert
CREATE POLICY "Anyone can read live comments"
  ON live_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON live_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Live gifts: anyone can read, authenticated users can send
CREATE POLICY "Anyone can read live gifts"
  ON live_gifts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send gifts"
  ON live_gifts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Live analytics: vendors and admins can read
CREATE POLICY "Vendors and admins can read analytics"
  ON live_analytics FOR SELECT
  USING (auth.role() IN ('authenticated'));

-- 6. Live streams RLS policies
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live streams"
  ON live_streams FOR SELECT
  USING (true);

CREATE POLICY "Vendors can create streams"
  ON live_streams FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Vendors can update own streams"
  ON live_streams FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Live stream products RLS
ALTER TABLE live_stream_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stream products"
  ON live_stream_products FOR SELECT
  USING (true);

CREATE POLICY "Vendors can manage stream products"
  ON live_stream_products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
