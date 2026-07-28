CREATE TABLE IF NOT EXISTS kv_community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kv_community_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES kv_community_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kv_community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES kv_community_topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kv_community_topics_category ON kv_community_topics(category_id);
CREATE INDEX idx_kv_community_topics_author ON kv_community_topics(author_id);
CREATE INDEX idx_kv_community_replies_topic ON kv_community_replies(topic_id);

INSERT INTO kv_community_categories (name, slug, description, icon, sort_order) VALUES
  ('Getting Started', 'getting-started', 'New to selling on Kauvex? Start here.', 'rocket', 1),
  ('Product & Listings', 'product-listings', 'Tips for product photography, descriptions, and pricing.', 'package', 2),
  ('Marketing & Growth', 'marketing-growth', 'Discuss marketing strategies, ads, and social media.', 'trending-up', 3),
  ('Shipping & Fulfillment', 'shipping-fulfillment', 'FBK, carrier questions, and logistics tips.', 'truck', 4),
  ('Kauvex Pay & Finances', 'kauvex-pay-finances', 'Payments, payouts, BNPL, and accounting.', 'credit-card', 5),
  ('Feedback & Ideas', 'feedback-ideas', 'Suggest new features and improvements.', 'lightbulb', 6)
ON CONFLICT (slug) DO NOTHING;