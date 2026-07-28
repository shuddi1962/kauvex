-- KCC Phase 26: Kauvex Pro Network (KPN) & Professional Services (KPS)
-- Industry Operating System — Full Ecosystem
-- Extends Kauvex from marketplace to complete Industry OS

-- 1. KPN PROFESSIONALS
CREATE TABLE IF NOT EXISTS kv_kpn_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('individual', 'company')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name VARCHAR(200),
  cac_number VARCHAR(100),
  primary_category VARCHAR(100) NOT NULL,
  secondary_categories TEXT[] DEFAULT '{}',
  years_experience INT,
  coverage_area JSONB DEFAULT '{}',
  hourly_rate DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  emergency_available BOOLEAN DEFAULT FALSE,
  emergency_surcharge_percent DECIMAL(5,2),
  verification_tier VARCHAR(20) DEFAULT 'basic' CHECK (verification_tier IN ('basic', 'certified', 'gold', 'platinum')),
  rating_average DECIMAL(3,2) DEFAULT 0,
  total_jobs_completed INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  is_accepting_jobs BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  bio TEXT,
  profile_photo TEXT,
  phone VARCHAR(30),
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_professional_user ON kv_kpn_professionals(user_id);
CREATE INDEX idx_kpn_professional_category ON kv_kpn_professionals(primary_category);
CREATE INDEX idx_kpn_professional_tier ON kv_kpn_professionals(verification_tier);
CREATE INDEX idx_kpn_professional_status ON kv_kpn_professionals(status);

ALTER TABLE kv_kpn_professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals are viewable by everyone" ON kv_kpn_professionals
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can insert their own professional profile" ON kv_kpn_professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professional profile" ON kv_kpn_professionals
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. KPN CREDENTIALS
CREATE TABLE IF NOT EXISTS kv_kpn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES kv_kpn_professionals(id) ON DELETE CASCADE,
  credential_type VARCHAR(50) NOT NULL CHECK (credential_type IN ('certification', 'license', 'trade_test', 'oem_cert', 'background_check', 'insurance', 'nin', 'bvn', 'cac')),
  issuing_body VARCHAR(200),
  certificate_number VARCHAR(100),
  document_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_credential_professional ON kv_kpn_credentials(professional_id);
CREATE INDEX idx_kpn_credential_type ON kv_kpn_credentials(credential_type);
CREATE INDEX idx_kpn_credential_status ON kv_kpn_credentials(status);

ALTER TABLE kv_kpn_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credentials viewable by profile owner and admins" ON kv_kpn_credentials
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM kv_kpn_professionals WHERE id = professional_id)
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Professionals can insert their own credentials" ON kv_kpn_credentials
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM kv_kpn_professionals WHERE id = professional_id)
  );

CREATE POLICY "Admins can update credential status" ON kv_kpn_credentials
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

-- 3. KPS SERVICE BOOKINGS
CREATE TABLE IF NOT EXISTS kv_kps_service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  customer_id UUID NOT NULL,
  professional_id UUID REFERENCES kv_kpn_professionals(id) ON DELETE SET NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('installation', 'assembly', 'configuration', 'site_survey', 'calibration', 'testing', 'training', 'consultation')),
  product_id UUID,
  service_address JSONB DEFAULT '{}',
  scheduled_date DATE,
  scheduled_time_window VARCHAR(20) CHECK (scheduled_time_window IN ('morning', 'afternoon', 'evening')),
  estimated_duration_hours DECIMAL(5,2),
  service_fee DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  kauvex_commission DECIMAL(14,2),
  professional_payout DECIMAL(14,2),
  vendor_referral_bonus DECIMAL(14,2),
  status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'professional_assigned', 'professional_en_route', 'checked_in', 'in_progress', 'completed', 'disputed', 'cancelled')),
  checkin_time TIMESTAMPTZ,
  checkin_gps JSONB DEFAULT '{}',
  completion_time TIMESTAMPTZ,
  customer_signature_url TEXT,
  completion_report_url TEXT,
  installation_certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kps_booking_order ON kv_kps_service_bookings(order_id);
CREATE INDEX idx_kps_booking_customer ON kv_kps_service_bookings(customer_id);
CREATE INDEX idx_kps_booking_professional ON kv_kps_service_bookings(professional_id);
CREATE INDEX idx_kps_booking_status ON kv_kps_service_bookings(status);

ALTER TABLE kv_kps_service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own bookings" ON kv_kps_service_bookings
  FOR SELECT USING (auth.uid() = customer_id::uuid);

CREATE POLICY "Professionals can view assigned bookings" ON kv_kps_service_bookings
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM kv_kpn_professionals WHERE id = professional_id)
  );

CREATE POLICY "Customers can create bookings" ON kv_kps_service_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id::uuid);

-- 4. KPN PROJECTS
CREATE TABLE IF NOT EXISTS kv_kpn_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  project_name VARCHAR(200) NOT NULL,
  project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('residential_construction', 'commercial_construction', 'energy', 'marine', 'it_infrastructure', 'industrial', 'dredging', 'agriculture', 'other')),
  description TEXT,
  location JSONB DEFAULT '{}',
  budget_min DECIMAL(14,2),
  budget_max DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  timeline_start DATE,
  timeline_end DATE,
  status VARCHAR(30) DEFAULT 'posted' CHECK (status IN ('posted', 'receiving_bids', 'contractor_selected', 'in_progress', 'completed', 'cancelled', 'disputed')),
  total_milestones INT DEFAULT 0,
  completed_milestones INT DEFAULT 0,
  escrow_amount DECIMAL(14,2),
  documents JSONB DEFAULT '[]',
  rfis JSONB DEFAULT '[]',
  site_diary JSONB DEFAULT '[]',
  variation_orders JSONB DEFAULT '[]',
  material_list JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_project_customer ON kv_kpn_projects(customer_id);
CREATE INDEX idx_kpn_project_type ON kv_kpn_projects(project_type);
CREATE INDEX idx_kpn_project_status ON kv_kpn_projects(status);

ALTER TABLE kv_kpn_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by customer and bidders" ON kv_kpn_projects
  FOR SELECT USING (
    auth.uid() = customer_id::uuid
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'vendor')
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Customers can create projects" ON kv_kpn_projects
  FOR INSERT WITH CHECK (auth.uid() = customer_id::uuid);

CREATE POLICY "Customers can update own projects" ON kv_kpn_projects
  FOR UPDATE USING (auth.uid() = customer_id::uuid);

-- 5. KPN PROJECT BIDS
CREATE TABLE IF NOT EXISTS kv_kpn_project_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES kv_kpn_projects(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES kv_kpn_professionals(id) ON DELETE CASCADE,
  bid_amount DECIMAL(14,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'NGN',
  proposed_start DATE,
  proposed_end DATE,
  methodology TEXT,
  team_composition JSONB DEFAULT '[]',
  equipment_list JSONB DEFAULT '[]',
  payment_schedule JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'awarded', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_bid_project ON kv_kpn_project_bids(project_id);
CREATE INDEX idx_kpn_bid_professional ON kv_kpn_project_bids(professional_id);
CREATE INDEX idx_kpn_bid_status ON kv_kpn_project_bids(status);

ALTER TABLE kv_kpn_project_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids viewable by project owner and bidder" ON kv_kpn_project_bids
  FOR SELECT USING (
    auth.uid() IN (SELECT customer_id::uuid FROM kv_kpn_projects WHERE id = project_id)
    OR auth.uid() IN (SELECT user_id FROM kv_kpn_professionals WHERE id = professional_id)
  );

CREATE POLICY "Professionals can submit bids" ON kv_kpn_project_bids
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM kv_kpn_professionals WHERE id = professional_id)
  );

-- 6. KPN DIGITAL TWINS
CREATE TABLE IF NOT EXISTS kv_kpn_digital_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  order_id UUID,
  manufacturer VARCHAR(200),
  model VARCHAR(200),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  installation_date DATE,
  installer_id UUID REFERENCES kv_kpn_professionals(id) ON DELETE SET NULL,
  warranty_start DATE,
  warranty_end DATE,
  next_maintenance_due DATE,
  maintenance_interval_days INT,
  documents JSONB DEFAULT '[]',
  maintenance_history JSONB DEFAULT '[]',
  current_condition VARCHAR(20) DEFAULT 'good' CHECK (current_condition IN ('excellent', 'good', 'fair', 'poor')),
  insurance_policy_id UUID,
  ownership_history JSONB DEFAULT '[]',
  is_for_sale BOOLEAN DEFAULT FALSE,
  asking_price DECIMAL(14,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_twin_owner ON kv_kpn_digital_twins(owner_id);
CREATE INDEX idx_kpn_twin_type ON kv_kpn_digital_twins(asset_type);
CREATE INDEX idx_kpn_twin_onsale ON kv_kpn_digital_twins(is_for_sale);

ALTER TABLE kv_kpn_digital_twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Digital twins viewable by owner" ON kv_kpn_digital_twins
  FOR SELECT USING (auth.uid() = owner_id::uuid);

CREATE POLICY "Owners can create digital twins" ON kv_kpn_digital_twins
  FOR INSERT WITH CHECK (auth.uid() = owner_id::uuid);

CREATE POLICY "Owners can update digital twins" ON kv_kpn_digital_twins
  FOR UPDATE USING (auth.uid() = owner_id::uuid);

-- 7. KPN CONFIGURATOR SESSIONS
CREATE TABLE IF NOT EXISTS kv_kpn_configurator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  configurator_type VARCHAR(30) NOT NULL CHECK (configurator_type IN ('boat', 'solar', 'cctv', 'house', 'kitchen', 'dredging', 'security', 'farm', 'factory')),
  configuration JSONB DEFAULT '{}',
  ai_render_url TEXT,
  bill_of_materials JSONB DEFAULT '[]',
  cost_estimate_min DECIMAL(14,2),
  cost_estimate_max DECIMAL(14,2),
  currency_code VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'ordered', 'in_production')),
  quotes_received INT DEFAULT 0,
  selected_builder_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_config_user ON kv_kpn_configurator_sessions(user_id);
CREATE INDEX idx_kpn_config_type ON kv_kpn_configurator_sessions(configurator_type);
CREATE INDEX idx_kpn_config_status ON kv_kpn_configurator_sessions(status);

ALTER TABLE kv_kpn_configurator_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configurator sessions viewable by owner" ON kv_kpn_configurator_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create configurator sessions" ON kv_kpn_configurator_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurator sessions" ON kv_kpn_configurator_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. KPN MAINTENANCE SCHEDULES
CREATE TABLE IF NOT EXISTS kv_kpn_maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_twin_id UUID NOT NULL REFERENCES kv_kpn_digital_twins(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100) NOT NULL,
  frequency_days INT NOT NULL,
  last_completed DATE,
  next_due DATE,
  reminder_days_before INT DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT FALSE,
  preferred_professional_id UUID REFERENCES kv_kpn_professionals(id) ON DELETE SET NULL,
  auto_book BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_maint_twin ON kv_kpn_maintenance_schedules(digital_twin_id);
CREATE INDEX idx_kpn_maint_due ON kv_kpn_maintenance_schedules(next_due);
CREATE INDEX idx_kpn_maint_status ON kv_kpn_maintenance_schedules(status);

ALTER TABLE kv_kpn_maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maintenance schedules viewable by asset owner" ON kv_kpn_maintenance_schedules
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id::uuid FROM kv_kpn_digital_twins WHERE id = digital_twin_id)
  );

CREATE POLICY "Asset owners can create maintenance schedules" ON kv_kpn_maintenance_schedules
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id::uuid FROM kv_kpn_digital_twins WHERE id = digital_twin_id)
  );

CREATE POLICY "Asset owners can update maintenance schedules" ON kv_kpn_maintenance_schedules
  FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id::uuid FROM kv_kpn_digital_twins WHERE id = digital_twin_id)
  );

-- 9. KPN INDUSTRY HUBS
CREATE TABLE IF NOT EXISTS kv_kpn_industry_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name VARCHAR(100) NOT NULL,
  hub_slug VARCHAR(100) UNIQUE NOT NULL,
  subdomain VARCHAR(100),
  description TEXT,
  icon_url TEXT,
  hero_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  product_categories TEXT[] DEFAULT '{}',
  professional_categories TEXT[] DEFAULT '{}',
  configurators_available TEXT[] DEFAULT '{}',
  pillars_available TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpn_hub_slug ON kv_kpn_industry_hubs(hub_slug);
CREATE INDEX idx_kpn_hub_active ON kv_kpn_industry_hubs(is_active);

ALTER TABLE kv_kpn_industry_hubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Industry hubs are viewable by everyone" ON kv_kpn_industry_hubs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage industry hubs" ON kv_kpn_industry_hubs
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

-- Industry Hub Seeds
INSERT INTO kv_kpn_industry_hubs (hub_name, hub_slug, subdomain, description, product_categories, professional_categories, configurators_available, pillars_available, sort_order) VALUES
  ('Marine', 'marine', 'marine.kauvex.com', 'Marine equipment, boat building, vessel services, and marine professionals', ARRAY['boats', 'marine_engines', 'navigation', 'safety', 'fishing'], ARRAY['Naval Architect', 'Marine Engineer', 'Boat Builder', 'Marine Electrician'], ARRAY['boat'], ARRAY['products', 'professionals', 'projects', 'configurator', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 1),
  ('Construction', 'construction', 'construction.kauvex.com', 'Building materials, construction services, and project management', ARRAY['cement', 'iron_rods', 'blocks', 'roofing', 'tiles', 'paint', 'electrical', 'plumbing'], ARRAY['Architect', 'Structural Engineer', 'Quantity Surveyor', 'Building Contractor', 'Electrician', 'Plumber'], ARRAY['house'], ARRAY['products', 'professionals', 'projects', 'configurator', 'procurement', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 2),
  ('Renewable Energy', 'energy', 'energy.kauvex.com', 'Solar systems, inverters, batteries, and renewable energy solutions', ARRAY['solar_panels', 'inverters', 'batteries', 'charge_controllers', 'solar_pumps'], ARRAY['Solar Installer', 'Solar Engineer', 'Battery Specialist', 'Energy Auditor'], ARRAY['solar'], ARRAY['products', 'professionals', 'projects', 'configurator', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community'], 3),
  ('Security', 'security', 'security.kauvex.com', 'CCTV, access control, alarm systems, and security solutions', ARRAY['cameras', 'nvr_dvr', 'access_control', 'alarms', 'electric_fences'], ARRAY['CCTV Installer', 'Fire Alarm Engineer', 'Access Control Specialist', 'Security Consultant'], ARRAY['cctv', 'security'], ARRAY['products', 'professionals', 'projects', 'configurator', 'financing', 'insurance', 'asset_registry', 'training', 'knowledge', 'community'], 4),
  ('ICT', 'ict', 'ict.kauvex.com', 'IT equipment, networking, data center, and technology services', ARRAY['computers', 'networking', 'servers', 'cables', 'software'], ARRAY['Network Engineer', 'Fiber Optic Technician', 'Data Center Engineer', 'Cybersecurity Consultant'], ARRAY['security'], ARRAY['products', 'professionals', 'projects', 'configurator', 'rental', 'used_equipment', 'financing', 'asset_registry', 'training', 'knowledge', 'community'], 5),
  ('Dredging', 'dredging', 'dredging.kauvex.com', 'Dredging equipment, waterway management, and land reclamation', ARRAY['dredgers', 'pumps', 'pipes', 'survey_equipment'], ARRAY['Dredging Engineer', 'Hydrographic Surveyor', 'Dredger Operator'], ARRAY['dredging'], ARRAY['products', 'professionals', 'projects', 'configurator', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 6),
  ('Agriculture', 'agriculture', 'agriculture.kauvex.com', 'Farm equipment, irrigation, livestock, and agricultural supplies', ARRAY['tractors', 'irrigation', 'greenhouses', 'feeders', 'pumps'], ARRAY['Agricultural Engineer', 'Irrigation Specialist', 'Farm Consultant', 'Greenhouse Builder'], ARRAY['farm'], ARRAY['products', 'professionals', 'projects', 'configurator', 'rental', 'used_equipment', 'financing', 'insurance', 'asset_registry', 'training', 'knowledge', 'community'], 7),
  ('Manufacturing', 'manufacturing', 'manufacturing.kauvex.com', 'Industrial machinery, factory equipment, and manufacturing supplies', ARRAY['machinery', 'cnc', 'conveyors', 'packaging', 'industrial_tools'], ARRAY['Mechanical Engineer', 'CNC Operator', 'Industrial Designer', 'Quality Inspector'], ARRAY['factory'], ARRAY['products', 'professionals', 'projects', 'configurator', 'procurement', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 8),
  ('Healthcare', 'healthcare', 'healthcare.kauvex.com', 'Medical equipment, hospital supplies, and healthcare services', ARRAY['medical_equipment', 'lab_equipment', 'consumables', 'furniture'], ARRAY['Biomedical Engineer', 'Medical Equipment Installer', 'Hospital Infrastructure Contractor'], ARRAY[], ARRAY['products', 'professionals', 'projects', 'procurement', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community'], 9),
  ('Automotive', 'automotive', 'automotive.kauvex.com', 'Vehicle parts, auto accessories, and automotive services', ARRAY['car_parts', 'tyres', 'batteries', 'accessories', 'tools'], ARRAY['Auto Electrician', 'Mechanic', 'Panel Beater', 'Diagnostic Engineer'], ARRAY[], ARRAY['products', 'professionals', 'projects', 'rental', 'used_equipment', 'financing', 'insurance', 'asset_registry', 'training', 'knowledge', 'community'], 10),
  ('Oil & Gas', 'oil-and-gas', 'oilandgas.kauvex.com', 'Oil and gas equipment, services, and industry professionals', ARRAY['pipeline', 'valves', 'pumps', 'safety', 'drilling'], ARRAY['Pipeline Engineer', 'HSE Officer', 'Process Engineer', 'Commissioning Engineer'], ARRAY[], ARRAY['products', 'professionals', 'projects', 'procurement', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 11),
  ('Mining', 'mining', 'mining.kauvex.com', 'Mining equipment, minerals, and mining services', ARRAY['mining_equipment', 'conveyors', 'crushers', 'safety_gear'], ARRAY['Mining Engineer', 'Geologist', 'Equipment Operator'], ARRAY[], ARRAY['products', 'professionals', 'projects', 'procurement', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community', 'intelligence'], 12),
  ('Real Estate', 'real-estate', 'realestate.kauvex.com', 'Property listings, real estate services, and property management', ARRAY['properties', 'furniture', 'home_appliances', 'security'], ARRAY['Architect', 'Interior Designer', 'Property Manager', 'Land Surveyor'], ARRAY['house', 'kitchen'], ARRAY['products', 'professionals', 'projects', 'financing', 'insurance', 'compliance', 'asset_registry', 'knowledge', 'community', 'intelligence'], 13),
  ('Hospitality', 'hospitality', 'hospitality.kauvex.com', 'Hotel supplies, catering equipment, and hospitality services', ARRAY['kitchen_equipment', 'furniture', 'linen', 'cleaning'], ARRAY['Chef', 'Hotel Manager', 'Facility Manager'], ARRAY['kitchen'], ARRAY['products', 'professionals', 'projects', 'procurement', 'financing', 'insurance', 'knowledge', 'community', 'intelligence'], 14),
  ('Aviation', 'aviation', 'aviation.kauvex.com', 'Aviation equipment, parts, and aerospace services', ARRAY['aviation_parts', 'ground_equipment', 'avionics', 'safety'], ARRAY['Aircraft Engineer', 'Avionics Technician', 'Ground Operations Specialist'], ARRAY[], ARRAY['products', 'professionals', 'projects', 'procurement', 'rental', 'used_equipment', 'financing', 'insurance', 'compliance', 'asset_registry', 'training', 'knowledge', 'community'], 15);