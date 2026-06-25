-- Phase 15: Affiliate & Influencer Network
-- Migration 00017: kv_aff_* tables

-- ============================================================
-- AFFILIATE PARTNERS (core table)
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  tracking_id VARCHAR(50) UNIQUE,
  partner_type VARCHAR(20) NOT NULL DEFAULT 'associate',
  influencer_tier VARCHAR(20),
  display_name VARCHAR(200) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  banner_image_url TEXT,
  website_url TEXT,
  social_links JSONB,
  follower_counts JSONB,
  primary_platform VARCHAR(50),
  primary_audience_country VARCHAR(100),
  content_categories TEXT[],
  cookie_window_days INT DEFAULT 30,
  commission_tier VARCHAR(20) DEFAULT 'standard',
  custom_commission_override JSONB,
  payout_method VARCHAR(20),
  payout_details JSONB,
  payout_schedule VARCHAR(20) DEFAULT 'monthly',
  minimum_payout DECIMAL(10,2) DEFAULT 5000,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  confirmed_balance DECIMAL(10,2) DEFAULT 0,
  total_paid_out DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  suspension_reason TEXT,
  tax_withholding_rate DECIMAL(5,2) DEFAULT 0,
  onelink_enabled BOOLEAN DEFAULT false,
  api_access_enabled BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRACKING IDS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_tracking_ids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100),
  platform VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CLICKS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  tracking_id VARCHAR(50),
  product_id UUID,
  storefront_id UUID,
  referrer_url TEXT,
  landing_url TEXT,
  ip_hash VARCHAR(100),
  country_code VARCHAR(10),
  device_type VARCHAR(20),
  user_agent_category VARCHAR(50),
  is_self_click BOOLEAN DEFAULT false,
  is_fraudulent BOOLEAN DEFAULT false,
  commission_eligible BOOLEAN DEFAULT true,
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  tracking_id VARCHAR(50),
  order_id UUID,
  order_item_id UUID,
  product_id UUID,
  category_id UUID,
  storefront_id UUID,
  sale_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  bonus_rate DECIMAL(5,2) DEFAULT 0,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2),
  commission_type VARCHAR(20) DEFAULT 'product',
  status VARCHAR(20) DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT,
  payout_id UUID,
  is_fraudulent BOOLEAN DEFAULT false,
  fraud_flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BOUNTIES
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_bounties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  bounty_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  eligible_partner_types TEXT[],
  max_per_partner INT,
  max_total INT,
  used_count INT DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BOUNTY CLAIMS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_bounty_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  bounty_id UUID NOT NULL REFERENCES kv_aff_bounties(id),
  referred_entity_id UUID,
  referred_entity_type VARCHAR(30),
  amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROMOTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  promotion_type VARCHAR(30) NOT NULL,
  category_ids UUID[],
  bonus_rate DECIMAL(5,2) NOT NULL,
  eligible_partner_types TEXT[],
  banner_image_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PAYOUTS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  period_start DATE,
  period_end DATE,
  commission_amount DECIMAL(10,2),
  bounty_amount DECIMAL(10,2),
  reversal_amount DECIMAL(10,2),
  tax_withheld DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  payout_method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  gateway_reference VARCHAR(200),
  failure_reason TEXT,
  initiated_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STOREFRONTS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_storefronts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  custom_subdomain VARCHAR(100),
  custom_domain VARCHAR(200),
  banner_image_url TEXT,
  accent_color VARCHAR(10),
  follower_count INT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  auto_remove_out_of_stock BOOLEAN DEFAULT true,
  notify_price_drop_percent INT DEFAULT 20,
  notify_flash_sale BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storefront_id UUID NOT NULL REFERENCES kv_aff_storefronts(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STOREFRONT PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_storefront_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storefront_id UUID NOT NULL REFERENCES kv_aff_storefronts(id),
  collection_id UUID REFERENCES kv_aff_collections(id),
  product_id UUID NOT NULL,
  personal_note VARCHAR(140),
  personal_rating INT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  clicks INT DEFAULT 0,
  orders INT DEFAULT 0,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STOREFRONT FOLLOWERS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_storefront_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storefront_id UUID NOT NULL REFERENCES kv_aff_storefronts(id),
  customer_id UUID NOT NULL,
  followed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INFLUENCER DEALS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_influencer_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  product_ids UUID[] NOT NULL,
  discount_code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  influencer_commission_rate DECIMAL(5,2),
  max_uses INT,
  uses_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FRAUD LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_fraud_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES kv_aff_partners(id),
  fraud_type VARCHAR(50) NOT NULL,
  evidence JSONB,
  action_taken VARCHAR(50) NOT NULL,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- B2B CLIENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_b2b_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES kv_aff_partners(id),
  client_type VARCHAR(30) NOT NULL,
  client_entity_id UUID,
  referral_date TIMESTAMPTZ,
  first_payment_date TIMESTAMPTZ,
  recurring_commission_rate DECIMAL(5,2),
  recurring_commission_months INT,
  recurring_paid_months INT DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS kv_aff_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link_url TEXT,
  is_important BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- kv_aff_partners indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_partners_user_id ON kv_aff_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_partners_status ON kv_aff_partners(status);
CREATE INDEX IF NOT EXISTS idx_kv_aff_partners_partner_type ON kv_aff_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_partners_influencer_tier ON kv_aff_partners(influencer_tier);

-- kv_aff_tracking_ids indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_tracking_ids_partner ON kv_aff_tracking_ids(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_tracking_ids_is_primary ON kv_aff_tracking_ids(is_primary);
CREATE INDEX IF NOT EXISTS idx_kv_aff_tracking_ids_is_active ON kv_aff_tracking_ids(is_active);

-- kv_aff_clicks indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_partner ON kv_aff_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_tracking_id ON kv_aff_clicks(tracking_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_product ON kv_aff_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_storefront ON kv_aff_clicks(storefront_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_created ON kv_aff_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_kv_aff_clicks_commission_eligible ON kv_aff_clicks(commission_eligible);

-- kv_aff_commissions indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_commissions_partner ON kv_aff_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_commissions_order ON kv_aff_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_commissions_product ON kv_aff_commissions(product_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_commissions_status ON kv_aff_commissions(status);
CREATE INDEX IF NOT EXISTS idx_kv_aff_commissions_payout ON kv_aff_commissions(payout_id);

-- kv_aff_bounties indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounties_type ON kv_aff_bounties(bounty_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounties_active ON kv_aff_bounties(is_active);
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounties_dates ON kv_aff_bounties(start_date, end_date);

-- kv_aff_bounty_claims indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounty_claims_partner ON kv_aff_bounty_claims(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounty_claims_bounty ON kv_aff_bounty_claims(bounty_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_bounty_claims_status ON kv_aff_bounty_claims(status);

-- kv_aff_promotions indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_promotions_type ON kv_aff_promotions(promotion_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_promotions_active ON kv_aff_promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_kv_aff_promotions_dates ON kv_aff_promotions(start_date, end_date);

-- kv_aff_payouts indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_payouts_partner ON kv_aff_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_payouts_status ON kv_aff_payouts(status);
CREATE INDEX IF NOT EXISTS idx_kv_aff_payouts_period ON kv_aff_payouts(period_start, period_end);

-- kv_aff_storefronts indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_storefronts_partner ON kv_aff_storefronts(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_storefronts_published ON kv_aff_storefronts(is_published);

-- kv_aff_collections indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_collections_storefront ON kv_aff_collections(storefront_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_collections_published ON kv_aff_collections(is_published);
CREATE INDEX IF NOT EXISTS idx_kv_aff_collections_sort ON kv_aff_collections(sort_order);

-- kv_aff_storefront_products indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_products_storefront ON kv_aff_storefront_products(storefront_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_products_collection ON kv_aff_storefront_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_products_product ON kv_aff_storefront_products(product_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_products_featured ON kv_aff_storefront_products(is_featured);

-- kv_aff_storefront_followers indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_followers_storefront ON kv_aff_storefront_followers(storefront_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_sf_followers_customer ON kv_aff_storefront_followers(customer_id);

-- kv_aff_influencer_deals indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_influencer_deals_vendor ON kv_aff_influencer_deals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_influencer_deals_partner ON kv_aff_influencer_deals(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_influencer_deals_status ON kv_aff_influencer_deals(status);
CREATE INDEX IF NOT EXISTS idx_kv_aff_influencer_deals_code ON kv_aff_influencer_deals(discount_code);

-- kv_aff_fraud_log indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_fraud_log_partner ON kv_aff_fraud_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_fraud_log_type ON kv_aff_fraud_log(fraud_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_fraud_log_action ON kv_aff_fraud_log(action_taken);

-- kv_aff_b2b_clients indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_b2b_clients_partner ON kv_aff_b2b_clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_b2b_clients_type ON kv_aff_b2b_clients(client_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_b2b_clients_status ON kv_aff_b2b_clients(status);

-- kv_aff_notifications indexes
CREATE INDEX IF NOT EXISTS idx_kv_aff_notifications_partner ON kv_aff_notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_kv_aff_notifications_type ON kv_aff_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_kv_aff_notifications_read ON kv_aff_notifications(is_read);

-- ============================================================
-- DISABLE RLS ON ALL PHASE 15 TABLES (internal management tables)
-- ============================================================

ALTER TABLE kv_aff_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_tracking_ids DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_bounties DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_bounty_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_payouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_storefronts DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_storefront_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_storefront_followers DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_influencer_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_fraud_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_b2b_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_aff_notifications DISABLE ROW LEVEL SECURITY;
