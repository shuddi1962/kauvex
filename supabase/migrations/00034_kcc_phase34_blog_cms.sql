-- PHASE 34: BLOG/CONTENT CMS
-- Adds blog post and category tables

CREATE TABLE IF NOT EXISTS kv_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  author VARCHAR(100) NOT NULL DEFAULT 'KAUVEX Team',
  author_role VARCHAR(100),
  cover_image VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  read_time VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_kv_blog_published ON kv_blog_posts(published, published_at);
CREATE INDEX IF NOT EXISTS idx_kv_blog_category ON kv_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_kv_blog_slug ON kv_blog_posts(slug);

CREATE TABLE IF NOT EXISTS kv_blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default categories
INSERT INTO kv_blog_categories (name, slug, description, sort_order) VALUES
  ('Industry Insights', 'industry-insights', 'Trends, analysis and market research', 1),
  ('Seller Guide', 'seller-guide', 'Tips and guides for Kauvex sellers', 2),
  ('Buyer Guide', 'buyer-guide', 'Shopping tips and product guides', 3),
  ('Product Reviews', 'product-reviews', 'Honest reviews of popular products', 4),
  ('Company News', 'company-news', 'Kauvex announcements and updates', 5),
  ('Tech & Innovation', 'tech-innovation', 'Technology trends and innovations', 6),
  ('Express', 'express', 'Kauvex Express courier updates', 7)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE kv_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_blog_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public read published posts" ON kv_blog_posts
  FOR SELECT USING (published = true);

-- Admin full access
CREATE POLICY "Admin all access posts" ON kv_blog_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Public read categories
CREATE POLICY "Public read categories" ON kv_blog_categories
  FOR SELECT USING (true);

-- Admin full access categories
CREATE POLICY "Admin all access categories" ON kv_blog_categories
  FOR ALL USING (auth.role() = 'service_role');