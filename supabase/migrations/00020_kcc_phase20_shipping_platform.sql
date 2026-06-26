-- ============================================================
-- PHASE 20: Kauvex Shipping Platform (KSP) — Additional Tables
-- ============================================================
-- Existing tables (already in schema):
--   kv_ksp_express_accounts, kv_ksp_team_members, kv_ksp_lockers,
--   kv_ksp_locker_compartments, kv_ksp_locker_bookings,
--   kv_ksp_wms_integrations, kv_ksp_cargo_photos,
--   kv_ksp_delivery_confidence, kv_ksp_geofence_alerts,
--   kv_ksp_platform_events, kv_ksp_smart_rate_calendar,
--   kv_ksp_vendor_fbk_roi, kv_ksp_bundle_suggestions,
--   kv_ksp_fuel_prices, kv_ksp_shipment_returns,
--   kv_ksp_carbon_footprints, kv_glx_countries, kv_glx_country_carriers,
--   kv_glx_rate_cards, kv_glx_packaging_fees, kv_glx_partner_countries,
--   kv_glx_jobs_extended, kv_glx_cod_collections,
--   kv_glx_what3words_locations, kv_glx_compliance_log
-- ============================================================

-- 1. Saved Addresses
CREATE TABLE IF NOT EXISTS kv_ksp_saved_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  label         TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT,
  postcode      TEXT,
  country_code  TEXT NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  latitude      DECIMAL(10, 7),
  longitude     DECIMAL(10, 7),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_saved_addr_user ON kv_ksp_saved_addresses(user_id);
CREATE INDEX idx_kv_ksp_saved_addr_country ON kv_ksp_saved_addresses(country_code);
CREATE INDEX idx_kv_ksp_saved_addr_default ON kv_ksp_saved_addresses(user_id, is_default) WHERE is_default = true;

-- 2. Shipment Templates
CREATE TABLE IF NOT EXISTS kv_ksp_shipment_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  name            TEXT NOT NULL,
  pickup_address  JSONB NOT NULL DEFAULT '{}',
  dropoff_address JSONB NOT NULL DEFAULT '{}',
  package_weight  DECIMAL(8, 2),
  package_length  DECIMAL(8, 2),
  package_width   DECIMAL(8, 2),
  package_height  DECIMAL(8, 2),
  package_type    TEXT DEFAULT 'parcel',
  service_tier    TEXT DEFAULT 'standard',
  instructions    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_template_user ON kv_ksp_shipment_templates(user_id);

-- 3. Recurring Shipments
CREATE TABLE IF NOT EXISTS kv_ksp_recurring_shipments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES kv_ksp_shipment_templates(id) ON DELETE CASCADE,
  frequency   TEXT NOT NULL DEFAULT 'weekly',
  next_date   DATE NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_recurring_user ON kv_ksp_recurring_shipments(user_id);
CREATE INDEX idx_kv_ksp_recurring_next ON kv_ksp_recurring_shipments(next_date) WHERE is_active = true;
CREATE INDEX idx_kv_ksp_recurring_template ON kv_ksp_recurring_shipments(template_id);

-- 4. Bulk Uploads
CREATE TABLE IF NOT EXISTS kv_ksp_bulk_uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  file_url        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  total_rows      INT NOT NULL DEFAULT 0,
  processed_rows  INT NOT NULL DEFAULT 0,
  error_rows      INT NOT NULL DEFAULT 0,
  error_log       JSONB,
  upload_type     TEXT DEFAULT 'shipments',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_kv_ksp_bulk_user ON kv_ksp_bulk_uploads(user_id);
CREATE INDEX idx_kv_ksp_bulk_status ON kv_ksp_bulk_uploads(status);

-- 5. API Keys (KSP-specific)
CREATE TABLE IF NOT EXISTS kv_ksp_api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,
  key_prefix  TEXT NOT NULL,
  name        TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limit  INT NOT NULL DEFAULT 100,
  last_used_at TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_apikeys_user ON kv_ksp_api_keys(user_id);
CREATE INDEX idx_kv_ksp_apikeys_prefix ON kv_ksp_api_keys(key_prefix);
CREATE INDEX idx_kv_ksp_apikeys_active ON kv_ksp_api_keys(is_active) WHERE is_active = true;

-- 6. Notifications
CREATE TABLE IF NOT EXISTS kv_ksp_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  data        JSONB NOT NULL DEFAULT '{}',
  channel     TEXT DEFAULT 'in_app',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_notif_user ON kv_ksp_notifications(user_id);
CREATE INDEX idx_kv_ksp_notif_unread ON kv_ksp_notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_kv_ksp_notif_created ON kv_ksp_notifications(created_at DESC);

-- 7. Payment Methods
CREATE TABLE IF NOT EXISTS kv_ksp_payment_methods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  provider    TEXT NOT NULL,
  last_four   TEXT NOT NULL,
  token       TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_paymethod_user ON kv_ksp_payment_methods(user_id);
CREATE INDEX idx_kv_ksp_paymethod_default ON kv_ksp_payment_methods(user_id, is_default) WHERE is_default = true;

-- 8. Fuel Stations
CREATE TABLE IF NOT EXISTS kv_ksp_fuel_stations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  city          TEXT NOT NULL,
  country_code  TEXT NOT NULL,
  latitude      DECIMAL(10, 7) NOT NULL,
  longitude     DECIMAL(10, 7) NOT NULL,
  fuel_type     TEXT NOT NULL DEFAULT 'petrol',
  price         DECIMAL(10, 2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_fuel_country ON kv_ksp_fuel_stations(country_code);
CREATE INDEX idx_kv_ksp_fuel_city ON kv_ksp_fuel_stations(city);
CREATE INDEX idx_kv_ksp_fuel_coords ON kv_ksp_fuel_stations(latitude, longitude);
CREATE INDEX idx_kv_ksp_fuel_type ON kv_ksp_fuel_stations(fuel_type);

-- 9. Delivery Alerts
CREATE TABLE IF NOT EXISTS kv_ksp_delivery_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  shipment_id  UUID,
  alert_type   TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  severity     TEXT DEFAULT 'info',
  action_url   TEXT,
  data         JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kv_ksp_alert_user ON kv_ksp_delivery_alerts(user_id);
CREATE INDEX idx_kv_ksp_alert_unread ON kv_ksp_delivery_alerts(user_id, read) WHERE read = false;
CREATE INDEX idx_kv_ksp_alert_shipment ON kv_ksp_delivery_alerts(shipment_id);
CREATE INDEX idx_kv_ksp_alert_type ON kv_ksp_delivery_alerts(alert_type);

-- ============================================================
-- RLS Policies (Row Level Security)
-- ============================================================

ALTER TABLE kv_ksp_saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_shipment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_recurring_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_ksp_delivery_alerts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own saved addresses
CREATE POLICY "Users manage own saved addresses" ON kv_ksp_saved_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own shipment templates
CREATE POLICY "Users manage own templates" ON kv_ksp_shipment_templates
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own recurring shipments
CREATE POLICY "Users manage own recurring" ON kv_ksp_recurring_shipments
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own bulk uploads
CREATE POLICY "Users manage own bulk uploads" ON kv_ksp_bulk_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own API keys
CREATE POLICY "Users manage own api keys" ON kv_ksp_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Users can read their own notifications
CREATE POLICY "Users read own notifications" ON kv_ksp_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON kv_ksp_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own payment methods
CREATE POLICY "Users manage own payment methods" ON kv_ksp_payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Fuel stations are public read
CREATE POLICY "Public read fuel stations" ON kv_ksp_fuel_stations
  FOR SELECT USING (true);

CREATE POLICY "Admin manage fuel stations" ON kv_ksp_fuel_stations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read their own delivery alerts
CREATE POLICY "Users read own delivery alerts" ON kv_ksp_delivery_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own delivery alerts" ON kv_ksp_delivery_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Triggers for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION kv_ksp_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kv_ksp_saved_addresses_updated
  BEFORE UPDATE ON kv_ksp_saved_addresses
  FOR EACH ROW EXECUTE FUNCTION kv_ksp_update_timestamp();

CREATE TRIGGER trg_kv_ksp_shipment_templates_updated
  BEFORE UPDATE ON kv_ksp_shipment_templates
  FOR EACH ROW EXECUTE FUNCTION kv_ksp_update_timestamp();

CREATE TRIGGER trg_kv_ksp_recurring_shipments_updated
  BEFORE UPDATE ON kv_ksp_recurring_shipments
  FOR EACH ROW EXECUTE FUNCTION kv_ksp_update_timestamp();

CREATE TRIGGER trg_kv_ksp_payment_methods_updated
  BEFORE UPDATE ON kv_ksp_payment_methods
  FOR EACH ROW EXECUTE FUNCTION kv_ksp_update_timestamp();

-- ============================================================
-- Seed: Sample fuel stations (Lagos, Abuja, PH)
-- ============================================================

INSERT INTO kv_ksp_fuel_stations (name, city, country_code, latitude, longitude, fuel_type, price, currency_code)
VALUES
  ('NNPC Mega Station Victoria Island', 'Lagos', 'NG', 6.4281, 3.4219, 'petrol', 617.00, 'NGN'),
  ('TotalEnergies Lekki Phase 1', 'Lagos', 'NG', 6.4474, 3.4639, 'petrol', 620.00, 'NGN'),
  ('Mobil Marina Lagos', 'Lagos', 'NG', 6.4541, 3.3947, 'diesel', 750.00, 'NGN'),
  ('Oando Wuse Zone 5', 'Abuja', 'NG', 9.0579, 7.4951, 'petrol', 617.00, 'NGN'),
  ('TotalEnergies Maitama', 'Abuja', 'NG', 9.0765, 7.4924, 'petrol', 622.00, 'NGN'),
  ('NNPC Trans-Amadi Road', 'Port Harcourt', 'NG', 4.7846, 7.0235, 'petrol', 617.00, 'NGN'),
  ('Fortis Oil GRA Phase 3', 'Port Harcourt', 'NG', 4.7970, 7.0063, 'diesel', 745.00, 'NGN')
ON CONFLICT DO NOTHING;
