-- ============================================================
-- KAUVEX COMMERCE CLOUD (KCC) — Phase 1: New Tables
-- ============================================================

-- 1.1 STOREFRONT EXTENSIONS
CREATE TABLE IF NOT EXISTS public.storefront_featured_products (
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  section TEXT DEFAULT 'featured',
  flash_sale_price DECIMAL(12,2),
  flash_sale_ends TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (storefront_id, product_id, section)
);

CREATE TABLE IF NOT EXISTS public.storefront_vendors (
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (storefront_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 VENDOR STORE SYSTEM
CREATE TABLE IF NOT EXISTS public.vendor_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE NOT NULL,
  store_type TEXT DEFAULT 'marketplace_seller',
  plan_type TEXT DEFAULT 'free',
  default_url TEXT NOT NULL,
  subdomain TEXT,
  custom_domain TEXT,
  active_domain TEXT,
  ssl_status TEXT DEFAULT 'pending',
  logo TEXT,
  banner TEXT,
  description TEXT,
  tagline TEXT,
  primary_color TEXT,
  accent_color TEXT,
  theme_id TEXT,
  meta_title TEXT,
  meta_description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  ship_on_time_rate DECIMAL(5,2) DEFAULT 0,
  account_health TEXT DEFAULT 'good',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID UNIQUE REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  grace_until TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.store_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  gateway_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_store_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.store_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  order_id TEXT,
  overall_rating INT NOT NULL,
  product_quality INT NOT NULL,
  delivery_speed INT NOT NULL,
  customer_service INT NOT NULL,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  product_views INT DEFAULT 0,
  add_to_cart INT DEFAULT 0,
  orders INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  followers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_store_id, date)
);

CREATE TABLE IF NOT EXISTS public.store_custom_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_store_id UUID REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 WAREHOUSE & FULFILLMENT
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'standard',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'active',
  is_pickup_point BOOLEAN DEFAULT false,
  is_dropoff_zone BOOLEAN DEFAULT false,
  operating_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warehouse_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  sku TEXT NOT NULL,
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_available INT DEFAULT 0,
  quantity_inbound INT DEFAULT 0,
  reorder_point INT DEFAULT 10,
  reorder_qty INT DEFAULT 50,
  bin_location TEXT,
  last_count_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  sku TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_number TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'inbound',
  status TEXT DEFAULT 'pending',
  origin_warehouse_id UUID REFERENCES public.warehouses(id),
  dest_warehouse_id UUID REFERENCES public.warehouses(id),
  order_id TEXT,
  vendor_id TEXT,
  carrier_id UUID,
  tracking_number TEXT,
  tracking_url TEXT,
  label_url TEXT,
  estimated_delivery TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  weight DECIMAL(10,2),
  dimensions JSONB,
  shipping_cost DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  sku TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_weight DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS public.shipping_carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  account_number TEXT,
  supports_real_time_rates BOOLEAN DEFAULT false,
  supports_tracking BOOLEAN DEFAULT true,
  supports_labels BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id UUID REFERENCES public.shipping_carriers(id) ON DELETE CASCADE,
  storefront_id UUID REFERENCES public.storefronts(id),
  name TEXT NOT NULL,
  min_weight DECIMAL(10,2),
  max_weight DECIMAL(10,2),
  min_order_value DECIMAL(12,2),
  max_order_value DECIMAL(12,2),
  countries TEXT[] DEFAULT '{}',
  price DECIMAL(12,2) NOT NULL,
  estimated_days INT,
  is_free BOOLEAN DEFAULT false,
  free_threshold DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id),
  name TEXT NOT NULL,
  carrier TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}',
  min_weight DECIMAL(10,2),
  max_weight DECIMAL(10,2),
  price DECIMAL(12,2) NOT NULL,
  free_threshold DECIMAL(12,2),
  estimated_days INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id);

-- 1.4 FULFILLMENT BY KAUVEX (FBK)
CREATE TABLE IF NOT EXISTS public.fbk_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT UNIQUE NOT NULL,
  vendor_store_id UUID UNIQUE REFERENCES public.vendor_stores(id),
  status TEXT DEFAULT 'pending',
  storage_limit DECIMAL(10,2),
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  pick_pack_fee DECIMAL(10,2) DEFAULT 0,
  storage_fee DECIMAL(10,2) DEFAULT 0,
  returns_fee DECIMAL(10,2) DEFAULT 0,
  approved_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fbk_inbound_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  status TEXT DEFAULT 'draft',
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fbk_inbound_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES public.fbk_inbound_plans(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  sku TEXT NOT NULL,
  quantity_shipped INT NOT NULL,
  quantity_received INT DEFAULT 0,
  condition TEXT DEFAULT 'new'
);

-- 1.5 KAUVEX ADS PLATFORM
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  budget DECIMAL(12,2) NOT NULL,
  budget_type TEXT DEFAULT 'daily',
  bid_amount DECIMAL(10,2) NOT NULL,
  bid_type TEXT DEFAULT 'cpc',
  target_type TEXT DEFAULT 'automatic',
  target_keywords TEXT[] DEFAULT '{}',
  target_categories TEXT[] DEFAULT '{}',
  target_storefronts TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_impressions INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_campaign_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  product_id TEXT,
  store_id TEXT,
  brand_id TEXT,
  ad_title TEXT,
  ad_body TEXT,
  image_url TEXT,
  target_url TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.ad_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  spend DECIMAL(12,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- 1.6 BUY BOX ENGINE
CREATE TABLE IF NOT EXISTS public.shared_catalog_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category_id TEXT,
  images TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_product_id UUID REFERENCES public.shared_catalog_products(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  inventory INT DEFAULT 0,
  fulfillment_type TEXT DEFAULT 'merchant',
  condition TEXT DEFAULT 'new',
  shipping_days INT DEFAULT 5,
  is_buy_box_winner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.buy_box_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_product_id UUID UNIQUE REFERENCES public.shared_catalog_products(id) ON DELETE CASCADE,
  vendor_offer_id UUID UNIQUE REFERENCES public.vendor_offers(id) ON DELETE CASCADE,
  win_score DECIMAL(5,2) NOT NULL,
  last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 TAX ENGINE
CREATE TABLE IF NOT EXISTS public.tax_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id),
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  state_code TEXT,
  tax_type TEXT NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  is_inclusive BOOLEAN DEFAULT false,
  applies_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tax_exemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  exemption_type TEXT NOT NULL,
  certificate TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 VENDOR SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.vendor_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_price DECIMAL(12,2) DEFAULT 0,
  annual_price DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  commission_rate DECIMAL(5,2) NOT NULL,
  max_products INT,
  max_storefronts INT DEFAULT 1,
  max_staff INT DEFAULT 1,
  allows_subdomain BOOLEAN DEFAULT false,
  allows_custom_domain BOOLEAN DEFAULT false,
  allows_fbk BOOLEAN DEFAULT false,
  allows_ads BOOLEAN DEFAULT false,
  allows_api BOOLEAN DEFAULT false,
  allows_white_label BOOLEAN DEFAULT false,
  allows_b2b BOOLEAN DEFAULT false,
  analytics_level TEXT DEFAULT 'basic',
  support_level TEXT DEFAULT 'standard',
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.vendor_plans(id),
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_plan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.vendor_plan_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  gateway_ref TEXT,
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  scope TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- 1.10 DISPUTE MESSAGES
CREATE TABLE IF NOT EXISTS public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.11 LOYALTY & REWARDS
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  storefront_id UUID REFERENCES public.storefronts(id),
  points_per_dollar DECIMAL(5,2) DEFAULT 1,
  dollar_per_point DECIMAL(10,4) DEFAULT 0.01,
  min_redeem_points INT DEFAULT 100,
  expiry_days INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INT NOT NULL,
  points_multiplier DECIMAL(3,1) DEFAULT 1,
  benefits JSONB DEFAULT '{}',
  badge_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  points INT NOT NULL,
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 ANALYTICS & BI
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  session_id TEXT,
  customer_id TEXT,
  storefront_id TEXT,
  vendor_id TEXT,
  product_id TEXT,
  order_id TEXT,
  campaign_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  country_code TEXT,
  device_type TEXT,
  metadata JSONB DEFAULT '{}',
  revenue DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_storefront ON public.analytics_events(storefront_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_customer ON public.analytics_events(customer_id, created_at);

CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  storefront_id TEXT,
  vendor_id TEXT,
  metric_type TEXT NOT NULL,
  value DECIMAL(14,2) DEFAULT 0,
  count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, storefront_id, vendor_id, metric_type)
);

CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  storefront_id TEXT,
  customer_id TEXT,
  results_count INT DEFAULT 0,
  clicked BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query, created_at);

-- 1.13 WHITE LABEL SAAS
CREATE TABLE IF NOT EXISTS public.white_label_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  plan TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  admin_domain TEXT UNIQUE NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  primary_color TEXT DEFAULT '#0A1628',
  accent_color TEXT DEFAULT '#FF6B00',
  custom_css TEXT,
  commission_share DECIMAL(5,2) DEFAULT 0,
  monthly_fee DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'active',
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.white_label_storefronts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.white_label_clients(id) ON DELETE CASCADE,
  storefront_id TEXT NOT NULL,
  is_white_labeled BOOLEAN DEFAULT true,
  hide_kauvex_brand BOOLEAN DEFAULT true,
  custom_footer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.14 MOBILE APP CONFIG
CREATE TABLE IF NOT EXISTS public.mobile_app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  version TEXT NOT NULL,
  build_number INT NOT NULL,
  is_force_update BOOLEAN DEFAULT false,
  min_supported_version TEXT,
  app_store_url TEXT,
  play_store_url TEXT,
  deep_link_scheme TEXT DEFAULT 'kauvex://',
  push_config JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  target_type TEXT NOT NULL,
  target_segment TEXT,
  target_user_id TEXT,
  storefront_id TEXT,
  deep_link TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.15 API KEYS & EXTERNAL ACCESS
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  rate_limit_per_min INT DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT NOT NULL,
  response_time INT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_requests_key_date ON public.api_requests(api_key_id, created_at);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  failure_count INT DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INT,
  response TEXT,
  success BOOLEAN NOT NULL,
  attempt_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CS-CART ADDON EQUIVALENTS
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INT DEFAULT 1,
  UNIQUE(bundle_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.back_in_stock_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL,
  variant_id TEXT,
  customer_id TEXT,
  email TEXT NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.gift_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  purchaser_id TEXT,
  recipient_email TEXT,
  message TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.call_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  preferred_time TEXT,
  product_id TEXT,
  vendor_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  commission DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  account_details JSONB DEFAULT '{}',
  gateway_ref TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT,
  email TEXT,
  storefront_id TEXT,
  items JSONB NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  recovery_sent BOOLEAN DEFAULT false,
  recovery_count INT DEFAULT 0,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT,
  session_id TEXT,
  product_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.digital_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  download_count INT DEFAULT 0,
  max_downloads INT DEFAULT 5,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.storefront_featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.storefront_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhooks ENABLE ROW LEVEL SECURITY;

-- Add new columns to existing storefronts table
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS catalog_mode BOOLEAN DEFAULT false;
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS age_verification BOOLEAN DEFAULT false;
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS min_age INT DEFAULT 18;

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
