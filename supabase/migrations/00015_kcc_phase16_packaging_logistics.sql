-- Phase 16: Packaging System + Logistics Network Dashboards
-- Migration 00015: kv_pkg_* and kv_lgx_* tables

-- ============================================================
-- PACKAGING TABLES
-- ============================================================

-- Packaging Materials Registry
CREATE TABLE IF NOT EXISTS kv_pkg_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'box',
  description TEXT,
  dimensions JSONB,
  weight_grams INT,
  max_weight_grams INT,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'NGN',
  is_recyclable BOOLEAN DEFAULT false,
  is_eco_friendly BOOLEAN DEFAULT false,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Packaging Warehouse Stock
CREATE TABLE IF NOT EXISTS kv_pkg_warehouse_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES kv_pkg_materials(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity INT NOT NULL DEFAULT 0,
  min_threshold INT DEFAULT 10,
  unit_cost DECIMAL(10,2),
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, warehouse_id)
);

-- Vendor Packaging Configuration
CREATE TABLE IF NOT EXISTS kv_pkg_vendor_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  tier VARCHAR(10) NOT NULL DEFAULT 'B',
  custom_branding BOOLEAN DEFAULT false,
  logo_url TEXT,
  branded_tape BOOLEAN DEFAULT false,
  branded_boxes BOOLEAN DEFAULT false,
  insert_gift_receipt BOOLEAN DEFAULT true,
  insert_promotional BOOLEAN DEFAULT false,
  eco_friendly BOOLEAN DEFAULT false,
  fragile_label BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Packaging Records
CREATE TABLE IF NOT EXISTS kv_pkg_order_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  tier VARCHAR(10) NOT NULL,
  box_type VARCHAR(100),
  box_sku VARCHAR(100),
  filling_material VARCHAR(100),
  tape_used VARCHAR(100),
  is_gift BOOLEAN DEFAULT false,
  custom_message TEXT,
  fragile BOOLEAN DEFAULT false,
  weight_grams INT,
  packaging_cost DECIMAL(10,2),
  eco_friendly BOOLEAN DEFAULT false,
  packed_by VARCHAR(200),
  packed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supplier Packaging Kits
CREATE TABLE IF NOT EXISTS kv_pkg_supplier_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  items JSONB,
  unit_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supplier Packaging Kit Requests
CREATE TABLE IF NOT EXISTS kv_pkg_supplier_kit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  kit_id UUID REFERENCES kv_pkg_supplier_kits(id),
  quantity INT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Packaging Compliance Logs
CREATE TABLE IF NOT EXISTS kv_pkg_compliance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  order_id UUID,
  check_type VARCHAR(50) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  checked_by VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LOGISTICS WAREHOUSE TABLES
-- ============================================================

-- Warehouse Staff
CREATE TABLE IF NOT EXISTS kv_lgx_warehouse_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  role VARCHAR(30) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pick Tasks
CREATE TABLE IF NOT EXISTS kv_lgx_pick_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  order_item_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  product_id UUID NOT NULL,
  sku VARCHAR(100),
  bin_location VARCHAR(50),
  quantity INT NOT NULL,
  assigned_to UUID,
  status VARCHAR(20) DEFAULT 'pending',
  issue_note TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pack Tasks
CREATE TABLE IF NOT EXISTS kv_lgx_pack_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  packaging_id UUID REFERENCES kv_pkg_materials(id),
  assigned_to UUID,
  status VARCHAR(20) DEFAULT 'pending',
  is_gift BOOLEAN DEFAULT false,
  is_fragile BOOLEAN DEFAULT false,
  weight_grams INT,
  issue_note TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Disable RLS on all Phase 16 tables (internal management tables)
ALTER TABLE kv_pkg_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_warehouse_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_vendor_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_order_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_supplier_kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_supplier_kit_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_pkg_compliance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_lgx_warehouse_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_lgx_pick_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_lgx_pack_tasks DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_kv_lgx_warehouse_staff_user ON kv_lgx_warehouse_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_warehouse_staff_warehouse ON kv_lgx_warehouse_staff(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_warehouse_staff_status ON kv_lgx_warehouse_staff(status);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_pick_tasks_assigned ON kv_lgx_pick_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_pick_tasks_status ON kv_lgx_pick_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_pack_tasks_assigned ON kv_lgx_pack_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kv_lgx_pack_tasks_status ON kv_lgx_pack_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_materials_category ON kv_pkg_materials(category);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_materials_status ON kv_pkg_materials(status);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_warehouse_stock_warehouse ON kv_pkg_warehouse_stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_vendor_config_vendor ON kv_pkg_vendor_config(vendor_id);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_order_records_order ON kv_pkg_order_records(order_id);
CREATE INDEX IF NOT EXISTS idx_kv_pkg_compliance_logs_vendor ON kv_pkg_compliance_logs(vendor_id);

-- ============================================================
-- SEED DATA: Warehouse Staff
-- ============================================================
INSERT INTO kv_lgx_warehouse_staff (user_id, warehouse_id, role, full_name, phone, status) VALUES
  ('0ce78214-fd6e-447a-9cd2-c59b53701098', '5ff23f94-428c-4e38-9ee9-f98f9655eaa2', 'warehouse_manager', 'Super Admin', '+2348000000000', 'active'),
  ('d294a2c6-06fa-42ee-9249-2213fcec965a', '5ff23f94-428c-4e38-9ee9-f98f9655eaa2', 'picker', 'John Demo', '+2348011111111', 'active'),
  ('8830bbd0-c353-46ea-aa06-4253b05ac8c3', 'eaab3fbc-d1c5-4865-ad1f-950094a08b0c', 'packer', 'MarinePro Nigeria', '+2348022222222', 'active'),
  ('762aa5db-a403-4d1b-8b13-d08662e26b72', '42361cc1-f694-4974-a5f8-ae89d3d34525', 'receiver', 'SecureTech Global', '+2348033333333', 'active'),
  ('2d0add48-0966-40a9-a6fe-1235e1761b78', '5ff23f94-428c-4e38-9ee9-f98f9655eaa2', 'packer', 'PowerPlus Supplies', '+2348044444444', 'active'),
  ('2369f2db-6c0d-461d-a9b9-f51ec3490ffb', 'eaab3fbc-d1c5-4865-ad1f-950094a08b0c', 'picker', 'Test Customer', '+2348055555555', 'active')
ON CONFLICT DO NOTHING;
