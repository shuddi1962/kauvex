-- ============================================================
-- KCC v3.0 — Logistics: Delivery Riders, Returns, Drop-off Zones
-- ============================================================

-- 1. DELIVERY RIDERS / DRIVERS
CREATE TABLE IF NOT EXISTS public.delivery_riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT,
  license_number TEXT,
  warehouse_id UUID REFERENCES public.warehouses(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','on_break','off_duty')),
  current_lat DECIMAL(10,7),
  current_lng DECIMAL(10,7),
  last_location_update TIMESTAMPTZ,
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.00,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_riders_warehouse ON public.delivery_riders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_delivery_riders_status ON public.delivery_riders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_riders_available ON public.delivery_riders(is_available);

-- 2. DELIVERY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.delivery_riders(id),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned','picked_up','in_transit','delivered','failed','cancelled')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT false,
  delivery_proof_url TEXT,
  recipient_name TEXT,
  recipient_signature TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_rider ON public.delivery_assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON public.delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_shipment ON public.delivery_assignments(shipment_id);

-- 3. RETURN REQUESTS (dedicated table, supplements disputes)
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  order_item_id UUID,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  vendor_id UUID REFERENCES public.vendors(id),
  reason TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('not_received','not_as_described','damaged','wrong_item','defective','change_of_mind')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','awaiting_return','received','inspecting','refunded','replaced','closed')),
  quantity INT DEFAULT 1,
  evidence_urls TEXT[],
  vendor_notes TEXT,
  admin_notes TEXT,
  refund_amount DECIMAL(12,2),
  refund_method TEXT CHECK (refund_method IN ('original','wallet','bank_transfer')),
  return_tracking_number TEXT,
  return_label_url TEXT,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_customer ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_vendor ON public.return_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_order ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);

-- 4. STOREFRONT ASSIGNMENTS (product-storefront linking)
CREATE TABLE IF NOT EXISTS public.product_storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, storefront_id)
);

CREATE INDEX IF NOT EXISTS idx_product_storefronts_product ON public.product_storefronts(product_id);
CREATE INDEX IF NOT EXISTS idx_product_storefronts_storefront ON public.product_storefronts(storefront_id);

-- 5. ENABLE RLS
ALTER TABLE public.delivery_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_storefronts ENABLE ROW LEVEL SECURITY;

-- RLS: Drivers can read their own assignments
DROP POLICY IF EXISTS "driver_own_assignments" ON public.delivery_assignments;
CREATE POLICY "driver_own_assignments" ON public.delivery_assignments FOR ALL
USING (auth.uid() IN (SELECT id FROM public.delivery_riders WHERE id = rider_id));

-- RLS: Customers can read their own return requests
DROP POLICY IF EXISTS "customer_own_returns" ON public.return_requests;
CREATE POLICY "customer_own_returns" ON public.return_requests FOR ALL
USING (auth.uid() = customer_id);

-- RLS: Vendors can see returns for their products
DROP POLICY IF EXISTS "vendor_return_requests" ON public.return_requests;
CREATE POLICY "vendor_return_requests" ON public.return_requests FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- RLS: Admin full access
DROP POLICY IF EXISTS "admin_all_delivery_riders" ON public.delivery_riders;
CREATE POLICY "admin_all_delivery_riders" ON public.delivery_riders FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_delivery_assignments" ON public.delivery_assignments;
CREATE POLICY "admin_all_delivery_assignments" ON public.delivery_assignments FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_return_requests" ON public.return_requests;
CREATE POLICY "admin_all_return_requests" ON public.return_requests FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_product_storefronts" ON public.product_storefronts;
CREATE POLICY "admin_all_product_storefronts" ON public.product_storefronts FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'admin')
) WITH CHECK (true);
