-- Kauvex Brand System Tables (Phase 17)
-- Brand asset management, violation tracking, brand compliance

-- Brand Assets
CREATE TABLE IF NOT EXISTS kv_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type VARCHAR(50) NOT NULL,
  sub_brand VARCHAR(50) NOT NULL DEFAULT 'kauvex',
  name VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_format VARCHAR(20),
  version VARCHAR(20) DEFAULT '1.0',
  is_partner_accessible BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Asset Downloads
CREATE TABLE IF NOT EXISTS kv_brand_asset_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES kv_brand_assets(id) ON DELETE CASCADE,
  downloaded_by UUID,
  downloader_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Violations
CREATE TABLE IF NOT EXISTS kv_brand_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID,
  violation_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  offending_url TEXT,
  entity_type VARCHAR(30),
  entity_id UUID,
  status VARCHAR(20) DEFAULT 'open',
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kv_brand_assets_type ON kv_brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_kv_brand_assets_sub_brand ON kv_brand_assets(sub_brand);
CREATE INDEX IF NOT EXISTS idx_kv_brand_assets_partner ON kv_brand_assets(is_partner_accessible);
CREATE INDEX IF NOT EXISTS idx_kv_brand_violations_status ON kv_brand_violations(status);
CREATE INDEX IF NOT EXISTS idx_kv_brand_violations_type ON kv_brand_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_kv_brand_asset_downloads_asset ON kv_brand_asset_downloads(asset_id);

-- Seed brand assets
INSERT INTO kv_brand_assets (asset_type, sub_brand, name, description, file_url, file_format, version, is_partner_accessible, is_public) VALUES
('logo', 'kauvex', 'Primary Logo (Navy + White)', 'Use on white or light backgrounds', '/brand-assets/logos/primary-navy-white.svg', 'svg', '1.0', true, true),
('logo', 'kauvex', 'Reversed Logo (White + Orange)', 'Use on navy or dark backgrounds', '/brand-assets/logos/reversed-white-orange.svg', 'svg', '1.0', true, true),
('logo', 'kauvex', 'Monochrome Dark', 'Single-color navy for print', '/brand-assets/logos/monochrome-dark.svg', 'svg', '1.0', false, false),
('logo', 'kauvex', 'Monochrome Light', 'Single-color white for dark backgrounds', '/brand-assets/logos/monochrome-light.svg', 'svg', '1.0', false, false),
('logo', 'kauvex', 'Icon Mark', 'K icon with orange dot for small spaces', '/brand-assets/logos/icon-mark-navy.svg', 'svg', '1.0', true, true),
('logo', 'kauvex', 'Favicon 16x16', 'Orange dot on navy square', '/brand-assets/logos/favicon-16.png', 'png', '1.0', false, true),
('logo', 'kauvex', 'Favicon 32x32', 'K letter on navy square', '/brand-assets/logos/favicon-32.png', 'png', '1.0', false, true),
('logo', 'kauvex', 'App Icon 512x512', 'Full app icon treatment', '/brand-assets/logos/app-icon-512.png', 'png', '1.0', false, true),
('logo', 'express', 'Express Sub-brand Logo', 'Kauvex Express logo with orange accent', '/brand-assets/sub-brands/express/logo.svg', 'svg', '1.0', false, false),
('logo', 'logistics', 'Logistics Sub-brand Logo', 'Kauvex Logistics logo with navy accent', '/brand-assets/sub-brands/logistics/logo.svg', 'svg', '1.0', false, false),
('logo', 'fbk', 'FBK Sub-brand Logo', 'Kauvex FBK logo with green accent', '/brand-assets/sub-brands/fbk/logo.svg', 'svg', '1.0', false, false),
('logo', 'pay', 'Pay Sub-brand Logo', 'Kauvex Pay logo with gold accent', '/brand-assets/sub-brands/pay/logo.svg', 'svg', '1.0', false, false),
('logo', 'live', 'Live Sub-brand Logo', 'Kauvex Live logo with red accent', '/brand-assets/sub-brands/live/logo.svg', 'svg', '1.0', false, false),
('logo', 'partners', 'Partners Sub-brand Logo', 'Kauvex Partners logo with purple accent', '/brand-assets/sub-brands/partners/logo.svg', 'svg', '1.0', false, false),
('guideline', 'kauvex', 'Brand Guidelines v1.0', 'Complete brand guidelines PDF', '/brand-assets/guidelines/kauvex-brand-guidelines-v1.pdf', 'pdf', '1.0', false, false),
('template', 'kauvex', 'Email Master Template', 'HTML email master template', '/brand-assets/templates/email/master.html', 'html', '1.0', false, false),
('social', 'kauvex', 'Social Media Banner Kit', 'Templates for all social platforms', '/brand-assets/templates/social-media/banner-kit.zip', 'zip', '1.0', true, false),
('badge', 'kauvex', 'Available on Kauvex Badge — Small', '120x40px for sidebar/widget placement', '/brand-assets/badges/available-small.png', 'png', '1.0', true, true),
('badge', 'kauvex', 'Available on Kauvex Badge — Medium', '240x80px for blog posts and websites', '/brand-assets/badges/available-medium.png', 'png', '1.0', true, true),
('badge', 'kauvex', 'Kauvex Affiliate Partner Badge', 'Official affiliate partner badge', '/brand-assets/badges/affiliate-partner.png', 'png', '1.0', true, true);
