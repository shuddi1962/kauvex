-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users / Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('super-admin','store-manager','accountant','marketing-manager','technical-team','customer-support','content-editor','vendor','customer')),
  vendor_id UUID,
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze','silver','gold','platinum')),
  loyalty_points INT DEFAULT 0,
  wallet_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  UNIQUE(category_id, slug)
);

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'simple' CHECK (type IN ('simple','variable','digital','service','bundle')),
  sku TEXT,
  short_description TEXT,
  long_description TEXT,
  category_id UUID REFERENCES public.categories(id),
  brand_id UUID REFERENCES public.brands(id),
  regular_price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  vendor_id UUID,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Inventory
CREATE TABLE IF NOT EXISTS public.product_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  backorder_enabled BOOLEAN DEFAULT false
);

-- Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,
  shop_description TEXT,
  shop_logo TEXT,
  shop_banner TEXT,
  vendor_tier TEXT DEFAULT 'bronze' CHECK (vendor_tier IN ('bronze','silver','gold','platinum','official_brand','kauvex_direct')),
  commission DECIMAL(5,2) DEFAULT 10,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended','rejected')),
  rating DECIMAL(2,1) DEFAULT 0,
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  positive_feedback DECIMAL(5,2) DEFAULT 100,
  response_rate DECIMAL(5,2) DEFAULT 100,
  ship_on_time_rate DECIMAL(5,2) DEFAULT 100,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','confirmed','packed','dispatched','in-transit','delivered','completed','cancelled','refunded','on-hold')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded','partial-refund')),
  currency TEXT DEFAULT 'USD',
  storefront_id UUID,
  shipping_address JSONB,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_info TEXT,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  cj_order_id TEXT,
  cj_status TEXT
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storefronts
CREATE TABLE IF NOT EXISTS public.storefronts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain_type TEXT NOT NULL CHECK (domain_type IN ('subdomain','custom_domain')),
  subdomain TEXT,
  custom_domain TEXT,
  active_domain TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  language_code TEXT DEFAULT 'en',
  country_code TEXT,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_label TEXT,
  tax_inclusive BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CJDropshipping
CREATE TABLE IF NOT EXISTS public.cj_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cj_product_id TEXT UNIQUE,
  cj_sku TEXT,
  internal_product_id UUID REFERENCES public.products(id),
  supplier_price DECIMAL(10,2),
  kauvex_price DECIMAL(10,2),
  markup_percent DECIMAL(5,2),
  last_price_sync TIMESTAMP WITH TIME ZONE,
  last_stock_sync TIMESTAMP WITH TIME ZONE,
  stock_status TEXT,
  cj_category TEXT,
  shipping_methods JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES public.vendors(id),
  type TEXT CHECK (type IN ('not_received','not_as_described','damaged','wrong_item')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','resolved_buyer','resolved_vendor','escalated')),
  description TEXT,
  customer_evidence JSONB,
  vendor_response TEXT,
  vendor_evidence JSONB,
  admin_decision TEXT,
  admin_notes TEXT,
  refund_amount DECIMAL(10,2),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE
);

-- Exchange Rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  rates JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storefront Banners
CREATE TABLE IF NOT EXISTS public.storefront_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  headline TEXT,
  subtext TEXT,
  cta_text TEXT,
  cta_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- Affiliate Links
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- RLS Policies: Products
DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "products_select_admin" ON public.products;
CREATE POLICY "products_select_admin" ON public.products FOR SELECT USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "products_insert_vendor" ON public.products;
CREATE POLICY "products_insert_vendor" ON public.products FOR INSERT WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "products_update_vendor" ON public.products;
CREATE POLICY "products_update_vendor" ON public.products FOR UPDATE USING (auth.role() = 'service_role');

-- RLS Policies: Categories
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- RLS Policies: Orders
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies: Reviews
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies: Vendors
DROP POLICY IF EXISTS "vendors_select_all" ON public.vendors;
CREATE POLICY "vendors_select_all" ON public.vendors FOR SELECT USING (true);
