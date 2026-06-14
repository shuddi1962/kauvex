-- KAUVEX COMMERCE CLOUD v4
-- Section 59-84: Payments, Ads, AI, Analytics, Mobile, Security, White Label
-- Phase 4 migration: New tables + enhancements for full platform

-- ============================================================
-- SECTION 59-61: ADS PLATFORM ENHANCEMENTS
-- ============================================================

-- Ad creative assets table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  cta TEXT,
  dimensions TEXT,
  file_size INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ad targeting rules
CREATE TABLE IF NOT EXISTS ad_targeting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  rule_value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ad placements inventory
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dimensions TEXT,
  max_bid DECIMAL(12,2) DEFAULT 0,
  min_bid DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed ad placements
INSERT INTO ad_placements (placement_code, name, description, dimensions) VALUES
  ('search_results_top', 'Search Results Top', 'Top of search results page', '728x90'),
  ('search_results_mid', 'Search Results Mid', 'Middle of search results', '728x90'),
  ('homepage_banner', 'Homepage Banner', 'Main homepage banner', '1200x400'),
  ('homepage_sidebar', 'Homepage Sidebar', 'Homepage right sidebar', '300x250'),
  ('category_banner', 'Category Banner', 'Category page top banner', '1200x200'),
  ('product_detail', 'Product Detail', 'Below product description', '728x90'),
  ('product_recommendation', 'Product Recommendation', 'In recommendation carousel', '300x300'),
  ('cart_page', 'Cart Page', 'Shopping cart page', '728x90'),
  ('checkout_sidebar', 'Checkout Sidebar', 'Checkout page sidebar', '300x250'),
  ('flash_deal', 'Flash Deal', 'Flash deal section', '600x400'),
  ('video_ad', 'Video Ad Placement', 'Video advertisement slot', '1920x1080')
ON CONFLICT (placement_code) DO NOTHING;

-- ============================================================
-- SECTION 62-64: PAYMENT SYSTEM ENHANCEMENTS
-- ============================================================

-- Payment gateway configurations
CREATE TABLE IF NOT EXISTS payment_gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_code TEXT UNIQUE NOT NULL,
  gateway_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  supported_currencies TEXT[] DEFAULT '{}',
  fee_percentage DECIMAL(5,2) DEFAULT 0,
  fee_fixed DECIMAL(12,2) DEFAULT 0,
  min_amount DECIMAL(12,2) DEFAULT 0,
  max_amount DECIMAL(12,2) DEFAULT 9999999,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed payment gateways
INSERT INTO payment_gateway_configs (gateway_code, gateway_name, is_active, supported_currencies, fee_percentage) VALUES
  ('stripe', 'Stripe', true, '{USD,GBP,EUR,CAD,AED}', 2.9),
  ('paystack', 'Paystack', true, '{NGN,USD,GBP}', 1.5),
  ('flutterwave', 'Flutterwave', true, '{NGN,USD,GBP,EUR,KES,GHS,ZAR}', 1.4),
  ('paypal', 'PayPal', true, '{USD,GBP,EUR,CAD,AUD}', 3.5),
  ('apple_pay', 'Apple Pay', false, '{USD,GBP,EUR,CAD}', 0),
  ('google_pay', 'Google Pay', false, '{USD,GBP,EUR,CAD}', 0),
  ('bank_transfer', 'Bank Transfer', true, '{NGN,USD,GBP,EUR}', 0)
ON CONFLICT (gateway_code) DO NOTHING;

-- Multi-currency exchange rates history
CREATE TABLE IF NOT EXISTS exchange_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate DECIMAL(14,6) NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Currency auto-detection rules
CREATE TABLE IF NOT EXISTS currency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID REFERENCES storefronts(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
// SECTION 65: ESCROW ENHANCEMENTS
-- ============================================================

ALTER TABLE escrow_payments ADD COLUMN IF NOT EXISTS release_after_days INT DEFAULT 7;
ALTER TABLE escrow_payments ADD COLUMN IF NOT EXISTS return_period_days INT DEFAULT 14;
ALTER TABLE escrow_payments ADD COLUMN IF NOT EXISTS auto_release BOOLEAN DEFAULT true;

-- ============================================================
-- SECTION 66-67: WALLET ENHANCEMENTS
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Wallet withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'customer')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method TEXT NOT NULL,
  account_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 68: PAYOUT SCHEDULES
-- ============================================================

CREATE TABLE IF NOT EXISTS payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'manual')),
  day_of_week INT DEFAULT 1,
  day_of_month INT DEFAULT 1,
  min_amount DECIMAL(12,2) DEFAULT 0,
  method TEXT DEFAULT 'bank_transfer',
  account_details JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_payout_at TIMESTAMPTZ,
  next_payout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 69: LOYALTY SYSTEM ENHANCEMENTS
-- ============================================================

ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS login_points INT DEFAULT 5;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS social_share_points INT DEFAULT 10;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS vendor_follow_points INT DEFAULT 15;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS review_points INT DEFAULT 25;

-- Loyalty rewards catalog
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value DECIMAL(12,2),
  image_url TEXT,
  stock INT DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed loyalty rewards
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, reward_value) VALUES
  ('Free Shipping', 'Free shipping on your next order', 200, 'shipping', 0),
  ('₦1,000 Store Credit', '₦1,000 credit for any purchase', 100, 'credit', 1000),
  ('₦3,000 Store Credit', '₦3,000 credit for any purchase', 250, 'credit', 3000),
  ('₦7,000 Store Credit', '₦7,000 credit for any purchase', 500, 'credit', 7000),
  ('₦15,000 Store Credit', '₦15,000 credit for any purchase', 1000, 'credit', 15000),
  ('10% Discount Coupon', '10% off your next order', 300, 'coupon', 10),
  ('Priority Support', 'Priority customer support for 30 days', 150, 'service', 0),
  ('Early Access Pass', 'Early access to flash deals and new arrivals', 100, 'service', 0),
  ('VIP Gift Box', 'Exclusive Kauvex branded gift box', 2000, 'physical', 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 70: REFERRAL SYSTEM ENHANCEMENTS
-- ============================================================

ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS repeat_purchase_bonus DECIMAL(12,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_bonus DECIMAL(12,2) DEFAULT 10,
  purchase_commission_percent DECIMAL(5,2) DEFAULT 5,
  repeat_purchase_bonus DECIMAL(12,2) DEFAULT 5,
  max_payout DECIMAL(12,2) DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO referral_settings (signup_bonus, purchase_commission_percent, repeat_purchase_bonus, max_payout)
VALUES (10, 5, 5, 1000)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 71-74: AI COMMERCE ENGINE
-- ============================================================

-- AI generation history
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  model TEXT DEFAULT 'openrouter',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI fraud detection rules
CREATE TABLE IF NOT EXISTS fraud_detection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  rule_config JSONB NOT NULL DEFAULT '{}',
  risk_weight DECIMAL(5,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  auto_action TEXT DEFAULT 'flag',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed fraud detection rules
INSERT INTO fraud_detection_rules (rule_name, rule_type, rule_config, risk_weight, auto_action) VALUES
  ('High Value Order', 'threshold', '{"min_amount": 1000000}', 0.3, 'flag'),
  ('Multiple Accounts Same IP', 'pattern', '{"max_accounts": 3, "time_window_hours": 24}', 0.5, 'flag'),
  ('Rapid Fire Orders', 'pattern', '{"max_orders": 5, "time_window_minutes": 30}', 0.4, 'flag'),
  ('Temp Email Domain', 'pattern', '{"domains": ["tempmail.com","throwaway.com","mailinator.com"]}', 0.7, 'block'),
  ('Address Mismatch', 'pattern', '{"require_matching": true}', 0.3, 'flag'),
  ('Chargeback History', 'threshold', '{"max_chargebacks": 2}', 0.8, 'block'),
  ('Coupon Abuse', 'pattern', '{"max_per_customer": 5}', 0.4, 'flag')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 75-76: ANALYTICS & REPORTING
-- ============================================================

-- Saved reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  report_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  schedule TEXT,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Export history
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL,
  file_url TEXT,
  file_size INT DEFAULT 0,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 77: MOBILE APP API CONFIG
-- ============================================================

CREATE TABLE IF NOT EXISTS mobile_api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_type TEXT NOT NULL CHECK (app_type IN ('customer', 'vendor', 'warehouse', 'driver', 'admin')),
  endpoint_path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  description TEXT,
  auth_required BOOLEAN DEFAULT true,
  rate_limit INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Device registration for push notifications
CREATE TABLE IF NOT EXISTS device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  app_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 78: API PLATFORM
-- ============================================================

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  requests_count INT DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT now(),
  window_duration_seconds INT DEFAULT 3600,
  max_requests INT DEFAULT 1000
);

-- Webhook events log
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  response_code INT,
  response_body TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 79-81: SECURITY ENHANCEMENTS
-- ============================================================

-- User sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT now(),
  logged_in_at TIMESTAMPTZ DEFAULT now(),
  logged_out_at TIMESTAMPTZ
);

-- Login attempts for monitoring
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security policies
CREATE TABLE IF NOT EXISTS security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT UNIQUE NOT NULL,
  policy_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed security policies
INSERT INTO security_policies (policy_name, policy_config) VALUES
  ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_number": true, "require_special": true, "max_age_days": 90}'),
  ('login_policy', '{"max_attempts": 5, "lockout_minutes": 15, "require_2fa": false}'),
  ('session_policy', '{"max_concurrent_sessions": 5, "session_timeout_minutes": 60, "require_device_verification": false}'),
  ('ip_whitelist', '{"enabled": false, "allowed_ips": []}')
ON CONFLICT (policy_name) DO NOTHING;

-- ============================================================
-- SECTION 82: WHITE LABEL SAAS
-- ============================================================

CREATE TABLE IF NOT EXISTS white_label_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES white_label_clients(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  ssl_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS white_label_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES white_label_clients(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#0A1628',
  secondary_color TEXT DEFAULT '#FF6B00',
  font_family TEXT DEFAULT 'Inter',
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 84: DEPLOYMENT & SCALABILITY
-- ============================================================

-- Cache invalidation tracking
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  cache_region TEXT DEFAULT 'global',
  invalidated_at TIMESTAMPTZ DEFAULT now()
);

-- Background job tracking
CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  job_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_date ON ad_metrics(campaign_id, date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON payment_transactions(gateway_ref);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_status ON escrow_payments(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user ON device_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook ON webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user ON saved_reports(user_id);
