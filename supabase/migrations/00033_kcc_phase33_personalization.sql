CREATE TABLE IF NOT EXISTS kv_pers_user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  product_id UUID,
  category_id UUID,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kv_pers_user_events_user ON kv_pers_user_events(user_id);
CREATE INDEX idx_kv_pers_user_events_type ON kv_pers_user_events(event_type);
CREATE INDEX idx_kv_pers_user_events_product ON kv_pers_user_events(product_id);
CREATE INDEX idx_kv_pers_user_events_created ON kv_pers_user_events(created_at);

CREATE TABLE IF NOT EXISTS kv_pers_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rec_type VARCHAR(30) NOT NULL,
  product_id UUID NOT NULL,
  score DECIMAL(5,3) NOT NULL,
  reason VARCHAR(100),
  is_served BOOLEAN DEFAULT false,
  is_clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kv_pers_recs_user ON kv_pers_recommendations(user_id);
CREATE INDEX idx_kv_pers_recs_type ON kv_pers_recommendations(rec_type);

CREATE TABLE IF NOT EXISTS kv_pers_user_affinities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  affinity_score DECIMAL(5,3) DEFAULT 0,
  interaction_count INT DEFAULT 0,
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_kv_pers_affinities_user ON kv_pers_user_affinities(user_id);
