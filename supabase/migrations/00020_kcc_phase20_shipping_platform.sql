-- ═══════════════════════════════════════════════════════════════════
-- PHASE 20 — Kauvex Shipping Platform (kv_ksp_ prefix)
-- Steps 352-394 | Build Steps 352-394
-- ═══════════════════════════════════════════════════════════════════

-- 1. Extend existing express shipments table
ALTER TABLE kv_ship_express_shipments
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS account_id UUID,
ADD COLUMN IF NOT EXISTS delivery_confidence_score INT,
ADD COLUMN IF NOT EXISTS cargo_photos JSONB,
ADD COLUMN IF NOT EXISTS packaging_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS packaging_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS packaging_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS locker_id UUID,
ADD COLUMN IF NOT EXISTS locker_compartment_id UUID,
ADD COLUMN IF NOT EXISTS collection_pin VARCHAR(10),
ADD COLUMN IF NOT EXISTS collection_qr_url TEXT,
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS geofence_alerts JSONB;

-- 2. Express Accounts
CREATE TABLE IF NOT EXISTS kv_ksp_express_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  account_type VARCHAR(20) DEFAULT 'personal',
  business_name VARCHAR(200),
  tier VARCHAR(20) DEFAULT 'bronze',
  monthly_volume INT DEFAULT 0,
  monthly_spend DECIMAL(14,2) DEFAULT 0,
  volume_discount_percent DECIMAL(5,2) DEFAULT 0,
  billing_type VARCHAR(20) DEFAULT 'per_shipment',
  wallet_balance DECIMAL(14,2) DEFAULT 0,
  custom_waybill_branding BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  team_approval_threshold DECIMAL(14,2),
  carbon_offset_enabled BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_account_user ON kv_ksp_express_accounts(user_id);

-- 3. Team Members
CREATE TABLE IF NOT EXISTS kv_ksp_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES kv_ksp_express_accounts(id),
  user_id UUID,
  role VARCHAR(20),
  spending_limit DECIMAL(14,2),
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_team_account ON kv_ksp_team_members(account_id);

-- 4. Lockers
CREATE TABLE IF NOT EXISTS kv_ksp_lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),
  location_name VARCHAR(200),
  address TEXT,
  city VARCHAR(100),
  country_code VARCHAR(10),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  locker_type VARCHAR(20) DEFAULT 'standard',
  total_compartments INT DEFAULT 0,
  available_compartments INT DEFAULT 0,
  opening_hours JSONB,
  is_24_hours BOOLEAN DEFAULT false,
  has_refrigerated BOOLEAN DEFAULT false,
  has_camera BOOLEAN DEFAULT true,
  host_name VARCHAR(200),
  host_revenue_share DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'active',
  last_service_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_locker_country ON kv_ksp_lockers(country_code);
CREATE INDEX IF NOT EXISTS idx_ksp_locker_city ON kv_ksp_lockers(city);

-- 5. Locker Compartments
CREATE TABLE IF NOT EXISTS kv_ksp_locker_compartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id UUID REFERENCES kv_ksp_lockers(id),
  compartment_number VARCHAR(20),
  size VARCHAR(20),
  max_weight_kg DECIMAL(10,3),
  length_cm DECIMAL(10,2),
  width_cm DECIMAL(10,2),
  height_cm DECIMAL(10,2),
  is_refrigerated BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'available',
  current_shipment_id UUID,
  occupied_since TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_compartment_locker ON kv_ksp_locker_compartments(locker_id);
CREATE INDEX IF NOT EXISTS idx_ksp_compartment_status ON kv_ksp_locker_compartments(status);

-- 6. Locker Bookings
CREATE TABLE IF NOT EXISTS kv_ksp_locker_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compartment_id UUID REFERENCES kv_ksp_locker_compartments(id),
  locker_id UUID,
  shipment_id UUID,
  shipment_type VARCHAR(20),
  collection_pin VARCHAR(10),
  collection_qr_url TEXT,
  status VARCHAR(20) DEFAULT 'awaiting_delivery',
  delivered_at TIMESTAMP,
  collected_at TIMESTAMP,
  expires_at TIMESTAMP,
  reminder_1_sent BOOLEAN DEFAULT false,
  reminder_2_sent BOOLEAN DEFAULT false,
  final_notice_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_booking_locker ON kv_ksp_locker_bookings(locker_id);
CREATE INDEX IF NOT EXISTS idx_ksp_booking_status ON kv_ksp_locker_bookings(status);

-- 7. WMS Integrations
CREATE TABLE IF NOT EXISTS kv_ksp_wms_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID,
  wms_type VARCHAR(50) DEFAULT 'manual',
  wms_name VARCHAR(100),
  api_endpoint TEXT,
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  status_code_mapping JSONB,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  sync_errors INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_wms_warehouse ON kv_ksp_wms_integrations(warehouse_id);

-- 8. Cargo Photos
CREATE TABLE IF NOT EXISTS kv_ksp_cargo_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  shipment_type VARCHAR(20),
  checkpoint_type VARCHAR(30),
  photo_url TEXT,
  taken_by_type VARCHAR(20),
  taken_by_id UUID,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_cargo_shipment ON kv_ksp_cargo_photos(shipment_id);

-- 9. Delivery Confidence
CREATE TABLE IF NOT EXISTS kv_ksp_delivery_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  score INT,
  factors JSONB,
  recommendation TEXT,
  calculated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_confidence_shipment ON kv_ksp_delivery_confidence(shipment_id);

-- 10. Geofence Alerts
CREATE TABLE IF NOT EXISTS kv_ksp_geofence_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  account_id UUID,
  alert_name VARCHAR(100),
  trigger_type VARCHAR(30),
  city VARCHAR(100),
  country_code VARCHAR(10),
  radius_km DECIMAL(10,2),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_geofence_shipment ON kv_ksp_geofence_alerts(shipment_id);

-- 11. Platform Events (Command Center)
CREATE TABLE IF NOT EXISTS kv_ksp_platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50),
  event_data JSONB,
  country_code VARCHAR(10),
  city VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  value DECIMAL(14,2),
  storefront_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_event_created ON kv_ksp_platform_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ksp_event_type ON kv_ksp_platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ksp_event_country ON kv_ksp_platform_events(country_code);

-- 12. Smart Rate Calendar
CREATE TABLE IF NOT EXISTS kv_ksp_smart_rate_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country VARCHAR(10),
  destination_country VARCHAR(10),
  origin_city VARCHAR(100),
  destination_city VARCHAR(100),
  date DATE,
  service_level VARCHAR(20),
  predicted_rate DECIMAL(14,2),
  currency_code VARCHAR(10),
  rate_factors JSONB,
  cheapest_day_of_week INT,
  calculated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_rate_cal_route ON kv_ksp_smart_rate_calendar(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_ksp_rate_cal_date ON kv_ksp_smart_rate_calendar(date);

-- 13. Vendor FBK ROI
CREATE TABLE IF NOT EXISTS kv_ksp_vendor_fbk_roi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  product_id UUID,
  period_start DATE,
  period_end DATE,
  units_sold INT DEFAULT 0,
  revenue DECIMAL(14,2) DEFAULT 0,
  storage_fees DECIMAL(14,2) DEFAULT 0,
  pick_pack_fees DECIMAL(14,2) DEFAULT 0,
  inbound_fees DECIMAL(14,2) DEFAULT 0,
  total_fbk_cost DECIMAL(14,2) DEFAULT 0,
  net_fbk_profit DECIMAL(14,2) DEFAULT 0,
  fbk_roi_percent DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_roi_vendor ON kv_ksp_vendor_fbk_roi(vendor_id);

-- 14. Bundle Suggestions
CREATE TABLE IF NOT EXISTS kv_ksp_bundle_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  product_a_id UUID,
  product_b_id UUID,
  co_purchase_rate DECIMAL(5,2),
  potential_saving_per_order DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_bundle_vendor ON kv_ksp_bundle_suggestions(vendor_id);

-- 15. Fuel Prices
CREATE TABLE IF NOT EXISTS kv_ksp_fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(10),
  city VARCHAR(100),
  fuel_type VARCHAR(20) DEFAULT 'petrol',
  price_per_litre DECIMAL(10,2),
  currency_code VARCHAR(10),
  source VARCHAR(100),
  recorded_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_fuel_location ON kv_ksp_fuel_prices(country_code, city);
CREATE INDEX IF NOT EXISTS idx_ksp_fuel_date ON kv_ksp_fuel_prices(recorded_at);

-- 16. Shipment Returns
CREATE TABLE IF NOT EXISTS kv_ksp_shipment_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_waybill VARCHAR(20),
  original_shipment_id UUID,
  reason TEXT,
  return_waybill VARCHAR(20),
  return_address TEXT,
  return_city VARCHAR(100),
  return_country VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  return_fee DECIMAL(12,2),
  covered_by_original BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_return_original ON kv_ksp_shipment_returns(original_waybill);

-- 17. Carbon Footprint
CREATE TABLE IF NOT EXISTS kv_ksp_carbon_footprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  account_id UUID,
  country_code VARCHAR(10),
  distance_km DECIMAL(10,2),
  weight_kg DECIMAL(10,3),
  co2_grams DECIMAL(12,2),
  carrier_used VARCHAR(50),
  service_level VARCHAR(20),
  offset_purchased BOOLEAN DEFAULT false,
  trees_planted INT DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ksp_carbon_account ON kv_ksp_carbon_footprints(account_id);
CREATE INDEX IF NOT EXISTS idx_ksp_carbon_date ON kv_ksp_carbon_footprints(calculated_at);
