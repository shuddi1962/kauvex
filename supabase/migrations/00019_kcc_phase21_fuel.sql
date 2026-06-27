-- ============================================================
-- PHASE 21: FUEL PRICE TRACKING & SURCHARGE SYSTEM
-- Migration: 00019_kcc_phase21_fuel.sql
-- ============================================================

-- FUEL DATA SOURCES (providers of fuel price data)
CREATE TABLE IF NOT EXISTS kv_fuel_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(100) NOT NULL,
  source_type VARCHAR(30) NOT NULL, -- api, manual, scraping, partner
  api_endpoint VARCHAR(500),
  api_key_encrypted TEXT,
  refresh_interval_hours INT DEFAULT 24,
  currency_code VARCHAR(10) NOT NULL,
  coverage_countries TEXT[], -- array of country codes
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMP,
  reliability_score DECIMAL(3,2) DEFAULT 1.00, -- 0-1
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_data_sources_active ON kv_fuel_data_sources(is_active);
CREATE INDEX idx_kv_fuel_data_sources_type ON kv_fuel_data_sources(source_type);

-- FUEL PRICES (current fuel prices per country/region)
CREATE TABLE IF NOT EXISTS kv_fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL, -- petrol, diesel, premium, cng, lpg
  price_per_unit DECIMAL(10,4) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'liter', -- liter, gallon, kg
  region VARCHAR(100),
  city VARCHAR(100),
  source_id UUID REFERENCES kv_fuel_data_sources(id),
  fetched_at TIMESTAMP DEFAULT NOW(),
  effective_from TIMESTAMP DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_prices_country ON kv_fuel_prices(country_code);
CREATE INDEX idx_kv_fuel_prices_type ON kv_fuel_prices(fuel_type);
CREATE INDEX idx_kv_fuel_prices_current ON kv_fuel_prices(is_current);
CREATE INDEX idx_kv_fuel_prices_effective ON kv_fuel_prices(effective_from);

-- FUEL PRICE HISTORY (tracked price changes over time)
CREATE TABLE IF NOT EXISTS kv_fuel_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  price_per_unit DECIMAL(10,4) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'liter',
  region VARCHAR(100),
  city VARCHAR(100),
  source_id UUID REFERENCES kv_fuel_data_sources(id),
  recorded_at TIMESTAMP DEFAULT NOW(),
  change_pct DECIMAL(7,4), -- % change from previous
  previous_price_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_price_history_country ON kv_fuel_price_history(country_code);
CREATE INDEX idx_kv_fuel_price_history_type ON kv_fuel_price_history(fuel_type);
CREATE INDEX idx_kv_fuel_price_history_recorded ON kv_fuel_price_history(recorded_at);

-- FUEL SURCHARGE RULES (automatic surcharge calculations)
CREATE TABLE IF NOT EXISTS kv_fuel_surcharge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(150) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  tier_min DECIMAL(10,4) NOT NULL, -- price threshold lower bound
  tier_max DECIMAL(10,4), -- price threshold upper bound (NULL = unlimited)
  surcharge_type VARCHAR(20) NOT NULL, -- fixed, percentage, per_km, per_unit
  surcharge_value DECIMAL(10,4) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  carrier_code VARCHAR(50), -- NULL = applies to all carriers
  service_level VARCHAR(30), -- NULL = applies to all levels
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 100, -- higher = evaluated first
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_surcharge_rules_country ON kv_fuel_surcharge_rules(country_code);
CREATE INDEX idx_kv_fuel_surcharge_rules_active ON kv_fuel_surcharge_rules(is_active);
CREATE INDEX idx_kv_fuel_surcharge_rules_tier ON kv_fuel_surcharge_rules(tier_min, tier_max);

-- FUEL SURCHARGE LOG (calculated surcharges applied to shipments)
CREATE TABLE IF NOT EXISTS kv_fuel_surcharge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  order_id UUID,
  rule_id UUID REFERENCES kv_fuel_surcharge_rules(id),
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  fuel_price_at_calc DECIMAL(10,4) NOT NULL,
  surcharge_type VARCHAR(20) NOT NULL,
  surcharge_value DECIMAL(10,4) NOT NULL,
  surcharge_amount DECIMAL(10,4) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  carrier_code VARCHAR(50),
  service_level VARCHAR(30),
  calculated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_surcharge_log_shipment ON kv_fuel_surcharge_log(shipment_id);
CREATE INDEX idx_kv_fuel_surcharge_log_order ON kv_fuel_surcharge_log(order_id);
CREATE INDEX idx_kv_fuel_surcharge_log_rule ON kv_fuel_surcharge_log(rule_id);
CREATE INDEX idx_kv_fuel_surcharge_log_calc ON kv_fuel_surcharge_log(calculated_at);

-- FUEL ALERTS (price threshold alert subscriptions)
CREATE TABLE IF NOT EXISTS kv_fuel_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  alert_type VARCHAR(30) NOT NULL, -- above, below, change_pct, absolute_change
  threshold_value DECIMAL(10,4) NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  notify_channels TEXT[] DEFAULT ARRAY['email'], -- email, sms, push, webhook
  webhook_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  trigger_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_alerts_account ON kv_fuel_alerts(account_id);
CREATE INDEX idx_kv_fuel_alerts_country ON kv_fuel_alerts(country_code);
CREATE INDEX idx_kv_fuel_alerts_active ON kv_fuel_alerts(is_active);

-- FUEL ALERT HISTORY (log of triggered alerts)
CREATE TABLE IF NOT EXISTS kv_fuel_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES kv_fuel_alerts(id),
  account_id UUID NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  alert_type VARCHAR(30) NOT NULL,
  threshold_value DECIMAL(10,4) NOT NULL,
  actual_value DECIMAL(10,4) NOT NULL,
  change_pct DECIMAL(7,4),
  fuel_price_id UUID REFERENCES kv_fuel_prices(id),
  channels_notified TEXT[] DEFAULT ARRAY['email'],
  notification_status VARCHAR(20) DEFAULT 'sent', -- sent, failed, pending
  triggered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_alert_history_alert ON kv_fuel_alert_history(alert_id);
CREATE INDEX idx_kv_fuel_alert_history_account ON kv_fuel_alert_history(account_id);
CREATE INDEX idx_kv_fuel_alert_history_triggered ON kv_fuel_alert_history(triggered_at);

-- FUEL PARTNER PROFILE (logistics partner fuel tracking)
CREATE TABLE IF NOT EXISTS kv_fuel_partner_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  partner_type VARCHAR(30) NOT NULL, -- carrier, fleet, independent
  country_code VARCHAR(10) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL DEFAULT 'diesel',
  vehicle_class VARCHAR(50), -- motorcycle, tricycle, van, truck, heavy_truck
  avg_consumption_unit DECIMAL(8,4), -- liters per km or per unit
  consumption_unit VARCHAR(20), -- l_per_km, l_per_trip, kg_per_km
  monthly_fuel_budget DECIMAL(12,2),
  currency_code VARCHAR(10),
  preferred_source_id UUID REFERENCES kv_fuel_data_sources(id),
  enable_auto_surcharge BOOLEAN DEFAULT true,
  fuel_surcharge_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_fuel_partner_profile_partner ON kv_fuel_partner_profile(partner_id);
CREATE INDEX idx_kv_fuel_partner_profile_country ON kv_fuel_partner_profile(country_code);
CREATE INDEX idx_kv_fuel_partner_profile_type ON kv_fuel_partner_profile(partner_type);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed data sources (3 major providers)
INSERT INTO kv_fuel_data_sources (id, source_name, source_type, api_endpoint, refresh_interval_hours, currency_code, coverage_countries, is_active, reliability_score) VALUES
('a1000000-0000-0000-0000-000000000001', 'GlobalPetrolPrices API', 'api', 'https://api.globalpetrolprices.com/v2/fuel', 24, 'USD', ARRAY['NG','GB','US','AE','IN','AU','DE','CA','GH','KE','ZA','SA','BR','JP','FR'], true, 0.95),
('a1000000-0000-0000-0000-000000000002', 'Brent Crude Index Feed', 'api', 'https://api.oilprice.com/v1/brent', 12, 'USD', ARRAY['NG','GB','US','AE','IN','AU','DE','CA','GH','KE','ZA','SA','BR','JP','FR'], true, 0.92),
('a1000000-0000-0000-0000-000000000003', 'Kauvex Partner Manual Feed', 'manual', NULL, 168, 'USD', ARRAY['NG','GH','KE','ZA'], true, 0.80);

-- Seed current fuel prices for 15 countries (diesel, premium gasoline)
-- NG (Nigeria) — NGN per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('NG', 'diesel', 680.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('NG', 'premium', 617.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('NG', 'petrol', 617.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- GB (United Kingdom) — GBP per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('GB', 'diesel', 1.4890, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('GB', 'premium', 1.5290, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('GB', 'petrol', 1.4690, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- US (United States) — USD per gallon
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('US', 'diesel', 3.9290, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001'),
('US', 'premium', 3.6290, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001'),
('US', 'petrol', 3.3590, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001');

-- AE (UAE) — AED per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('AE', 'diesel', 3.2200, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('AE', 'premium', 3.3600, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('AE', 'petrol', 2.9200, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- IN (India) — INR per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('IN', 'diesel', 89.6200, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('IN', 'premium', 103.8400, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('IN', 'petrol', 102.8600, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- AU (Australia) — AUD per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('AU', 'diesel', 1.8990, 'AUD', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('AU', 'premium', 2.1590, 'AUD', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('AU', 'petrol', 1.8190, 'AUD', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- DE (Germany) — EUR per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('DE', 'diesel', 1.6790, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('DE', 'premium', 1.8990, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('DE', 'petrol', 1.7990, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- CA (Canada) — CAD per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('CA', 'diesel', 1.5690, 'CAD', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('CA', 'premium', 1.7290, 'CAD', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('CA', 'petrol', 1.5290, 'CAD', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- GH (Ghana) — GHS per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('GH', 'diesel', 13.4900, 'GHS', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('GH', 'premium', 12.9900, 'GHS', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('GH', 'petrol', 12.6900, 'GHS', 'liter', 'a1000000-0000-0000-0000-000000000003');

-- KE (Kenya) — KES per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('KE', 'diesel', 205.5000, 'KES', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('KE', 'premium', 215.8100, 'KES', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('KE', 'petrol', 211.9900, 'KES', 'liter', 'a1000000-0000-0000-0000-000000000003');

-- ZA (South Africa) — ZAR per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('ZA', 'diesel', 22.1500, 'ZAR', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('ZA', 'premium', 24.0900, 'ZAR', 'liter', 'a1000000-0000-0000-0000-000000000003'),
('ZA', 'petrol', 22.3700, 'ZAR', 'liter', 'a1000000-0000-0000-0000-000000000003');

-- SA (Saudi Arabia) — SAR per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('SA', 'diesel', 0.6200, 'SAR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('SA', 'premium', 2.1800, 'SAR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('SA', 'petrol', 1.5300, 'SAR', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- BR (Brazil) — BRL per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('BR', 'diesel', 6.0600, 'BRL', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('BR', 'premium', 6.2900, 'BRL', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('BR', 'petrol', 5.6900, 'BRL', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- JP (Japan) — JPY per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('JP', 'diesel', 158.8000, 'JPY', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('JP', 'premium', 185.0000, 'JPY', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('JP', 'petrol', 174.3000, 'JPY', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- FR (France) — EUR per liter
INSERT INTO kv_fuel_prices (country_code, fuel_type, price_per_unit, currency_code, unit, source_id) VALUES
('FR', 'diesel', 1.7590, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('FR', 'premium', 1.9190, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001'),
('FR', 'petrol', 1.8390, 'EUR', 'liter', 'a1000000-0000-0000-0000-000000000001');

-- Seed historical prices (30-day history for NG and GB)
INSERT INTO kv_fuel_price_history (country_code, fuel_type, price_per_unit, currency_code, unit, source_id, recorded_at, change_pct) VALUES
-- NG diesel history
('NG', 'diesel', 665.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('NG', 'diesel', 670.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.75),
('NG', 'diesel', 675.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.75),
('NG', 'diesel', 680.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.74),
-- NG premium history
('NG', 'premium', 605.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('NG', 'premium', 608.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.50),
('NG', 'premium', 612.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.66),
('NG', 'premium', 617.0000, 'NGN', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.82),
-- GB diesel history
('GB', 'diesel', 1.4650, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('GB', 'diesel', 1.4720, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.48),
('GB', 'diesel', 1.4800, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.54),
('GB', 'diesel', 1.4890, 'GBP', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.61),
-- US diesel history
('US', 'diesel', 3.8500, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('US', 'diesel', 3.8750, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.65),
('US', 'diesel', 3.9000, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.65),
('US', 'diesel', 3.9290, 'USD', 'gallon', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.74),
-- AE diesel history
('AE', 'diesel', 3.1500, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('AE', 'diesel', 3.1800, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.95),
('AE', 'diesel', 3.2000, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.63),
('AE', 'diesel', 3.2200, 'AED', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.63),
-- IN diesel history
('IN', 'diesel', 87.5000, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NULL),
('IN', 'diesel', 88.2000, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 0.80),
('IN', 'diesel', 89.0000, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 0.91),
('IN', 'diesel', 89.6200, 'INR', 'liter', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 0.70);

-- Seed default surcharge rules (15 countries × tiered)
-- NG: tiered by diesel price
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('NG Diesel Low', 'NG', 'diesel', 0, 600, 'percentage', 0.00, 'NGN', true, 100),
('NG Diesel Mid', 'NG', 'diesel', 600, 700, 'percentage', 5.00, 'NGN', true, 90),
('NG Diesel High', 'NG', 'diesel', 700, NULL, 'percentage', 8.00, 'NGN', true, 80);

-- GB: tiered by diesel price
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('GB Diesel Low', 'GB', 'diesel', 0, 1.40, 'percentage', 0.00, 'GBP', true, 100),
('GB Diesel Mid', 'GB', 'diesel', 1.40, 1.60, 'percentage', 3.00, 'GBP', true, 90),
('GB Diesel High', 'GB', 'diesel', 1.60, NULL, 'percentage', 6.00, 'GBP', true, 80);

-- US: tiered by diesel price
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('US Diesel Low', 'US', 'diesel', 0, 3.50, 'percentage', 0.00, 'USD', true, 100),
('US Diesel Mid', 'US', 'diesel', 3.50, 4.00, 'percentage', 4.00, 'USD', true, 90),
('US Diesel High', 'US', 'diesel', 4.00, NULL, 'percentage', 7.00, 'USD', true, 80);

-- AE: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('AE Diesel Low', 'AE', 'diesel', 0, 3.00, 'percentage', 0.00, 'AED', true, 100),
('AE Diesel Mid', 'AE', 'diesel', 3.00, 3.50, 'percentage', 3.00, 'AED', true, 90),
('AE Diesel High', 'AE', 'diesel', 3.50, NULL, 'percentage', 6.00, 'AED', true, 80);

-- IN: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('IN Diesel Low', 'IN', 'diesel', 0, 85, 'percentage', 0.00, 'INR', true, 100),
('IN Diesel Mid', 'IN', 'diesel', 85, 95, 'percentage', 3.00, 'INR', true, 90),
('IN Diesel High', 'IN', 'diesel', 95, NULL, 'percentage', 6.00, 'INR', true, 80);

-- AU: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('AU Diesel Low', 'AU', 'diesel', 0, 1.70, 'percentage', 0.00, 'AUD', true, 100),
('AU Diesel Mid', 'AU', 'diesel', 1.70, 2.00, 'percentage', 4.00, 'AUD', true, 90),
('AU Diesel High', 'AU', 'diesel', 2.00, NULL, 'percentage', 7.00, 'AUD', true, 80);

-- DE: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('DE Diesel Low', 'DE', 'diesel', 0, 1.50, 'percentage', 0.00, 'EUR', true, 100),
('DE Diesel Mid', 'DE', 'diesel', 1.50, 1.80, 'percentage', 3.00, 'EUR', true, 90),
('DE Diesel High', 'DE', 'diesel', 1.80, NULL, 'percentage', 6.00, 'EUR', true, 80);

-- CA: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('CA Diesel Low', 'CA', 'diesel', 0, 1.40, 'percentage', 0.00, 'CAD', true, 100),
('CA Diesel Mid', 'CA', 'diesel', 1.40, 1.70, 'percentage', 3.00, 'CAD', true, 90),
('CA Diesel High', 'CA', 'diesel', 1.70, NULL, 'percentage', 6.00, 'CAD', true, 80);

-- GH: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('GH Diesel Low', 'GH', 'diesel', 0, 12.00, 'percentage', 0.00, 'GHS', true, 100),
('GH Diesel Mid', 'GH', 'diesel', 12.00, 14.00, 'percentage', 4.00, 'GHS', true, 90),
('GH Diesel High', 'GH', 'diesel', 14.00, NULL, 'percentage', 7.00, 'GHS', true, 80);

-- KE: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('KE Diesel Low', 'KE', 'diesel', 0, 195, 'percentage', 0.00, 'KES', true, 100),
('KE Diesel Mid', 'KE', 'diesel', 195, 215, 'percentage', 3.00, 'KES', true, 90),
('KE Diesel High', 'KE', 'diesel', 215, NULL, 'percentage', 6.00, 'KES', true, 80);

-- ZA: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('ZA Diesel Low', 'ZA', 'diesel', 0, 20.00, 'percentage', 0.00, 'ZAR', true, 100),
('ZA Diesel Mid', 'ZA', 'diesel', 20.00, 23.00, 'percentage', 3.00, 'ZAR', true, 90),
('ZA Diesel High', 'ZA', 'diesel', 23.00, NULL, 'percentage', 6.00, 'ZAR', true, 80);

-- SA: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('SA Diesel Low', 'SA', 'diesel', 0, 0.50, 'percentage', 0.00, 'SAR', true, 100),
('SA Diesel Mid', 'SA', 'diesel', 0.50, 0.70, 'percentage', 3.00, 'SAR', true, 90),
('SA Diesel High', 'SA', 'diesel', 0.70, NULL, 'percentage', 6.00, 'SAR', true, 80);

-- BR: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('BR Diesel Low', 'BR', 'diesel', 0, 5.50, 'percentage', 0.00, 'BRL', true, 100),
('BR Diesel Mid', 'BR', 'diesel', 5.50, 6.50, 'percentage', 4.00, 'BRL', true, 90),
('BR Diesel High', 'BR', 'diesel', 6.50, NULL, 'percentage', 7.00, 'BRL', true, 80);

-- JP: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('JP Diesel Low', 'JP', 'diesel', 0, 150, 'percentage', 0.00, 'JPY', true, 100),
('JP Diesel Mid', 'JP', 'diesel', 150, 175, 'percentage', 3.00, 'JPY', true, 90),
('JP Diesel High', 'JP', 'diesel', 175, NULL, 'percentage', 6.00, 'JPY', true, 80);

-- FR: tiered
INSERT INTO kv_fuel_surcharge_rules (rule_name, country_code, fuel_type, tier_min, tier_max, surcharge_type, surcharge_value, currency_code, is_active, priority) VALUES
('FR Diesel Low', 'FR', 'diesel', 0, 1.60, 'percentage', 0.00, 'EUR', true, 100),
('FR Diesel Mid', 'FR', 'diesel', 1.60, 1.85, 'percentage', 3.00, 'EUR', true, 90),
('FR Diesel High', 'FR', 'diesel', 1.85, NULL, 'percentage', 6.00, 'EUR', true, 80);
