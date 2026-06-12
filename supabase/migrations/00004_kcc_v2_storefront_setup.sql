-- ============================================================
-- KCC v2.0 — Multi-Storefront Setup (Domain, Theme, DNS, Mapping)
-- ============================================================

-- 1. STOREFRONT THEMES
CREATE TABLE IF NOT EXISTS public.storefront_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_name TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  colors JSONB DEFAULT '{"primary":"#0A1628","accent":"#FF6B00","background":"#F8F9FA","text":"#1A1A2E"}',
  fonts JSONB DEFAULT '{"heading":"Inter","body":"Inter"}',
  logo_url TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storefront_themes_storefront ON public.storefront_themes(storefront_id);

-- 2. STOREFRONT DOMAIN SETTINGS
CREATE TABLE IF NOT EXISTS public.storefront_domain_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  domain_type TEXT NOT NULL CHECK (domain_type IN ('tld','subdomain','custom')),
  dns_status TEXT DEFAULT 'pending' CHECK (dns_status IN ('pending','verifying','verified','failed')),
  dns_records JSONB DEFAULT '[]',
  verification_method TEXT,
  verification_value TEXT,
  verified_at TIMESTAMPTZ,
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending','provisioning','active','failed')),
  ssl_provisioned_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(storefront_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_storefront_domains_storefront ON public.storefront_domain_settings(storefront_id);
CREATE INDEX IF NOT EXISTS idx_storefront_domains_domain ON public.storefront_domain_settings(domain);

-- 3. STOREFRONT CATEGORY MAPPING
CREATE TABLE IF NOT EXISTS public.storefront_categories (
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (storefront_id, category_id)
);

-- 4. COUNTRY TLD CONFIGURATION
CREATE TABLE IF NOT EXISTS public.country_tlds (
  code TEXT PRIMARY KEY,
  tld TEXT NOT NULL,
  country_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  language_code TEXT DEFAULT 'en',
  flag_emoji TEXT,
  continent TEXT,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  default_tax_label TEXT DEFAULT 'VAT',
  tax_inclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

INSERT INTO public.country_tlds (code, tld, country_name, currency_code, currency_symbol, language_code, flag_emoji, continent, default_tax_rate, default_tax_label, tax_inclusive, sort_order) VALUES
  ('US', '.com', 'United States (Global)', 'USD', '$', 'en', '🇺🇸', 'North America', 0, 'Sales Tax', false, 1),
  ('GB', '.uk', 'United Kingdom', 'GBP', '£', 'en', '🇬🇧', 'Europe', 20, 'VAT', true, 2),
  ('CA', '.ca', 'Canada', 'CAD', 'CA$', 'en', '🇨🇦', 'North America', 13, 'HST', false, 3),
  ('AU', '.au', 'Australia', 'AUD', 'A$', 'en', '🇦🇺', 'Oceania', 10, 'GST', true, 4),
  ('NG', '.ng', 'Nigeria', 'NGN', '₦', 'en', '🇳🇬', 'Africa', 7.5, 'VAT', true, 5),
  ('DE', '.de', 'Germany', 'EUR', '€', 'de', '🇩🇪', 'Europe', 19, 'MwSt', true, 6),
  ('FR', '.fr', 'France', 'EUR', '€', 'fr', '🇫🇷', 'Europe', 20, 'TVA', true, 7),
  ('AE', '.ae', 'United Arab Emirates', 'AED', 'د.إ', 'ar', '🇦🇪', 'Asia', 5, 'VAT', true, 8),
  ('IN', '.in', 'India', 'INR', '₹', 'hi', '🇮🇳', 'Asia', 18, 'GST', true, 9),
  ('JP', '.jp', 'Japan', 'JPY', '¥', 'ja', '🇯🇵', 'Asia', 10, 'Consumption Tax', true, 10),
  ('CN', '.cn', 'China', 'CNY', '¥', 'zh', '🇨🇳', 'Asia', 13, 'VAT', true, 11),
  ('BR', '.br', 'Brazil', 'BRL', 'R$', 'pt', '🇧🇷', 'South America', 17, 'ICMS', true, 12),
  ('ZA', '.za', 'South Africa', 'ZAR', 'R', 'en', '🇿🇦', 'Africa', 15, 'VAT', true, 13),
  ('SG', '.sg', 'Singapore', 'SGD', 'S$', 'en', '🇸🇬', 'Asia', 9, 'GST', true, 14),
  ('HK', '.hk', 'Hong Kong', 'HKD', 'HK$', 'en', '🇭🇰', 'Asia', 0, 'N/A', false, 15),
  ('MY', '.my', 'Malaysia', 'MYR', 'RM', 'ms', '🇲🇾', 'Asia', 10, 'SST', true, 16),
  ('KR', '.kr', 'South Korea', 'KRW', '₩', 'ko', '🇰🇷', 'Asia', 10, 'VAT', true, 17),
  ('SA', '.sa', 'Saudi Arabia', 'SAR', '﷼', 'ar', '🇸🇦', 'Asia', 15, 'VAT', true, 18),
  ('EG', '.eg', 'Egypt', 'EGP', 'E£', 'ar', '🇪🇬', 'Africa', 14, 'VAT', true, 19),
  ('KE', '.ke', 'Kenya', 'KES', 'KSh', 'en', '🇰🇪', 'Africa', 16, 'VAT', true, 20),
  ('GH', '.gh', 'Ghana', 'GHS', 'GH₵', 'en', '🇬🇭', 'Africa', 12.5, 'VAT', true, 21)
ON CONFLICT (code) DO NOTHING;

-- 5. STOREFRONT SEED THEMES
INSERT INTO public.storefront_themes (storefront_id, name, template_name, is_default, is_active, config, colors, fonts) VALUES
  (NULL, 'Kauvex Default', 'default', true, true, 
   '{"layout":"full_width","product_card":"standard","header_style":"classic","footer_style":"detailed"}',
   '{"primary":"#0A1628","accent":"#FF6B00","background":"#F8F9FA","text":"#1A1A2E"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Kauvex Light', 'light', false, false,
   '{"layout":"full_width","product_card":"standard","header_style":"minimal","footer_style":"compact"}',
   '{"primary":"#FFFFFF","accent":"#FF6B00","background":"#FFFFFF","text":"#333333"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Kauvex Dark', 'dark', false, false,
   '{"layout":"full_width","product_card":"standard","header_style":"classic","footer_style":"detailed"}',
   '{"primary":"#1A1A2E","accent":"#FF6B00","background":"#0F0F1A","text":"#E0E0E0"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'B2B Pro', 'b2b', false, false,
   '{"layout":"contained","product_card":"list","header_style":"corporate","footer_style":"compact"}',
   '{"primary":"#003366","accent":"#00A3E0","background":"#F5F7FA","text":"#2D3748"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Marketplace Plus', 'marketplace', false, false,
   '{"layout":"full_width","product_card":"enhanced","header_style":"classic","footer_style":"detailed"}',
   '{"primary":"#0A1628","accent":"#FF6B00","background":"#FFFFFF","text":"#1A1A2E"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Minimal Store', 'minimal', false, false,
   '{"layout":"contained","product_card":"standard","header_style":"minimal","footer_style":"compact"}',
   '{"primary":"#2D3748","accent":"#4A5568","background":"#FFFFFF","text":"#1A202C"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Fashion Boutique', 'fashion', false, false,
   '{"layout":"full_width","product_card":"large_image","header_style":"centered","footer_style":"detailed"}',
   '{"primary":"#1A1A1A","accent":"#E91E63","background":"#FAFAFA","text":"#333333"}',
   '{"heading":"Playfair Display","body":"Inter"}'),
  (NULL, 'Electronics Hub', 'electronics', false, false,
   '{"layout":"full_width","product_card":"standard","header_style":"classic","footer_style":"detailed"}',
   '{"primary":"#0D1117","accent":"#58A6FF","background":"#F0F6FC","text":"#0D1117"}',
   '{"heading":"Inter","body":"Inter"}'),
  (NULL, 'Luxury', 'luxury', false, false,
   '{"layout":"contained","product_card":"elegant","header_style":"centered","footer_style":"minimal"}',
   '{"primary":"#1C1C1C","accent":"#C9A84C","background":"#FFFFFF","text":"#1C1C1C"}',
   '{"heading":"Playfair Display","body":"Lora"}')
ON CONFLICT DO NOTHING;

-- 6. ADD COLUMNS TO STOREFRONTS
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES public.storefront_themes(id);
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS ssl_status TEXT DEFAULT 'pending';
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_storefronts_theme ON public.storefronts(theme_id);
CREATE INDEX IF NOT EXISTS idx_storefronts_status ON public.storefronts(status);
CREATE INDEX IF NOT EXISTS idx_storefronts_country ON public.storefronts(country_code);

-- 8. RLS POLICIES
ALTER TABLE public.storefront_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_domain_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_tlds ENABLE ROW LEVEL SECURITY;

-- Admin full access on storefronts (main table)
DROP POLICY IF EXISTS "admin_all_storefronts" ON public.storefronts;
CREATE POLICY "admin_all_storefronts" ON public.storefronts FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin', 'store-manager', 'content-editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin', 'store-manager')
  )
);

-- Authenticated users can read storefronts
DROP POLICY IF EXISTS "auth_read_storefronts" ON public.storefronts;
CREATE POLICY "auth_read_storefronts" ON public.storefronts FOR SELECT
USING (auth.role() = 'authenticated');

-- Admin full access on new tables
CREATE POLICY "admin_all_storefront_themes" ON public.storefront_themes FOR ALL USING (
  auth.role() = 'authenticated' AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin', 'store-manager', 'content-editor')
  )
) WITH CHECK (true);

CREATE POLICY "admin_all_domain_settings" ON public.storefront_domain_settings FOR ALL USING (
  auth.role() = 'authenticated' AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin', 'store-manager')
  )
) WITH CHECK (true);

CREATE POLICY "admin_all_storefront_categories" ON public.storefront_categories FOR ALL USING (
  auth.role() = 'authenticated' AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin', 'store-manager')
  )
) WITH CHECK (true);

-- Public read for country_tlds
CREATE POLICY "public_read_country_tlds" ON public.country_tlds FOR SELECT USING (true);
