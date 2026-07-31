-- KCC Phase 29: K Business OS (Kauvex Business Operating System)
-- Centralized operating system for organizations of all sizes.
-- Turns Kauvex from a marketplace into a complete Business OS.
-- Modules: Organization, CRM, Sales, Procurement, Inventory, Warehouse,
-- Manufacturing, Projects, Field Service, HR, Finance, Documents, Assets,
-- Quality, HSE, Compliance, Communication, Knowledge, Approvals, Automation.

-- =====================================================================
-- 1. ORGANIZATIONS (multi-tenant company registry + hierarchy)
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES kv_bos_organizations(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(200),
  org_type VARCHAR(50) NOT NULL DEFAULT 'company' CHECK (org_type IN ('company', 'subsidiary', 'division', 'branch', 'ngo', 'government', 'educational', 'healthcare', 'sole_proprietor')),
  industry VARCHAR(100),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  vat_number VARCHAR(100),
  licenses JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  insurance JSONB DEFAULT '[]',
  banking JSONB DEFAULT '[]',
  address JSONB DEFAULT '{}',
  country VARCHAR(10) DEFAULT 'NG',
  currency_code VARCHAR(10) DEFAULT 'NGN',
  branding JSONB DEFAULT '{}',
  digital_signature_url TEXT,
  website TEXT,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  plan VARCHAR(30) DEFAULT 'starter' CHECK (plan IN ('starter', 'grow', 'scale', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_org_parent ON kv_bos_organizations(parent_id);
CREATE INDEX idx_bos_org_type ON kv_bos_organizations(org_type);
CREATE INDEX idx_bos_org_status ON kv_bos_organizations(status);

-- 2. ORG MEMBERS
CREATE TABLE IF NOT EXISTS kv_bos_org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  member_role VARCHAR(30) DEFAULT 'member' CHECK (member_role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  department_id UUID,
  job_title VARCHAR(150),
  is_default_org BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_member_org ON kv_bos_org_members(org_id);
CREATE INDEX idx_bos_member_user ON kv_bos_org_members(user_id);
CREATE UNIQUE INDEX idx_bos_member_org_user ON kv_bos_org_members(org_id, user_id);

-- 3. DEPARTMENTS / DIVISIONS / BRANCHES / COST CENTERS / TEAMS
CREATE TABLE IF NOT EXISTS kv_bos_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kv_bos_departments(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  unit_type VARCHAR(30) DEFAULT 'department' CHECK (unit_type IN ('department', 'division', 'branch', 'cost_center', 'business_unit', 'team')),
  code VARCHAR(30),
  manager_id UUID,
  budget DECIMAL(14,2),
  headcount_limit INT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_dept_org ON kv_bos_departments(org_id);
CREATE INDEX idx_bos_dept_parent ON kv_bos_departments(parent_id);
CREATE INDEX idx_bos_dept_type ON kv_bos_departments(unit_type);

-- 4. EMPLOYEES (HR)
CREATE TABLE IF NOT EXISTS kv_bos_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES kv_bos_departments(id) ON DELETE SET NULL,
  user_id UUID,
  employee_code VARCHAR(30),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(30),
  job_title VARCHAR(150),
  employment_type VARCHAR(30) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'temporary')),
  hire_date DATE,
  termination_date DATE,
  salary_input DECIMAL(14,2),
  pay_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (pay_frequency IN ('monthly', 'biweekly', 'weekly')),
  bank_account JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  attendance_summary JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated', 'probation')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_emp_org ON kv_bos_employees(org_id);
CREATE INDEX idx_bos_emp_dept ON kv_bos_employees(department_id);
CREATE INDEX idx_bos_emp_status ON kv_bos_employees(status);

-- =====================================================================
-- 5. CRM: CUSTOMERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  customer_code VARCHAR(30),
  name VARCHAR(200) NOT NULL,
  customer_type VARCHAR(30) DEFAULT 'company' CHECK (customer_type IN ('company', 'individual')),
  segment VARCHAR(50) DEFAULT 'general' CHECK (segment IN ('general', 'wholesale', 'retail', 'premium', 'vip', 'government', 'ngo', 'b2b')),
  industry VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(30),
  address JSONB DEFAULT '{}',
  website TEXT,
  credit_limit DECIMAL(14,2),
  payment_terms VARCHAR(50),
  tax_id VARCHAR(100),
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  rating INT DEFAULT 0,
  lifetime_value DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'lead')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_cust_org ON kv_bos_customers(org_id);
CREATE INDEX idx_bos_cust_segment ON kv_bos_customers(segment);
CREATE INDEX idx_bos_cust_status ON kv_bos_customers(status);

-- 6. CRM: CONTACTS
CREATE TABLE IF NOT EXISTS kv_bos_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  job_title VARCHAR(150),
  department VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_contact_org ON kv_bos_contacts(org_id);
CREATE INDEX idx_bos_contact_customer ON kv_bos_contacts(customer_id);

-- 7. CRM: LEADS
CREATE TABLE IF NOT EXISTS kv_bos_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(30),
  source VARCHAR(50) CHECK (source IN ('website', 'referral', 'walk_in', 'social', 'call', 'email', 'whatsapp', 'marketplace', 'other')),
  stage VARCHAR(30) DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  score INT DEFAULT 0,
  estimated_value DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  assigned_to UUID,
  interests TEXT[] DEFAULT '{}',
  notes TEXT,
  converted_customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_lead_org ON kv_bos_leads(org_id);
CREATE INDEX idx_bos_lead_stage ON kv_bos_leads(stage);
CREATE INDEX idx_bos_lead_score ON kv_bos_leads(score);

-- 8. CRM: DEALS (sales pipeline)
CREATE TABLE IF NOT EXISTS kv_bos_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES kv_bos_leads(id) ON DELETE SET NULL,
  deal_name VARCHAR(200) NOT NULL,
  pipeline VARCHAR(50) DEFAULT 'sales' CHECK (pipeline IN ('sales', 'b2b', 'projects', 'services')),
  stage VARCHAR(30) DEFAULT 'qualification' CHECK (stage IN ('qualification', 'discovery', 'proposal', 'negotiation', 'won', 'lost')),
  amount DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  probability INT DEFAULT 10,
  expected_close DATE,
  owner_id UUID,
  win_reason TEXT,
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_deal_org ON kv_bos_deals(org_id);
CREATE INDEX idx_bos_deal_customer ON kv_bos_deals(customer_id);
CREATE INDEX idx_bos_deal_stage ON kv_bos_deals(stage);
CREATE INDEX idx_bos_deal_owner ON kv_bos_deals(owner_id);

-- =====================================================================
-- 9. SALES: QUOTATIONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  quote_number VARCHAR(30) NOT NULL,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES kv_bos_deals(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(14,2) DEFAULT 0,
  discount DECIMAL(14,2) DEFAULT 0,
  tax DECIMAL(14,2) DEFAULT 0,
  total DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'revised', 'converted')),
  valid_until DATE,
  terms TEXT,
  assigned_to UUID,
  revision INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_quote_org ON kv_bos_quotations(org_id);
CREATE INDEX idx_bos_quote_customer ON kv_bos_quotations(customer_id);
CREATE INDEX idx_bos_quote_status ON kv_bos_quotations(status);

-- 10. SALES ORDERS
CREATE TABLE IF NOT EXISTS kv_bos_sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  order_number VARCHAR(30) NOT NULL,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES kv_bos_quotations(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(14,2) DEFAULT 0,
  discount DECIMAL(14,2) DEFAULT 0,
  tax DECIMAL(14,2) DEFAULT 0,
  total DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'fulfilled', 'invoiced', 'cancelled', 'completed')),
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  shipping_address JSONB DEFAULT '{}',
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_so_org ON kv_bos_sales_orders(org_id);
CREATE INDEX idx_bos_so_customer ON kv_bos_sales_orders(customer_id);
CREATE INDEX idx_bos_so_status ON kv_bos_sales_orders(status);

-- =====================================================================
-- 11. PROCUREMENT: SUPPLIERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  supplier_code VARCHAR(30),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(30),
  address JSONB DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  product_catalog JSONB DEFAULT '[]',
  pricing_history JSONB DEFAULT '[]',
  payment_terms VARCHAR(50),
  lead_time_days INT,
  delivery_performance DECIMAL(5,2) DEFAULT 0,
  quality_score DECIMAL(5,2) DEFAULT 0,
  rating INT DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  contract_start DATE,
  contract_end DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_supp_org ON kv_bos_suppliers(org_id);
CREATE INDEX idx_bos_supp_category ON kv_bos_suppliers(category);
CREATE INDEX idx_bos_supp_risk ON kv_bos_suppliers(risk_level);

-- 12. PURCHASE REQUESTS
CREATE TABLE IF NOT EXISTS kv_bos_purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  pr_number VARCHAR(30) NOT NULL,
  department_id UUID REFERENCES kv_bos_departments(id) ON DELETE SET NULL,
  requested_by UUID,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  needed_by DATE,
  justification TEXT,
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'ordered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_pr_org ON kv_bos_purchase_requests(org_id);
CREATE INDEX idx_bos_pr_dept ON kv_bos_purchase_requests(department_id);
CREATE INDEX idx_bos_pr_status ON kv_bos_purchase_requests(status);

-- 13. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS kv_bos_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  po_number VARCHAR(30) NOT NULL,
  supplier_id UUID REFERENCES kv_bos_suppliers(id) ON DELETE SET NULL,
  purchase_request_id UUID REFERENCES kv_bos_purchase_requests(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(14,2) DEFAULT 0,
  tax DECIMAL(14,2) DEFAULT 0,
  shipping_fee DECIMAL(14,2) DEFAULT 0,
  total DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'sent', 'partially_received', 'received', 'cancelled')),
  expected_delivery DATE,
  payment_terms VARCHAR(50),
  delivery_address JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_po_org ON kv_bos_purchase_orders(org_id);
CREATE INDEX idx_bos_po_supplier ON kv_bos_purchase_orders(supplier_id);
CREATE INDEX idx_bos_po_status ON kv_bos_purchase_orders(status);

-- =====================================================================
-- 14. INVENTORY: ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  sku VARCHAR(50),
  barcode VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  item_type VARCHAR(30) DEFAULT 'product' CHECK (item_type IN ('product', 'raw_material', 'component', 'finished_good', 'spare_part', 'rental_asset', 'consumable')),
  category VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'pcs',
  cost_price DECIMAL(14,2) DEFAULT 0,
  selling_price DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  stock_on_hand DECIMAL(14,2) DEFAULT 0,
  reserved_stock DECIMAL(14,2) DEFAULT 0,
  reorder_point DECIMAL(14,2) DEFAULT 0,
  reorder_quantity DECIMAL(14,2) DEFAULT 0,
  warehouse_id UUID,
  bin_location VARCHAR(50),
  batch_tracked BOOLEAN DEFAULT FALSE,
  serial_tracked BOOLEAN DEFAULT FALSE,
  supplier_id UUID REFERENCES kv_bos_suppliers(id) ON DELETE SET NULL,
  weight_kg DECIMAL(10,2),
  dimensions JSONB DEFAULT '{}',
  valuation_method VARCHAR(20) DEFAULT 'fifo' CHECK (valuation_method IN ('fifo', 'lifo', 'average')),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_item_org ON kv_bos_items(org_id);
CREATE INDEX idx_bos_item_type ON kv_bos_items(item_type);
CREATE INDEX idx_bos_item_category ON kv_bos_items(category);
CREATE INDEX idx_bos_item_sku ON kv_bos_items(sku);

-- 15. WAREHOUSES
CREATE TABLE IF NOT EXISTS kv_bos_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  warehouse_type VARCHAR(30) DEFAULT 'standard' CHECK (warehouse_type IN ('standard', 'cold', 'hazardous', 'fragile', 'open')),
  address JSONB DEFAULT '{}',
  manager_id UUID,
  bin_zones JSONB DEFAULT '[]',
  map_url TEXT,
  equipment JSONB DEFAULT '[]',
  staff JSONB DEFAULT '[]',
  capacity_units INT,
  utilization_percent DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_wh_org ON kv_bos_warehouses(org_id);

-- 16. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS kv_bos_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES kv_bos_items(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES kv_bos_warehouses(id) ON DELETE SET NULL,
  movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('receipt', 'issue', 'transfer_in', 'transfer_out', 'adjustment', 'cycle_count', 'sale', 'purchase', 'production_in', 'production_out', 'return_in', 'return_out')),
  quantity DECIMAL(14,2) NOT NULL,
  unit_cost DECIMAL(14,2),
  reference_type VARCHAR(50),
  reference_id UUID,
  bin_location VARCHAR(50),
  batch_number VARCHAR(50),
  serial_numbers TEXT[] DEFAULT '{}',
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_move_org ON kv_bos_stock_movements(org_id);
CREATE INDEX idx_bos_move_item ON kv_bos_stock_movements(item_id);
CREATE INDEX idx_bos_move_type ON kv_bos_stock_movements(movement_type);
CREATE INDEX idx_bos_move_ref ON kv_bos_stock_movements(reference_type, reference_id);

-- =====================================================================
-- 17. MANUFACTURING: BILL OF MATERIALS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES kv_bos_items(id) ON DELETE CASCADE,
  bom_name VARCHAR(200) NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  scrap_percent DECIMAL(5,2) DEFAULT 0,
  labor_hours DECIMAL(8,2) DEFAULT 0,
  machine_hours DECIMAL(8,2) DEFAULT 0,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_bom_org ON kv_bos_boms(org_id);
CREATE INDEX idx_bos_bom_product ON kv_bos_boms(product_id);

-- 18. PRODUCTION ORDERS
CREATE TABLE IF NOT EXISTS kv_bos_production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  production_number VARCHAR(30) NOT NULL,
  item_id UUID NOT NULL REFERENCES kv_bos_items(id) ON DELETE CASCADE,
  bom_id UUID REFERENCES kv_bos_boms(id) ON DELETE SET NULL,
  quantity DECIMAL(14,2) NOT NULL,
  quantity_produced DECIMAL(14,2) DEFAULT 0,
  scrap_quantity DECIMAL(14,2) DEFAULT 0,
  work_center VARCHAR(100),
  routing JSONB DEFAULT '[]',
  status VARCHAR(30) DEFAULT 'planned' CHECK (status IN ('planned', 'released', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  planned_start DATE,
  planned_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  materials_consumed JSONB DEFAULT '[]',
  labor_hours DECIMAL(8,2) DEFAULT 0,
  machine_hours DECIMAL(8,2) DEFAULT 0,
  production_cost DECIMAL(14,2) DEFAULT 0,
  quality_checkpoints JSONB DEFAULT '[]',
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_po_org ON kv_bos_production_orders(org_id);
CREATE INDEX idx_bos_po_item ON kv_bos_production_orders(item_id);
CREATE INDEX idx_bos_po_status ON kv_bos_production_orders(status);

-- =====================================================================
-- 19. PROJECTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  project_name VARCHAR(200) NOT NULL,
  project_type VARCHAR(50) CHECK (project_type IN ('construction', 'marine', 'dredging', 'manufacturing', 'printing', 'fashion', 'energy', 'it', 'furniture', 'other')),
  description TEXT,
  status VARCHAR(30) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'disputed')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(14,2),
  spent DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  progress_percent DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  location JSONB DEFAULT '{}',
  manager_id UUID,
  team JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_project_org ON kv_bos_projects(org_id);
CREATE INDEX idx_bos_project_type ON kv_bos_projects(project_type);
CREATE INDEX idx_bos_project_status ON kv_bos_projects(status);

-- 20. TASKS
CREATE TABLE IF NOT EXISTS kv_bos_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES kv_bos_projects(id) ON DELETE CASCADE,
  work_order_id UUID,
  parent_task_id UUID REFERENCES kv_bos_tasks(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  phase VARCHAR(100),
  milestone VARCHAR(100),
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID,
  due_date DATE,
  estimated_hours DECIMAL(6,2),
  logged_hours DECIMAL(6,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_task_org ON kv_bos_tasks(org_id);
CREATE INDEX idx_bos_task_project ON kv_bos_tasks(project_id);
CREATE INDEX idx_bos_task_status ON kv_bos_tasks(status);
CREATE INDEX idx_bos_task_assignee ON kv_bos_tasks(assignee_id);

-- =====================================================================
-- 21. FIELD SERVICE: WORK ORDERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  work_order_number VARCHAR(30) NOT NULL,
  customer_id UUID REFERENCES kv_bos_customers(id) ON DELETE SET NULL,
  job_type VARCHAR(30) NOT NULL CHECK (job_type IN ('installation', 'maintenance', 'repair', 'inspection', 'site_survey', 'commissioning', 'emergency')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  technician_id UUID,
  scheduled_date DATE,
  scheduled_time_window VARCHAR(20) CHECK (scheduled_time_window IN ('morning', 'afternoon', 'evening')),
  route_plan JSONB DEFAULT '{}',
  gps_coordinates JSONB DEFAULT '{}',
  checklist JSONB DEFAULT '[]',
  photos_before JSONB DEFAULT '[]',
  photos_after JSONB DEFAULT '[]',
  spare_parts_used JSONB DEFAULT '[]',
  customer_signature_url TEXT,
  service_report_url TEXT,
  job_cost DECIMAL(14,2),
  status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'assigned', 'en_route', 'on_site', 'in_progress', 'completed', 'cancelled', 'disputed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_wo_org ON kv_bos_work_orders(org_id);
CREATE INDEX idx_bos_wo_technician ON kv_bos_work_orders(technician_id);
CREATE INDEX idx_bos_wo_status ON kv_bos_work_orders(status);
CREATE INDEX idx_bos_wo_job_type ON kv_bos_work_orders(job_type);

-- =====================================================================
-- 22. ASSETS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  asset_code VARCHAR(30),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('building', 'vehicle', 'boat', 'machinery', 'computer', 'tool', 'test_equipment', 'furniture', 'license', 'other')),
  asset_tag VARCHAR(50),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  depreciation_method VARCHAR(20) DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line', 'declining', 'none')),
  useful_life_years INT DEFAULT 5,
  salvage_value DECIMAL(14,2) DEFAULT 0,
  book_value DECIMAL(14,2),
  warranty_end DATE,
  calibration_due DATE,
  maintenance_schedule JSONB DEFAULT '[]',
  last_maintenance_date DATE,
  location VARCHAR(200),
  assigned_to VARCHAR(150),
  status VARCHAR(20) DEFAULT 'in_service' CHECK (status IN ('in_service', 'maintenance', 'idle', 'retired', 'transferred')),
  documents JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_asset_org ON kv_bos_assets(org_id);
CREATE INDEX idx_bos_asset_category ON kv_bos_assets(category);
CREATE INDEX idx_bos_asset_status ON kv_bos_assets(status);

-- =====================================================================
-- 23. DOCUMENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  doc_type VARCHAR(50) CHECK (doc_type IN ('contract', 'drawing', 'manual', 'certificate', 'sop', 'policy', 'invoice', 'purchase_order', 'delivery_note', 'technical', 'proposal', 'other')),
  category VARCHAR(100),
  file_url TEXT,
  file_size_kb INT,
  mime_type VARCHAR(100),
  version INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'expired')),
  ocr_text TEXT,
  tags TEXT[] DEFAULT '{}',
  owner_id UUID,
  approval_status VARCHAR(20) DEFAULT 'none' CHECK (approval_status IN ('none', 'pending', 'approved', 'rejected')),
  linked_record_type VARCHAR(50),
  linked_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_doc_org ON kv_bos_documents(org_id);
CREATE INDEX idx_bos_doc_type ON kv_bos_documents(doc_type);
CREATE INDEX idx_bos_doc_status ON kv_bos_documents(status);

-- =====================================================================
-- 24. APPROVALS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  approval_number VARCHAR(30) NOT NULL,
  module VARCHAR(30) NOT NULL CHECK (module IN ('purchase', 'payment', 'discount', 'quotation', 'hiring', 'leave', 'contract', 'manufacturing', 'inventory_adjustment', 'design', 'expense', 'other')),
  record_type VARCHAR(50),
  record_id UUID,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  requested_by UUID,
  approvers JSONB DEFAULT '[]',
  current_level INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'escalated')),
  decision_chain JSONB DEFAULT '[]',
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_approval_org ON kv_bos_approvals(org_id);
CREATE INDEX idx_bos_approval_status ON kv_bos_approvals(status);
CREATE INDEX idx_bos_approval_module ON kv_bos_approvals(module);

-- =====================================================================
-- 25. AUTOMATION RULES
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  trigger_type VARCHAR(50) CHECK (trigger_type IN ('stock_low', 'task_due', 'document_expiry', 'approval_pending', 'payment_due', 'quotation_expiry', 'contract_renewal', 'schedule')),
  conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_auto_org ON kv_bos_automation_rules(org_id);
CREATE INDEX idx_bos_auto_trigger ON kv_bos_automation_rules(trigger_type);
CREATE INDEX idx_bos_auto_active ON kv_bos_automation_rules(active);

-- =====================================================================
-- 26. QUALITY: NON-CONFORMANCE REPORTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_ncrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  ncr_number VARCHAR(30) NOT NULL,
  item_id UUID REFERENCES kv_bos_items(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES kv_bos_suppliers(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES kv_bos_production_orders(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  category VARCHAR(50) CHECK (category IN ('product', 'process', 'supplier', 'documentation', 'safety', 'customer')),
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'corrective_action', 'closed', 'rejected')),
  corrective_action TEXT,
  preventive_action TEXT,
  root_cause TEXT,
  deadline DATE,
  assigned_to UUID,
  reported_by UUID,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_ncr_org ON kv_bos_ncrs(org_id);
CREATE INDEX idx_bos_ncr_status ON kv_bos_ncrs(status);
CREATE INDEX idx_bos_ncr_severity ON kv_bos_ncrs(severity);

-- =====================================================================
-- 27. HSE: INCIDENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  incident_number VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  incident_type VARCHAR(30) CHECK (incident_type IN ('incident', 'near_miss', 'safety_observation', 'environmental', 'ppe_violation')),
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  location VARCHAR(200),
  description TEXT NOT NULL,
  immediate_action TEXT,
  risk_assessment JSONB DEFAULT '{}',
  permit_to_work JSONB DEFAULT '{}',
  ppe_involved BOOLEAN DEFAULT FALSE,
  reported_by UUID,
  assigned_to UUID,
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'action_taken', 'closed')),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_inc_org ON kv_bos_incidents(org_id);
CREATE INDEX idx_bos_inc_type ON kv_bos_incidents(incident_type);
CREATE INDEX idx_bos_inc_status ON kv_bos_incidents(status);

-- =====================================================================
-- 28. FINANCE: GL ACCOUNTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_gl_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES kv_bos_gl_accounts(id) ON DELETE SET NULL,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  opening_balance DECIMAL(14,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_gl_org ON kv_bos_gl_accounts(org_id);
CREATE INDEX idx_bos_gl_type ON kv_bos_gl_accounts(account_type);
CREATE UNIQUE INDEX idx_bos_gl_org_code ON kv_bos_gl_accounts(org_id, code);

-- 29. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS kv_bos_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES kv_bos_gl_accounts(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  posted_by UUID,
  status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_je_org ON kv_bos_journal_entries(org_id);
CREATE INDEX idx_bos_je_account ON kv_bos_journal_entries(account_id);
CREATE INDEX idx_bos_je_date ON kv_bos_journal_entries(entry_date);

-- 30. INVOICES (AR/AP)
CREATE TABLE IF NOT EXISTS kv_bos_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  invoice_number VARCHAR(30) NOT NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('receivable', 'payable')),
  party_name VARCHAR(200) NOT NULL,
  party_id UUID,
  sales_order_id UUID REFERENCES kv_bos_sales_orders(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES kv_bos_purchase_orders(id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(14,2) DEFAULT 0,
  tax DECIMAL(14,2) DEFAULT 0,
  total DECIMAL(14,2) DEFAULT 0,
  amount_paid DECIMAL(14,2) DEFAULT 0,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_inv_org ON kv_bos_invoices(org_id);
CREATE INDEX idx_bos_inv_direction ON kv_bos_invoices(direction);
CREATE INDEX idx_bos_inv_status ON kv_bos_invoices(status);

-- =====================================================================
-- 31. KNOWLEDGE HUB
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('policy', 'procedure', 'faq', 'training', 'technical', 'manual', 'standard', 'best_practice')),
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID,
  views INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_kb_org ON kv_bos_knowledge_articles(org_id);
CREATE INDEX idx_bos_kb_category ON kv_bos_knowledge_articles(category);
CREATE INDEX idx_bos_kb_status ON kv_bos_knowledge_articles(status);

-- =====================================================================
-- 32. COMMUNICATION: ANNOUNCEMENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  audience VARCHAR(30) DEFAULT 'all' CHECK (audience IN ('all', 'department', 'role', 'team')),
  audience_filter JSONB DEFAULT '{}',
  pinned BOOLEAN DEFAULT FALSE,
  author_id UUID,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bos_ann_org ON kv_bos_announcements(org_id);
CREATE INDEX idx_bos_ann_pinned ON kv_bos_announcements(pinned);

-- =====================================================================
-- 33. INDUSTRY MODULES (installable plugins)
-- =====================================================================
CREATE TABLE IF NOT EXISTS kv_bos_industry_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  config_schema JSONB DEFAULT '{}',
  workflows JSONB DEFAULT '[]',
  installed_for JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. ORG SETTINGS (branding + workflows)
CREATE TABLE IF NOT EXISTS kv_bos_org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES kv_bos_organizations(id) ON DELETE CASCADE,
  branding JSONB DEFAULT '{}',
  workflows JSONB DEFAULT '{}',
  approval_chains JSONB DEFAULT '[]',
  enabled_modules JSONB DEFAULT '[]',
  permissions JSONB DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  retention_policy JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_bos_settings_org ON kv_bos_org_settings(org_id);

-- =====================================================================
-- INDUSTRY MODULE SEEDS
-- =====================================================================
INSERT INTO kv_bos_industry_modules (module_code, name, industry, description, workflows, sort_order) VALUES
  ('fashion', 'Fashion & Garments', 'fashion', 'Collections, seasons, tech packs, sample tracking, pattern versions, fabric & trim inventory, production batches, size breakdowns', ARRAY['collection_planning', 'sample_tracking', 'fabric_inventory', 'size_breakdowns', 'quality_inspection'], 1),
  ('furniture', 'Furniture', 'furniture', 'Furniture production, upholstery, finishing, and delivery tracking', ARRAY['cutting', 'assembly', 'finishing', 'quality_check'], 2),
  ('marine', 'Marine & Boat Building', 'marine', 'Vessel registry, hull production stages, engine installation, sea trials, slipway & dock scheduling', ARRAY['vessel_registry', 'hull_stages', 'engine_install', 'sea_trials', 'dock_scheduling'], 3),
  ('construction', 'Construction Materials', 'construction', 'Site management, material requests, daily reports, variation orders, subcontractor management', ARRAY['site_management', 'material_requests', 'daily_reports', 'safety_inspections', 'variation_orders'], 4),
  ('electronics', 'Electronics Assembly', 'electronics', 'PCB assembly, component kitting, soldering stations, testing, and rework tracking', ARRAY['kitting', 'assembly_lines', 'testing', 'rework'], 5),
  ('solar', 'Solar Systems', 'solar', 'Panel assembly, inverter integration, installation projects, and commissioning checklists', ARRAY['panel_assembly', 'installation', 'commissioning'], 6),
  ('security', 'Security Equipment', 'security', 'CCTV assembly, access control builds, install schedules, and site surveys', ARRAY['assembly', 'site_survey', 'installation'], 7),
  ('packaging', 'Packaging', 'packaging', 'Box cutting, printing, folding, gluing, and finishing runs', ARRAY['die_cutting', 'printing', 'folding_gluing', 'finishing'], 8),
  ('printing', 'Printing & POD', 'printing', 'Print jobs, artwork approvals, press scheduling, finishing, and print-on-demand routing', ARRAY['artwork_approval', 'print_queue', 'press_scheduling', 'finishing', 'pod_routing'], 9),
  ('signage', 'Signage', 'signage', 'Sign fabrication, vinyl cutting, LED installation, and site installation', ARRAY['fabrication', 'vinyl_cutting', 'led_install', 'site_install'], 10),
  ('food', 'Food Processing', 'food', 'Batch processing, recipes, ingredient inventory, expiry tracking, and safety checks', ARRAY['recipe_batching', 'ingredient_inventory', 'expiry_tracking', 'safety_checks'], 11),
  ('chemical', 'Chemical Products', 'chemical', 'Formula batches, material safety data, handling, and compliance documentation', ARRAY['formula_batching', 'msds_tracking', 'handling_compliance'], 12),
  ('fabrication', 'Industrial Fabrication', 'fabrication', 'Cutting, welding, machining, and assembly work orders with job costing', ARRAY['cutting', 'welding', 'machining', 'assembly', 'job_costing'], 13);

-- =====================================================================
-- STANDARD CHART OF ACCOUNTS SEED
-- =====================================================================
INSERT INTO kv_bos_gl_accounts (code, name, account_type, description) VALUES
  ('1000', 'Cash', 'asset', 'Cash on hand and in bank'),
  ('1100', 'Accounts Receivable', 'asset', 'Money owed by customers'),
  ('1200', 'Inventory', 'asset', 'Raw materials, WIP, and finished goods'),
  ('1300', 'Fixed Assets', 'asset', 'Property, plant, and equipment'),
  ('2000', 'Accounts Payable', 'liability', 'Money owed to suppliers'),
  ('2100', 'Tax Payable', 'liability', 'Taxes collected and owed'),
  ('2200', 'Loans Payable', 'liability', 'Bank and third-party loans'),
  ('3000', 'Owner Equity', 'equity', 'Owner contributions and retained earnings'),
  ('4000', 'Sales Revenue', 'revenue', 'Income from product sales'),
  ('4100', 'Service Revenue', 'revenue', 'Income from services'),
  ('5000', 'Cost of Goods Sold', 'expense', 'Direct cost of products sold'),
  ('5100', 'Payroll', 'expense', 'Salaries and wages'),
  ('5200', 'Rent', 'expense', 'Rent and leases'),
  ('5300', 'Utilities', 'expense', 'Electricity, water, internet'),
  ('5400', 'Marketing', 'expense', 'Advertising and promotions'),
  ('5500', 'Transportation', 'expense', 'Logistics and delivery costs');

-- =====================================================================
-- ROW LEVEL SECURITY (tenant isolation; API layer enforces org scoping)
-- =====================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'kv_bos_organizations', 'kv_bos_org_members', 'kv_bos_departments',
    'kv_bos_employees', 'kv_bos_customers', 'kv_bos_contacts', 'kv_bos_leads', 'kv_bos_deals',
    'kv_bos_quotations', 'kv_bos_sales_orders', 'kv_bos_suppliers',
    'kv_bos_purchase_requests', 'kv_bos_purchase_orders', 'kv_bos_items', 'kv_bos_warehouses',
    'kv_bos_stock_movements', 'kv_bos_boms', 'kv_bos_production_orders', 'kv_bos_projects',
    'kv_bos_tasks', 'kv_bos_work_orders', 'kv_bos_assets', 'kv_bos_documents', 'kv_bos_approvals',
    'kv_bos_automation_rules', 'kv_bos_ncrs', 'kv_bos_incidents', 'kv_bos_gl_accounts',
    'kv_bos_journal_entries', 'kv_bos_invoices', 'kv_bos_knowledge_articles',
    'kv_bos_announcements', 'kv_bos_industry_modules', 'kv_bos_org_settings'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);',
      'bos_authenticated_all_' || replace(t, 'kv_bos_', ''), t
    );
  END LOOP;
END $$;
