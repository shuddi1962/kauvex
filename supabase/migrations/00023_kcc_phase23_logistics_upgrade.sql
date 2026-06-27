-- ============================================================
-- PHASE 23: Kauvex Shipping & Logistics Platform Upgrade
-- ============================================================

-- 1. GLOBAL CARRIER CONFIGURATION
CREATE TABLE IF NOT EXISTS kv_sl_global_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_code VARCHAR(50) UNIQUE,
  carrier_name VARCHAR(200),
  carrier_logo_url TEXT,
  carrier_color VARCHAR(10),
  country_codes TEXT[],
  tier VARCHAR(20) DEFAULT 'all_tiers',
  service_types TEXT[],
  api_adapter VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CORPORATE ACCOUNTS
CREATE TABLE IF NOT EXISTS kv_sl_corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200),
  contact_name VARCHAR(200),
  contact_email VARCHAR(200),
  contact_phone VARCHAR(30),
  country_code VARCHAR(10),
  industry VARCHAR(100),
  monthly_volume_estimate INT,
  contract_start DATE,
  contract_end DATE,
  sla_on_time_percent DECIMAL(5,2) DEFAULT 95,
  billing_type VARCHAR(20) DEFAULT 'per_shipment',
  credit_limit DECIMAL(14,2),
  account_manager_id UUID,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. B2B CONTRACTS
CREATE TABLE IF NOT EXISTS kv_sl_b2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID REFERENCES kv_sl_corporate_accounts(id),
  service_type VARCHAR(50),
  route_origin VARCHAR(100),
  route_destination VARCHAR(100),
  agreed_rate DECIMAL(14,2),
  rate_per VARCHAR(20) DEFAULT 'kg',
  currency_code VARCHAR(10) DEFAULT 'NGN',
  volume_commitment INT,
  penalty_for_shortfall DECIMAL(10,2),
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. VIRTUAL ADDRESS SERVICE
CREATE TABLE IF NOT EXISTS kv_sl_virtual_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  country_code VARCHAR(10),
  city VARCHAR(100),
  street_address TEXT,
  unit_identifier VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  packages_received INT DEFAULT 0,
  packages_forwarded INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. COLD CHAIN JOBS
CREATE TABLE IF NOT EXISTS kv_sl_cold_chain_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logistics_job_id UUID,
  temp_min_required DECIMAL(5,2),
  temp_max_required DECIMAL(5,2),
  temp_readings JSONB DEFAULT '[]',
  temp_breach_count INT DEFAULT 0,
  insulated_packaging_provided BOOLEAN DEFAULT true,
  ice_pack_included BOOLEAN DEFAULT false,
  chain_of_custody_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. RECURRING SHIPMENTS
CREATE TABLE IF NOT EXISTS kv_sl_recurring_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  template_name VARCHAR(200),
  origin_address JSONB,
  destination_address JSONB,
  carrier_code VARCHAR(50),
  service_level VARCHAR(20),
  frequency VARCHAR(20) DEFAULT 'weekly',
  next_booking_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. SAVED SHIPMENT TEMPLATES
CREATE TABLE IF NOT EXISTS kv_sl_shipment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  template_name VARCHAR(200),
  origin_address JSONB,
  destination_address JSONB,
  package_details JSONB,
  carrier_preferences JSONB,
  automation_rules JSONB,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. RATE CALENDAR DATA
CREATE TABLE IF NOT EXISTS kv_sl_rate_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country VARCHAR(10),
  destination_country VARCHAR(10),
  carrier_code VARCHAR(50),
  service_level VARCHAR(20),
  date DATE,
  base_rate DECIMAL(14,2),
  fuel_surcharge DECIMAL(14,2),
  peak_surcharge DECIMAL(14,2),
  total_rate DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  is_cheapest_day_of_week BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. SHOP & SHIP PARCELS
CREATE TABLE IF NOT EXISTS kv_sl_shop_and_ship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  virtual_address_id UUID REFERENCES kv_sl_virtual_addresses(id),
  user_id UUID,
  store_name VARCHAR(200),
  tracking_number_inbound VARCHAR(200),
  package_description TEXT,
  declared_value DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  received_at TIMESTAMP,
  weight_kg DECIMAL(10,3),
  dimensions JSONB,
  status VARCHAR(20) DEFAULT 'awaiting_arrival',
  forwarding_shipment_id UUID,
  consolidate_with UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. PARTNER CERTIFICATIONS
CREATE TABLE IF NOT EXISTS kv_sl_partner_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID,
  certification_type VARCHAR(50),
  certified_by VARCHAR(100),
  certificate_url TEXT,
  valid_from DATE,
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. CARGO PHOTOS
CREATE TABLE IF NOT EXISTS kv_sl_cargo_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  photo_url TEXT,
  photo_type VARCHAR(30),
  taken_by UUID,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  taken_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. DELIVERY CONFIDENCE SCORES
CREATE TABLE IF NOT EXISTS kv_sl_delivery_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  confidence_score DECIMAL(5,2),
  factors JSONB DEFAULT '[]',
  recommendation TEXT,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. CARBON OFFSET TRANSACTIONS
CREATE TABLE IF NOT EXISTS kv_sl_carbon_offsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  shipment_id UUID,
  co2_kg DECIMAL(10,3),
  offset_amount DECIMAL(10,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  trees_planted INT DEFAULT 0,
  offset_partner VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. ADD COLUMNS TO EXISTING JOBS TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'job_source') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN job_source VARCHAR(30) DEFAULT 'marketplace';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'job_source_id') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN job_source_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'is_fbk_job') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN is_fbk_job BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'cold_chain_required') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN cold_chain_required BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'cold_chain_temp_min') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN cold_chain_temp_min DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'cold_chain_temp_max') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN cold_chain_temp_max DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kv_logistics_jobs' AND column_name = 'corporate_account_id') THEN
    ALTER TABLE kv_logistics_jobs ADD COLUMN corporate_account_id UUID;
  END IF;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_kv_sl_global_carriers_code ON kv_sl_global_carriers(carrier_code);
CREATE INDEX IF NOT EXISTS idx_kv_sl_corporate_accounts_status ON kv_sl_corporate_accounts(status);
CREATE INDEX IF NOT EXISTS idx_kv_sl_b2b_contracts_account ON kv_sl_b2b_contracts(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_virtual_addresses_user ON kv_sl_virtual_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_cold_chain_jobs_job ON kv_sl_cold_chain_jobs(logistics_job_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_recurring_shipments_account ON kv_sl_recurring_shipments(account_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_shipment_templates_account ON kv_sl_shipment_templates(account_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_rate_calendar_date ON kv_sl_rate_calendar(date);
CREATE INDEX IF NOT EXISTS idx_kv_sl_rate_calendar_route ON kv_sl_rate_calendar(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_kv_sl_shop_and_ship_user ON kv_sl_shop_and_ship(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_partner_certifications_partner ON kv_sl_partner_certifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_cargo_photos_shipment ON kv_sl_cargo_photos(shipment_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_delivery_confidence_shipment ON kv_sl_delivery_confidence(shipment_id);
CREATE INDEX IF NOT EXISTS idx_kv_sl_carbon_offsets_user ON kv_sl_carbon_offsets(user_id);

-- SEED GLOBAL CARRIERS (15 countries)
INSERT INTO kv_sl_global_carriers (carrier_code, carrier_name, country_codes, tier, service_types, is_active) VALUES
('dhl', 'DHL Express', ARRAY['NG','GB','US','AE','IN','AU','DE','CA','GH','KE','ZA','SA','BR','JP','FR'], 'all_tiers', ARRAY['express','standard'], true),
('fedex', 'FedEx International', ARRAY['NG','GB','US','AE','IN','AU','DE','CA'], 'all_tiers', ARRAY['express','standard','freight'], true),
('ups', 'UPS Worldwide', ARRAY['NG','GB','US','AE','IN','AU','DE','CA','JP'], 'all_tiers', ARRAY['express','standard','freight'], true),
('aramex', 'Aramex International', ARRAY['NG','AE','IN','SA','GH','KE','ZA'], 'all_tiers', ARRAY['express','standard'], true),
('gig', 'GIG Logistics', ARRAY['NG'], 'tier_1_local', ARRAY['express','standard'], true),
('kwik', 'Kwik Delivery', ARRAY['NG'], 'tier_1_local', ARRAY['express'], true),
('royalmail', 'Royal Mail', ARRAY['GB'], 'tier_1_local', ARRAY['standard','express'], true),
('evri', 'Evri (Hermes)', ARRAY['GB'], 'tier_1_local', ARRAY['standard'], true),
('dpd', 'DPD', ARRAY['GB','DE','FR'], 'tier_1_local', ARRAY['express','standard'], true),
('usps', 'USPS', ARRAY['US'], 'tier_1_local', ARRAY['standard','express'], true),
('delhivery', 'Delhivery', ARRAY['IN'], 'tier_1_local', ARRAY['standard','express'], true),
('bluedart', 'BlueDart (DHL)', ARRAY['IN'], 'tier_1_local', ARRAY['express'], true),
('auspost', 'Australia Post', ARRAY['AU'], 'tier_1_local', ARRAY['standard','express'], true),
('kauvex', 'Kauvex Logistics Network', ARRAY['NG','GB','US','AE','IN','AU','DE','CA','GH','KE','ZA','SA','BR','JP','FR'], 'all_tiers', ARRAY['express','standard','freight','cold_chain'], true),
('sendbox', 'Sendbox', ARRAY['NG'], 'tier_1_local', ARRAY['standard'], true)
ON CONFLICT (carrier_code) DO NOTHING;
