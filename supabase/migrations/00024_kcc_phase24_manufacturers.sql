-- Phase 24: Global Manufacturer Portal
-- 10 new tables for manufacturer B2B sourcing marketplace

CREATE TABLE kv_mfg_manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  city VARCHAR(100),
  manufacturing_hub VARCHAR(100),
  registration_number VARCHAR(100),
  business_type VARCHAR(30) DEFAULT 'manufacturer',
  year_established INT,
  employee_count_range VARCHAR(30),
  factory_size_sqm INT,
  website TEXT,
  verification_tier VARCHAR(30) DEFAULT 'unverified',
  trust_score INT DEFAULT 0,
  response_rate DECIMAL(5,2),
  avg_response_time_hours DECIMAL(6,2),
  total_orders_completed INT DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_manufacturers_country ON kv_mfg_manufacturers(country_code);
CREATE INDEX idx_kv_mfg_manufacturers_status ON kv_mfg_manufacturers(status);
CREATE INDEX idx_kv_mfg_manufacturers_verification ON kv_mfg_manufacturers(verification_tier);
CREATE INDEX idx_kv_mfg_manufacturers_slug ON kv_mfg_manufacturers(slug);

CREATE TABLE kv_mfg_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  product_types TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_categories_manufacturer ON kv_mfg_categories(manufacturer_id);
CREATE INDEX idx_kv_mfg_categories_category ON kv_mfg_categories(category);

CREATE TABLE kv_mfg_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id) ON DELETE CASCADE,
  certification_type VARCHAR(100) NOT NULL,
  certificate_url TEXT,
  issued_by VARCHAR(200),
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_certifications_manufacturer ON kv_mfg_certifications(manufacturer_id);

CREATE TABLE kv_mfg_capability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id) ON DELETE CASCADE,
  monthly_capacity INT,
  capacity_unit VARCHAR(50),
  current_utilization_percent DECIMAL(5,2),
  default_moq INT,
  default_lead_time_days INT,
  sample_lead_time_days INT,
  allows_private_label BOOLEAN DEFAULT false,
  allows_custom_packaging BOOLEAN DEFAULT false,
  allows_oem BOOLEAN DEFAULT false,
  allows_odm BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_capability_manufacturer ON kv_mfg_capability(manufacturer_id);

CREATE TABLE kv_mfg_factory_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  caption VARCHAR(300),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_factory_media_manufacturer ON kv_mfg_factory_media(manufacturer_id);

CREATE TABLE kv_mfg_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id),
  buyer_id UUID,
  buyer_type VARCHAR(20) DEFAULT 'vendor',
  product_description TEXT NOT NULL,
  reference_images TEXT[],
  desired_quantity INT,
  customization_details TEXT,
  target_price DECIMAL(14,2),
  destination_country VARCHAR(10),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_inquiries_manufacturer ON kv_mfg_inquiries(manufacturer_id);
CREATE INDEX idx_kv_mfg_inquiries_buyer ON kv_mfg_inquiries(buyer_id);
CREATE INDEX idx_kv_mfg_inquiries_status ON kv_mfg_inquiries(status);

CREATE TABLE kv_mfg_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES kv_mfg_inquiries(id),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id),
  pricing_tiers JSONB,
  moq INT,
  lead_time_days INT,
  sample_cost DECIMAL(10,2),
  sample_available BOOLEAN DEFAULT true,
  payment_terms TEXT,
  incoterm VARCHAR(10),
  valid_until DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_quotes_inquiry ON kv_mfg_quotes(inquiry_id);
CREATE INDEX idx_kv_mfg_quotes_manufacturer ON kv_mfg_quotes(manufacturer_id);
CREATE INDEX idx_kv_mfg_quotes_status ON kv_mfg_quotes(status);

CREATE TABLE kv_mfg_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(30) UNIQUE,
  quote_id UUID REFERENCES kv_mfg_quotes(id),
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id),
  buyer_id UUID NOT NULL,
  total_value DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'USD',
  deposit_percent DECIMAL(5,2) DEFAULT 30,
  milestone_structure JSONB,
  current_stage VARCHAR(30) DEFAULT 'confirmed',
  production_photos JSONB,
  inspection_requested BOOLEAN DEFAULT false,
  inspection_partner VARCHAR(50),
  inspection_result VARCHAR(20),
  inspection_report_url TEXT,
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_orders_manufacturer ON kv_mfg_orders(manufacturer_id);
CREATE INDEX idx_kv_mfg_orders_buyer ON kv_mfg_orders(buyer_id);
CREATE INDEX idx_kv_mfg_orders_status ON kv_mfg_orders(status);
CREATE INDEX idx_kv_mfg_orders_order_number ON kv_mfg_orders(order_number);

CREATE TABLE kv_mfg_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES kv_mfg_orders(id),
  total_amount DECIMAL(14,2) NOT NULL,
  deposited_amount DECIMAL(14,2) DEFAULT 0,
  released_amount DECIMAL(14,2) DEFAULT 0,
  milestone_releases JSONB,
  status VARCHAR(20) DEFAULT 'funded',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_escrow_order ON kv_mfg_escrow(order_id);
CREATE INDEX idx_kv_mfg_escrow_status ON kv_mfg_escrow(status);

CREATE TABLE kv_mfg_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES kv_mfg_orders(id),
  raised_by UUID NOT NULL,
  dispute_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  resolution VARCHAR(30),
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_disputes_order ON kv_mfg_disputes(order_id);
CREATE INDEX idx_kv_mfg_disputes_status ON kv_mfg_disputes(resolution);

CREATE TABLE kv_mfg_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID,
  manufacturer_id UUID NOT NULL REFERENCES kv_mfg_manufacturers(id),
  buyer_id UUID NOT NULL,
  product_description TEXT,
  sample_cost DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  shipment_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_samples_manufacturer ON kv_mfg_samples(manufacturer_id);
CREATE INDEX idx_kv_mfg_samples_buyer ON kv_mfg_samples(buyer_id);

CREATE TABLE kv_mfg_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  hub_name VARCHAR(200) NOT NULL,
  primary_categories TEXT[],
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_mfg_hubs_country ON kv_mfg_hubs(country_code);

-- Seed data: Manufacturing Hubs (31 hubs across 13 countries)
INSERT INTO kv_mfg_hubs (country_code, city, hub_name, primary_categories, description) VALUES
('CN', 'Shenzhen', 'Shenzhen Electronics Hub', ARRAY['Electronics & Hardware', 'IoT Device Manufacturing'], 'Global electronics capital - PCB assembly, consumer electronics, cables, batteries'),
('CN', 'Guangzhou', 'Guangzhou General Manufacturing', ARRAY['Textiles & Apparel', 'Plastics & Packaging', 'Home Goods & Textiles'], 'Major general manufacturing center for apparel, plastics, and consumer goods'),
('CN', 'Yiwu', 'Yiwu Small Commodities', ARRAY['Custom/Promotional Products', 'Toys & Children''s Products', 'Jewelry & Accessories'], 'World''s largest small commodities market - promotional items, toys, accessories'),
('CN', 'Foshan', 'Foshan Furniture & Ceramics', ARRAY['Furniture & Woodwork', 'Construction & Building Materials'], 'Furniture and ceramics manufacturing capital'),
('CN', 'Dongguan', 'Dongguan Plastics & Toys', ARRAY['Toys & Children''s Products', 'Plastics & Packaging'], 'Major hub for toys and plastics manufacturing'),
('NG', 'Aba', 'Aba Textiles & Leather', ARRAY['Textiles & Apparel', 'Footwear & Leather'], 'Nigeria''s textile and leather manufacturing capital'),
('NG', 'Kano', 'Kano Textiles & Agro-Processing', ARRAY['Textiles & Apparel', 'Agricultural Processing'], 'Northern Nigeria''s industrial center for textiles and food processing'),
('NG', 'Lagos', 'Lagos General Manufacturing', ARRAY['Plastics & Packaging', 'Food & Beverage Processing', 'Cosmetics & Personal Care'], 'Nigeria''s commercial capital with diverse manufacturing'),
('NG', 'Onitsha', 'Onitsha General Goods', ARRAY['Metal Works & Fabrication', 'Plastics & Packaging'], 'Major market for general goods manufacturing'),
('IN', 'Tiruppur', 'Tiruppur Textiles & Knitwear', ARRAY['Textiles & Apparel'], 'India''s knitwear capital - major global exporter'),
('IN', 'Surat', 'Surat Textiles & Diamonds', ARRAY['Textiles & Apparel', 'Jewelry & Accessories'], 'Major textile and diamond cutting center'),
('IN', 'Delhi NCR', 'Delhi NCR General Manufacturing', ARRAY['Electronics & Hardware', 'Automotive & Parts', 'Custom/Promotional Products'], 'India''s NCR region - diverse manufacturing hub'),
('IN', 'Mumbai', 'Mumbai Pharma & Chemicals', ARRAY['Pharmaceuticals & Supplements', 'Cosmetics & Personal Care'], 'India''s pharmaceutical and chemical manufacturing center'),
('IN', 'Jaipur', 'Jaipur Jewelry & Crafts', ARRAY['Jewelry & Accessories', 'Home Goods & Textiles'], 'Traditional jewelry and handicraft manufacturing'),
('VN', 'Ho Chi Minh City', 'HCMC Apparel & Footwear', ARRAY['Textiles & Apparel', 'Footwear & Leather'], 'Vietnam''s major manufacturing center for apparel and footwear'),
('VN', 'Hanoi', 'Hanoi Electronics', ARRAY['Electronics & Hardware'], 'Emerging electronics manufacturing hub'),
('BD', 'Dhaka', 'Dhaka Apparel Manufacturing', ARRAY['Textiles & Apparel'], 'Major global apparel manufacturing hub'),
('BD', 'Chittagong', 'Chittagong Textiles', ARRAY['Textiles & Apparel'], 'Bangladesh''s second major apparel center'),
('TR', 'Istanbul', 'Istanbul Textiles & Apparel', ARRAY['Textiles & Apparel', 'Home Goods & Textiles'], 'Turkey''s manufacturing hub - strong European market access'),
('PK', 'Sialkot', 'Sialkot Sports & Surgical', ARRAY['Custom/Promotional Products', 'Toys & Children''s Products'], 'Global sporting goods and surgical instruments hub'),
('PK', 'Faisalabad', 'Faisalabad Textiles', ARRAY['Textiles & Apparel'], 'Pakistan''s textile manufacturing capital'),
('EG', 'Cairo', 'Cairo Manufacturing', ARRAY['Textiles & Apparel', 'Food & Beverage Processing'], 'Egypt''s industrial center - growing African hub'),
('EG', 'Alexandria', 'Alexandria Manufacturing', ARRAY['Textiles & Apparel', 'Agricultural Processing'], 'Major port city with diverse manufacturing'),
('ET', 'Addis Ababa', 'Addis Ababa Apparel & Leather', ARRAY['Textiles & Apparel', 'Footwear & Leather'], 'Ethiopia''s emerging low-cost manufacturing hub'),
('MX', 'Tijuana', 'Tijuana Electronics & Automotive', ARRAY['Electronics & Hardware', 'Automotive & Parts'], 'Nearshoring hub for USA market - electronics and automotive'),
('MX', 'Monterrey', 'Monterrey Industrial Manufacturing', ARRAY['Automotive & Parts', 'Metal Works & Fabrication'], 'Mexico''s industrial capital - automotive and metals'),
('US', 'Domestic', 'Made in USA', ARRAY['Electronics & Hardware', 'Furniture & Woodwork', 'Food & Beverage Processing'], 'Domestic US manufacturing for Made in USA demand'),
('GB', 'Domestic', 'Made in UK', ARRAY['Textiles & Apparel', 'Electronics & Hardware', 'Food & Beverage Processing'], 'UK domestic manufacturing for local sourcing demand'),
('PL', 'Domestic', 'Poland Nearshoring Hub', ARRAY['Textiles & Apparel', 'Electronics & Hardware', 'Furniture & Woodwork'], 'EU nearshoring hub for manufacturing demand'),
('RO', 'Domestic', 'Romania Nearshoring Hub', ARRAY['Textiles & Apparel', 'Electronics & Hardware', 'Footwear & Leather'], 'EU nearshoring hub for manufacturing demand');
