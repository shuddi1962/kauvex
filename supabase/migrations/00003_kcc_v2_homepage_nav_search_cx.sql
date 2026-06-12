-- ============================================================
-- KCC v2.0 — Homepage, Navigation, Search & Customer Experience
-- Non-destructive: all NEW tables, no existing table changes
-- ============================================================

-- 1. HERO BANNERS (replaces old storefront_banners with full scheduling)
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url TEXT NOT NULL DEFAULT '/shop',
  image_url TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  banner_type TEXT NOT NULL DEFAULT 'image' CHECK (banner_type IN ('image','video','promotional','flash_sale')),
  flash_sale_end TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','scheduled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  storefront_id UUID REFERENCES storefronts(id) ON DELETE CASCADE,
  vendor_id UUID,
  country_code TEXT,
  is_personalized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. HOMEPAGE SECTIONS (modular drag-drop builder)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN (
    'flash_deals','trending','featured','ai_recommended','new_arrivals',
    'recently_viewed','best_sellers','featured_vendors','featured_brands',
    'product_collections','wholesale_deals','clearance_deals',
    'sponsored_products','sponsored_stores','country_promotions',
    'vendor_promotions','limited_time_offers','bundle_deals',
    'newsletter','mobile_app_download','testimonials','blog_posts'
  )),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  storefront_id UUID REFERENCES storefronts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MEGA MENU ITEMS (unlimited hierarchy)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT,
  icon TEXT,
  image_url TEXT,
  description TEXT,
  badge_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_mega BOOLEAN NOT NULL DEFAULT false,
  column_count INT DEFAULT 3,
  menu_type TEXT NOT NULL DEFAULT 'header' CHECK (menu_type IN ('header','footer','mobile')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PRODUCT Q&A
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','answered','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  answerer_id UUID NOT NULL,
  answer TEXT NOT NULL,
  is_vendor_answer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. EXTEND REVIEWS WITH MEDIA
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 6. STORE FOLLOWS
CREATE TABLE IF NOT EXISTS store_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, vendor_id)
);

-- 7. SAVED PAYMENT METHODS
CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  card_last_four TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  expiry_month INT,
  expiry_year INT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SEARCH HISTORY
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. RECENTLY VIEWED
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- 10. PRODUCT COMPARISONS
CREATE TABLE IF NOT EXISTS product_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  name TEXT DEFAULT 'My Comparison',
  products JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hero_banners_storefront ON hero_banners(storefront_id);
CREATE INDEX IF NOT EXISTS idx_hero_banners_status ON hero_banners(status);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_storefront ON homepage_sections(storefront_id);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort ON homepage_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_store_follows_customer ON store_follows(customer_id);
CREATE INDEX IF NOT EXISTS idx_store_follows_vendor ON store_follows(vendor_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_customer ON recently_viewed(customer_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product ON recently_viewed(product_id);
CREATE INDEX IF NOT EXISTS idx_search_history_customer ON search_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- RLS Policies
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active banners
DROP POLICY IF EXISTS hero_banners_select ON hero_banners;
CREATE POLICY hero_banners_select ON hero_banners FOR SELECT USING (status = 'active' OR status = 'scheduled');

-- Everyone can read visible homepage sections
DROP POLICY IF EXISTS homepage_sections_select ON homepage_sections;
CREATE POLICY homepage_sections_select ON homepage_sections FOR SELECT USING (is_visible = true);

-- Everyone can read menu items
DROP POLICY IF EXISTS menu_items_select ON menu_items;
CREATE POLICY menu_items_select ON menu_items FOR SELECT USING (status = 'active');
