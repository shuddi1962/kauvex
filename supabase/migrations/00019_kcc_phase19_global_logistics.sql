-- ============================================================
-- PHASE 19: GLOBAL LOGISTICS NETWORK (GLX)
-- Migration: 00019_kcc_phase19_global_logistics.sql
-- ============================================================

-- GLOBAL COUNTRY CONFIGURATION
CREATE TABLE IF NOT EXISTS kv_glx_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  continent VARCHAR(30),
  currency_code VARCHAR(10) NOT NULL,
  currency_symbol VARCHAR(10),
  language_code VARCHAR(10) DEFAULT 'en',
  is_rtl BOOLEAN DEFAULT false,
  tier1_radius_km INT DEFAULT 60,
  timezone VARCHAR(50),
  vat_rate DECIMAL(5,2) DEFAULT 0,
  import_duty_general DECIMAL(5,2) DEFAULT 0,
  de_minimis_value DECIMAL(10,2) DEFAULT 0,
  de_minimis_currency VARCHAR(10),
  cod_available BOOLEAN DEFAULT false,
  cod_limit DECIMAL(10,2),
  sunday_delivery BOOLEAN DEFAULT true,
  friday_delivery BOOLEAN DEFAULT true,
  gig_worker_classification VARCHAR(20) DEFAULT 'contractor',
  legal_review_status VARCHAR(20) DEFAULT 'pending',
  is_live BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- COUNTRY CARRIER CONFIGURATIONS
CREATE TABLE IF NOT EXISTS kv_glx_country_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  carrier_code VARCHAR(50) NOT NULL,
  carrier_name VARCHAR(100) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  api_endpoint VARCHAR(500),
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  account_number VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT true,
  last_tested TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_carriers_country ON kv_glx_country_carriers(country_code);
CREATE INDEX idx_kv_glx_carriers_tier ON kv_glx_country_carriers(tier);

-- MULTI-CURRENCY RATE CARDS
CREATE TABLE IF NOT EXISTS kv_glx_rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  origin_zone VARCHAR(100),
  destination_zone VARCHAR(100),
  weight_min_kg DECIMAL(10,3) DEFAULT 0,
  weight_max_kg DECIMAL(10,3) DEFAULT 999,
  base_rate DECIMAL(14,2) NOT NULL,
  per_kg_rate DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) NOT NULL,
  partner_payout_percent DECIMAL(5,2) DEFAULT 70,
  kauvex_fee_percent DECIMAL(5,2) DEFAULT 30,
  service_level VARCHAR(20) DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_rate_cards_country ON kv_glx_rate_cards(country_code);
CREATE INDEX idx_kv_glx_rate_cards_tier ON kv_glx_rate_cards(tier);

-- PACKAGING FEES PER COUNTRY
CREATE TABLE IF NOT EXISTS kv_glx_packaging_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  packaging_type VARCHAR(50) NOT NULL,
  size_code VARCHAR(20) NOT NULL,
  fee DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_packaging_country ON kv_glx_packaging_fees(country_code);

-- PARTNER COUNTRY ASSOCIATIONS
CREATE TABLE IF NOT EXISTS kv_glx_partner_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending',
  documents_submitted JSONB,
  documents_verified JSONB,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_partner_countries_partner ON kv_glx_partner_countries(partner_id);
CREATE INDEX idx_kv_glx_partner_countries_country ON kv_glx_partner_countries(country_code);

-- EXTENDED JOB DATA (multi-currency, COD, W3W)
CREATE TABLE IF NOT EXISTS kv_glx_jobs_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  country_code VARCHAR(10),
  language_code VARCHAR(10),
  currency_code VARCHAR(10),
  payout_amount_local DECIMAL(14,2),
  kauvex_fee_local DECIMAL(14,2),
  cod_amount DECIMAL(14,2) DEFAULT 0,
  cod_collected BOOLEAN DEFAULT false,
  cod_collected_at TIMESTAMP,
  what3words_pickup TEXT,
  what3words_dropoff TEXT,
  landmark_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_jobs_ext_job ON kv_glx_jobs_extended(job_id);

-- CASH ON DELIVERY COLLECTIONS
CREATE TABLE IF NOT EXISTS kv_glx_cod_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  partner_id UUID,
  order_id UUID,
  amount DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  collected_at TIMESTAMP,
  remitted_at TIMESTAMP,
  remittance_reference VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_cod_job ON kv_glx_cod_collections(job_id);
CREATE INDEX idx_kv_glx_cod_status ON kv_glx_cod_collections(status);

-- WHAT3WORDS LOCATIONS
CREATE TABLE IF NOT EXISTS kv_glx_what3words_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  what3words_address VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  country_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_w3w_entity ON kv_glx_what3words_locations(entity_type, entity_id);

-- COMPLIANCE LOG
CREATE TABLE IF NOT EXISTS kv_glx_compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  compliance_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID,
  next_review_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_glx_compliance_country ON kv_glx_compliance_log(country_code);

-- ============================================================
-- SEED INITIAL COUNTRIES (launch markets)
-- ============================================================
INSERT INTO kv_glx_countries (country_code, country_name, continent, currency_code, currency_symbol, language_code, tier1_radius_km, timezone, vat_rate, cod_available, sunday_delivery, is_live) VALUES
  ('NG', 'Nigeria', 'Africa', 'NGN', '₦', 'en', 60, 'Africa/Lagos', 7.50, true, true, true),
  ('GB', 'United Kingdom', 'Europe', 'GBP', '£', 'en', 40, 'Europe/London', 20.00, false, true, true),
  ('US', 'United States', 'Americas', 'USD', '$', 'en', 80, 'America/New_York', 0, false, true, true),
  ('AE', 'United Arab Emirates', 'Middle East', 'AED', 'د.إ', 'ar', 40, 'Asia/Dubai', 5.00, true, false, true),
  ('IN', 'India', 'Asia', 'INR', '₹', 'en', 50, 'Asia/Kolkata', 18.00, true, true, true),
  ('AU', 'Australia', 'Oceania', 'AUD', 'A$', 'en', 60, 'Australia/Sydney', 10.00, false, true, true),
  ('DE', 'Germany', 'Europe', 'EUR', '€', 'de', 50, 'Europe/Berlin', 19.00, false, false, true),
  ('CA', 'Canada', 'Americas', 'CAD', 'C$', 'en', 80, 'America/Toronto', 13.00, false, true, true),
  ('GH', 'Ghana', 'Africa', 'GHS', '₵', 'en', 60, 'Africa/Accra', 15.00, true, true, false),
  ('KE', 'Kenya', 'Africa', 'KES', 'KSh', 'en', 60, 'Africa/Nairobi', 16.00, true, true, false),
  ('ZA', 'South Africa', 'Africa', 'ZAR', 'R', 'en', 60, 'Africa/Johannesburg', 15.00, false, true, false),
  ('SA', 'Saudi Arabia', 'Middle East', 'SAR', '﷼', 'ar', 50, 'Asia/Riyadh', 15.00, true, false, false),
  ('BR', 'Brazil', 'Americas', 'BRL', 'R$', 'pt', 80, 'America/Sao_Paulo', 17.00, false, true, false),
  ('JP', 'Japan', 'Asia', 'JPY', '¥', 'ja', 50, 'Asia/Tokyo', 10.00, false, true, false),
  ('FR', 'France', 'Europe', 'EUR', '€', 'fr', 50, 'Europe/Paris', 20.00, false, true, false)
ON CONFLICT (country_code) DO NOTHING;

-- ============================================================
-- SEED DEFAULT RATE CARDS (Nigeria example)
-- ============================================================
INSERT INTO kv_glx_rate_cards (country_code, tier, origin_zone, destination_zone, weight_min_kg, weight_max_kg, base_rate, per_kg_rate, currency_code, service_level) VALUES
  ('NG', 'tier_1_local', 'lagos', 'lagos', 0, 5, 1500, 200, 'NGN', 'standard'),
  ('NG', 'tier_1_local', 'lagos', 'lagos', 5, 15, 2500, 300, 'NGN', 'standard'),
  ('NG', 'tier_1_local', 'abuja', 'abuja', 0, 5, 1500, 200, 'NGN', 'standard'),
  ('NG', 'tier_2_domestic', 'lagos', 'abuja', 0, 5, 4500, 500, 'NGN', 'standard'),
  ('NG', 'tier_2_domestic', 'lagos', 'abuja', 5, 15, 6000, 700, 'NGN', 'standard'),
  ('NG', 'tier_2_domestic', 'lagos', 'ph', 0, 5, 4000, 450, 'NGN', 'standard'),
  ('NG', 'tier_3_international', 'ng', 'gb', 0, 2, 25000, 3000, 'NGN', 'express'),
  ('NG', 'tier_3_international', 'ng', 'us', 0, 2, 30000, 4000, 'NGN', 'express')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED PACKAGING FEES (Nigeria)
-- ============================================================
INSERT INTO kv_glx_packaging_fees (country_code, packaging_type, size_code, fee, currency_code) VALUES
  ('NG', 'standard_box', 's', 500, 'NGN'),
  ('NG', 'standard_box', 'm', 800, 'NGN'),
  ('NG', 'standard_box', 'l', 1200, 'NGN'),
  ('NG', 'poly_mailer', 's', 200, 'NGN'),
  ('NG', 'poly_mailer', 'm', 300, 'NGN'),
  ('NG', 'poly_mailer', 'l', 400, 'NGN'),
  ('NG', 'bubble_mailer', 's', 300, 'NGN'),
  ('NG', 'bubble_mailer', 'm', 450, 'NGN'),
  ('NG', 'bubble_mailer', 'l', 600, 'NGN'),
  ('NG', 'tube', 's', 350, 'NGN'),
  ('NG', 'tube', 'm', 500, 'NGN'),
  ('NG', 'tube', 'l', 700, 'NGN'),
  ('NG', 'fragile_pack', 'm', 2000, 'NGN'),
  ('NG', 'gift_box', 's', 1500, 'NGN'),
  ('NG', 'gift_box', 'm', 2500, 'NGN'),
  ('NG', 'gift_box', 'l', 3500, 'NGN'),
  ('NG', 'heavy_duty', 'l', 1500, 'NGN'),
  ('NG', 'heavy_duty', 'xl', 2000, 'NGN'),
  ('NG', 'heavy_duty', 'xxl', 2800, 'NGN'),
  ('NG', 'insulated', 's', 1200, 'NGN'),
  ('NG', 'insulated', 'm', 1800, 'NGN')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED COUNTRY CARRIERS (Nigeria)
-- ============================================================
INSERT INTO kv_glx_country_carriers (country_code, carrier_code, carrier_name, tier, is_primary, is_active) VALUES
  ('NG', 'gig', 'GIG Logistics', 'tier_1_local', true, true),
  ('NG', 'kwik', 'Kwik Delivery', 'tier_1_local', false, true),
  ('NG', 'sendbox', 'Sendbox', 'tier_1_local', false, true),
  ('NG', 'fez', 'Fez Delivery', 'tier_1_local', false, true),
  ('NG', 'dhl_ng', 'DHL Nigeria', 'tier_1_local', false, true),
  ('NG', 'dhl_intl', 'DHL Express International', 'tier_3_international', true, true),
  ('NG', 'aramex_intl', 'Aramex International', 'tier_3_international', false, true),
  ('GB', 'royal_mail', 'Royal Mail', 'tier_1_local', true, true),
  ('GB', 'evri', 'Evri (Hermes)', 'tier_1_local', false, true),
  ('GB', 'dpd_uk', 'DPD UK', 'tier_1_local', false, true),
  ('GB', 'dhl_uk', 'DHL UK', 'tier_1_local', false, true),
  ('US', 'usps', 'USPS', 'tier_1_local', true, true),
  ('US', 'ups', 'UPS Domestic', 'tier_1_local', false, true),
  ('US', 'fedex_ground', 'FedEx Ground', 'tier_1_local', false, true),
  ('IN', 'delhivery', 'Delhivery', 'tier_1_local', true, true),
  ('IN', 'bluedart', 'BlueDart (DHL)', 'tier_1_local', false, true),
  ('IN', 'dtdc', 'DTDC', 'tier_1_local', false, true),
  ('AU', 'auspost', 'Australia Post', 'tier_1_local', true, true),
  ('AU', 'startrack', 'StarTrack', 'tier_1_local', false, true),
  ('AE', 'aramex_uae', 'Aramex UAE', 'tier_1_local', true, true),
  ('AE', 'emirates_post', 'Emirates Post', 'tier_1_local', false, true),
  ('DE', 'dhl_paket', 'DHL Paket', 'tier_1_local', true, true),
  ('DE', 'dpd_de', 'DPD Germany', 'tier_1_local', false, true),
  ('DE', 'gls', 'GLS Germany', 'tier_1_local', false, true)
ON CONFLICT DO NOTHING;
