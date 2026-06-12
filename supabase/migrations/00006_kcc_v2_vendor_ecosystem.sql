-- ============================================================
-- KCC v2.0 — Vendor Ecosystem (Registration, KYC, Catalog, Seller Central)
-- ============================================================

-- 1. ADD MISSING COLUMNS TO VENDORS
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS account_health TEXT DEFAULT 'at_risk' CHECK (account_health IN ('healthy','at_risk','critical'));
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS shop_phone TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS shop_email TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS legal_business_name TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('individual','registered_business','manufacturer','distributor','wholesaler','retail','dropship','service'));
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS government_id TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS cac_number TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS verification_level INT DEFAULT 0;

-- 2. VENDOR KYC / COMPLIANCE
CREATE TABLE IF NOT EXISTS public.vendor_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  id_type TEXT CHECK (id_type IN ('passport','national_id','drivers_license')),
  id_number TEXT,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  business_certificate_url TEXT,
  tax_document_url TEXT,
  bank_verification_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','under_review','verified','rejected')),
  rejection_reason TEXT,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id)
);

-- 3. VENDOR MESSAGES / INBOX
CREATE TABLE IF NOT EXISTS public.vendor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_id UUID,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT DEFAULT 'received' CHECK (direction IN ('received','sent')),
  is_read BOOLEAN DEFAULT false,
  order_id UUID,
  product_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_messages_vendor ON public.vendor_messages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_messages_unread ON public.vendor_messages(vendor_id, is_read);

-- 4. VENDOR COUPONS / PROMOTIONS
CREATE TABLE IF NOT EXISTS public.vendor_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage','fixed','free_shipping')),
  value DECIMAL(12,2) NOT NULL,
  min_order DECIMAL(12,2) DEFAULT 0,
  max_discount DECIMAL(12,2),
  usage_limit INT DEFAULT 0,
  usage_count INT DEFAULT 0,
  product_ids UUID[],
  category_ids TEXT[],
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, code)
);

-- 5. VENDOR STAFF / TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.vendor_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','manager','staff','analyst')),
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(vendor_id, email)
);

-- 6. VENDOR PRODUCT REQUESTS (for shared catalog)
CREATE TABLE IF NOT EXISTS public.vendor_product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  shared_product_id UUID REFERENCES public.shared_catalog_products(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('sell_existing','add_to_catalog')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SELLER CENTRAL DAILY SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.seller_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(12,2) DEFAULT 0,
  orders_count INT DEFAULT 0,
  units_sold INT DEFAULT 0,
  page_views INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  ad_spend DECIMAL(12,2) DEFAULT 0,
  ad_impressions INT DEFAULT 0,
  ad_clicks INT DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  refunds_count INT DEFAULT 0,
  UNIQUE(vendor_id, date)
);

-- 8. VENDOR STORE COLLECTIONS
CREATE TABLE IF NOT EXISTS public.vendor_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_store_id UUID NOT NULL REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  product_ids UUID[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_store_id, slug)
);

-- 9. RLS POLICIES
ALTER TABLE public.vendor_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_collections ENABLE ROW LEVEL SECURITY;

-- Vendor can read/insert their own KYC
DROP POLICY IF EXISTS "vendor_own_kyc" ON public.vendor_kyc;
CREATE POLICY "vendor_own_kyc" ON public.vendor_kyc FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Vendor can read/update their own messages
DROP POLICY IF EXISTS "vendor_own_messages" ON public.vendor_messages;
CREATE POLICY "vendor_own_messages" ON public.vendor_messages FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Vendor can CRUD their own coupons
DROP POLICY IF EXISTS "vendor_own_coupons" ON public.vendor_coupons;
CREATE POLICY "vendor_own_coupons" ON public.vendor_coupons FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Vendor can manage their own staff
DROP POLICY IF EXISTS "vendor_own_staff" ON public.vendor_staff;
CREATE POLICY "vendor_own_staff" ON public.vendor_staff FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Vendor access to product requests
DROP POLICY IF EXISTS "vendor_own_product_requests" ON public.vendor_product_requests;
CREATE POLICY "vendor_own_product_requests" ON public.vendor_product_requests FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Admin full access on all new tables
DROP POLICY IF EXISTS "admin_all_vendor_kyc" ON public.vendor_kyc;
CREATE POLICY "admin_all_vendor_kyc" ON public.vendor_kyc FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_vendor_messages" ON public.vendor_messages;
CREATE POLICY "admin_all_vendor_messages" ON public.vendor_messages FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_vendor_coupons" ON public.vendor_coupons;
CREATE POLICY "admin_all_vendor_coupons" ON public.vendor_coupons FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);
