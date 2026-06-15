-- KAUVEX COMMERCE CLOUD (KCC) V3 — New Tables
-- All models after credit_lines from Prisma schema
-- Generated from schema.prisma (lines 3048-3766)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- LOCAL SUPPLIER PORTAL (Part 11)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.local_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  categories TEXT[] DEFAULT '{}',
  coverage_type TEXT DEFAULT 'state',
  delivery_method TEXT,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  bank_account_name TEXT,
  status TEXT DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 8.00,
  verification_docs JSONB DEFAULT '{}',
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.local_suppliers(id) ON DELETE CASCADE,
  internal_product_id TEXT,
  supplier_sku TEXT,
  supplier_price DECIMAL(10,2),
  kauvex_price DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.local_suppliers(id),
  order_id TEXT,
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  courier_name TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.local_suppliers(id) ON DELETE CASCADE,
  country TEXT,
  state TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.supplier_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.local_suppliers(id),
  period_start DATE,
  period_end DATE,
  gross_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  gateway_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  notification_type TEXT,
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PRODUCT SOURCING MODULE (Part 12)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sourcing_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT,
  category TEXT,
  estimated_price DECIMAL(10,2),
  estimated_cost DECIMAL(10,2),
  margin_percent DECIMAL(5,2),
  demand_score INT,
  competition_level TEXT,
  recommended_channel TEXT,
  status TEXT DEFAULT 'research',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sourcing_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID,
  supplier_name TEXT,
  country TEXT,
  product_name TEXT,
  price_quoted DECIMAL(10,2),
  moq INT,
  lead_time TEXT,
  sample_status TEXT,
  contract_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sourcing_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID,
  internal_product_id TEXT,
  supplier_id TEXT,
  go_live_date DATE,
  first_batch_qty INT,
  status TEXT DEFAULT 'sourcing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sourcing_ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE,
  trending_products JSONB DEFAULT '[]',
  declining_products JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  summary TEXT,
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_ref TEXT UNIQUE,
  customer_id TEXT,
  product_name TEXT,
  description TEXT,
  reference_image_url TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  quantity INT DEFAULT 1,
  urgency TEXT DEFAULT 'normal',
  willing_to_prepay BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  ai_search_result JSONB DEFAULT '{}',
  assigned_to TEXT,
  admin_notes TEXT,
  listed_product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.request_vendor_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.product_requests(id) ON DELETE CASCADE,
  vendor_id TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  delivery_days INT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.request_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.product_requests(id) ON DELETE CASCADE,
  update_type TEXT,
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PRINT ON DEMAND (Part 18)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pod_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT,
  name TEXT,
  description TEXT,
  design_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_marketplace BOOLEAN DEFAULT false,
  license_price DECIMAL(10,2),
  license_count INT DEFAULT 0,
  artwork_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pod_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT,
  design_id UUID REFERENCES public.pod_designs(id),
  product_type TEXT,
  fulfillment_partner TEXT,
  external_product_id TEXT,
  variants JSONB DEFAULT '[]',
  retail_price DECIMAL(10,2),
  base_cost DECIMAL(10,2),
  vendor_profit DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pod_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  pod_product_id UUID REFERENCES public.pod_products(id),
  fulfillment_partner TEXT,
  external_order_id TEXT,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.design_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.pod_designs(id),
  buyer_vendor_id TEXT,
  price_paid DECIMAL(10,2),
  designer_earning DECIMAL(10,2),
  kauvex_commission DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- VENDOR DROPSHIPPING MARKETPLACE (Part 29)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vendor_dropship_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT,
  source TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  source_account_id TEXT,
  source_account_name TEXT,
  status TEXT DEFAULT 'active',
  compliance_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_dropship_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT,
  source TEXT,
  source_product_id TEXT,
  internal_product_id TEXT,
  source_price DECIMAL(10,2),
  vendor_price DECIMAL(10,2),
  markup_percent DECIMAL(5,2),
  shared_catalog_id TEXT,
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_dropship_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  vendor_id TEXT,
  dropship_product_id UUID,
  source TEXT,
  source_order_id TEXT,
  source_status TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  kauvex_dropship_fee DECIMAL(10,2),
  vendor_profit DECIMAL(10,2),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SHARED SOURCES (AliExpress)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.aliexpress_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aliexpress_product_id TEXT UNIQUE,
  supplier_price DECIMAL(10,2),
  last_price_sync TIMESTAMP WITH TIME ZONE,
  last_stock_sync TIMESTAMP WITH TIME ZONE,
  stock_status TEXT,
  shipping_methods JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aliexpress_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kauvex_order_id TEXT,
  aliexpress_order_id TEXT,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- LIVE COMMERCE (Part 19.1)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.live_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT,
  user_id TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT,
  sender_id TEXT,
  gift_type TEXT,
  gift_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT,
  peak_viewers INT DEFAULT 0,
  total_viewers INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GROUP BUY (Part 19.3)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.group_buys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT,
  variant_id TEXT,
  regular_price DECIMAL(10,2),
  group_price DECIMAL(10,2),
  target_count INT DEFAULT 5,
  current_count INT DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_buy_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_buy_id UUID NOT NULL REFERENCES public.group_buys(id) ON DELETE CASCADE,
  user_id TEXT,
  order_id TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PRICE HISTORY & DEAL ALERTS (Part 19.6)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT,
  variant_id TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  product_id TEXT,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTION BOXES (Part 19.10)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.box_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT,
  box_name TEXT,
  shipment_date DATE,
  products JSONB DEFAULT '[]',
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- KAUVEX ORIGINALS (Part 19.13)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.kauvex_originals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT,
  manufacturer_id TEXT,
  original_cost DECIMAL(10,2),
  retail_price DECIMAL(10,2),
  margin_percent DECIMAL(5,2),
  monthly_sales INT DEFAULT 0,
  status TEXT DEFAULT 'candidate',
  launched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- VENDOR MENTORSHIP (Part 19.8)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id TEXT,
  mentee_id TEXT,
  topic TEXT,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  mentor_earning DECIMAL(10,2),
  kauvex_commission DECIMAL(10,2),
  rating INT,
  review TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CARBON OFFSETS (Part 19.14)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carbon_offsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  customer_id TEXT,
  co2_estimate DECIMAL(10,2),
  offset_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  trees_planted INT DEFAULT 0,
  partner_ngo TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- COMPETITION INTELLIGENCE (Part 19.7)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.competitor_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT,
  competitor_name TEXT,
  competitor_url TEXT,
  monitored_products JSONB DEFAULT '[]',
  last_scan_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.competitor_price_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id TEXT,
  product_name TEXT,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ART & NFT MARKETPLACE (Part 30)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.art_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  preview_url TEXT,
  file_url TEXT,
  file_type TEXT,
  mode TEXT DEFAULT 'A',
  is_limited_edition BOOLEAN DEFAULT false,
  edition_size INT,
  edition_sold INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.art_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.art_listings(id) ON DELETE CASCADE,
  license_type TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS public.art_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.art_listings(id),
  license_id UUID REFERENCES public.art_licenses(id),
  buyer_id TEXT,
  order_id TEXT,
  price_paid DECIMAL(10,2),
  creator_earning DECIMAL(10,2),
  kauvex_commission DECIMAL(10,2),
  license_certificate_url TEXT,
  download_url TEXT,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mode B (NFT)

CREATE TABLE IF NOT EXISTS public.nft_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT,
  token_standard TEXT,
  contract_address TEXT,
  token_id TEXT,
  blockchain TEXT DEFAULT 'polygon',
  ipfs_metadata_uri TEXT,
  ipfs_media_uri TEXT,
  royalty_percent DECIMAL(5,2),
  minted_at TIMESTAMP WITH TIME ZONE,
  current_owner_wallet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nft_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT,
  sale_type TEXT,
  price DECIMAL(20,8),
  currency TEXT,
  seller_wallet TEXT,
  buyer_wallet TEXT,
  royalty_paid DECIMAL(20,8),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nft_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT,
  starting_price DECIMAL(20,8),
  reserve_price DECIMAL(20,8),
  current_bid DECIMAL(20,8),
  current_bidder_wallet TEXT,
  ends_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creator_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT UNIQUE,
  wallet_address TEXT,
  wallet_type TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
