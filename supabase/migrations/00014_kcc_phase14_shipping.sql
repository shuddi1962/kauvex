-- Phase 14: Complete Shipping & Logistics System
-- All new tables use kv_ship_ prefix
-- Non-destructive: extends existing tables, never modifies them

-- ============================================================
-- LOGISTICS PARTNERS (Network Partners - Tier 1 & 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_logistics_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_type VARCHAR(50) NOT NULL, -- rider | driver | courier_business | freight_company
    account_holder_name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    email VARCHAR(200) UNIQUE,
    phone VARCHAR(30) NOT NULL,
    government_id_url TEXT,
    business_reg_doc_url TEXT,
    vehicle_reg_url TEXT,
    vehicle_ins_url TEXT,
    vehicle_type VARCHAR(50),
    max_weight_kg DECIMAL(10,2),
    max_volume_m3 DECIMAL(10,2),
    base_city VARCHAR(100) NOT NULL,
    base_state VARCHAR(100),
    base_country VARCHAR(100) NOT NULL,
    service_radius_km INT,
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(200),
    bvn VARCHAR(20),
    payout_schedule VARCHAR(20) DEFAULT 'weekly', -- daily | weekly | bi_weekly
    status VARCHAR(20) DEFAULT 'pending', -- pending | active | suspended | banned
    tier VARCHAR(20) DEFAULT 'new', -- new | verified | trusted | premium
    jobs_completed INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    on_time_rate DECIMAL(5,2) DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    current_lat DECIMAL(10,6),
    current_lng DECIMAL(10,6),
    last_heartbeat TIMESTAMPTZ,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    wallet_balance DECIMAL(12,2) DEFAULT 0,
    incident_count INT DEFAULT 0,
    fleet_data JSONB DEFAULT '[]', -- Type 3/4 fleet members
    routes_data JSONB DEFAULT '[]', -- Type 4 scheduled routes [{origin,dest,schedule}]
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOGISTICS JOBS (Tier 1 & 2 delivery jobs)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_logistics_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50),
    express_shipment_id UUID,
    tier VARCHAR(20) NOT NULL, -- tier_1 | tier_2 | tier_3
    partner_id UUID REFERENCES kv_logistics_partners(id),
    partner_type VARCHAR(50),
    carrier_code VARCHAR(50), -- carrier API code
    pickup_address TEXT,
    pickup_city VARCHAR(100),
    pickup_country VARCHAR(100),
    pickup_lat DECIMAL(10,6),
    pickup_lng DECIMAL(10,6),
    dropoff_address TEXT,
    dropoff_city VARCHAR(100),
    dropoff_country VARCHAR(100),
    dropoff_lat DECIMAL(10,6),
    dropoff_lng DECIMAL(10,6),
    weight_kg DECIMAL(10,3),
    distance_km DECIMAL(10,2),
    declared_value DECIMAL(12,2),
    payout_amount DECIMAL(10,2),
    platform_fee DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'pending', -- pending | offered | accepted | heading_to_pickup | arrived_at_pickup | picked_up | in_transit | arrived_at_delivery | out_for_delivery | delivered | failed | returned | cancelled
    offered_to UUID[] DEFAULT '{}',
    acceptance_deadline TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failure_reason TEXT,
    proof_of_delivery TEXT,
    delivery_pin VARCHAR(10),
    signature_required BOOLEAN DEFAULT false,
    customer_notified_at TIMESTAMPTZ,
    tracking_events JSONB DEFAULT '[]', -- [{status, location, timestamp, description}]
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENDOR SHIPPING PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_shipping_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(50) NOT NULL,
    profile_name VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    carrier_selection JSONB DEFAULT '[]', -- [{code, type, accountNumber, apiKey, handoffMethod}]
    unit_system VARCHAR(10) DEFAULT 'metric', -- metric | imperial
    dim_weight_divisor INT DEFAULT 5000,
    price_logic VARCHAR(20) DEFAULT 'realtime', -- realtime | flat_table | free_shipping
    flat_rates JSONB DEFAULT '[]', -- [{weightMin, weightMax, zone, price}]
    free_shipping_min DECIMAL(12,2),
    markup_percent DECIMAL(5,2),
    markup_fixed DECIMAL(10,2),
    handling_fee DECIMAL(10,2) DEFAULT 0,
    fragile_handling BOOLEAN DEFAULT false,
    contains_batteries BOOLEAN DEFAULT false,
    contains_liquids BOOLEAN DEFAULT false,
    temp_sensitive BOOLEAN DEFAULT false,
    age_verification BOOLEAN DEFAULT false,
    is_high_value BOOLEAN DEFAULT false,
    coverage_countries TEXT[] DEFAULT '{}',
    excluded_regions TEXT[] DEFAULT '{}',
    ship_to_same_city VARCHAR(50),
    ship_to_same_state VARCHAR(50),
    ship_to_other_states VARCHAR(50),
    ship_international VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FBK DEBT MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_fbk_debt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(50) NOT NULL,
    debt_type VARCHAR(50) NOT NULL, -- storage | inbound | pick_pack | removal
    amount DECIMAL(10,2) NOT NULL,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    status VARCHAR(20) DEFAULT 'outstanding', -- outstanding | partial | cleared | written_off
    recovery_from_sales DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cleared_at TIMESTAMPTZ
);

-- ============================================================
-- INSURANCE RESERVE
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_insurance_reserve (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL,
    shipment_type VARCHAR(20) NOT NULL, -- marketplace | express | fbk
    declared_value DECIMAL(12,2) NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    premium_rate DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active | claimed | expired
    claim_amount DECIMAL(12,2),
    claim_status VARCHAR(20),
    claim_approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMS DOCUMENTS (International shipping docs)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_customs_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL,
    shipment_type VARCHAR(20) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- commercial_invoice | packing_list | cn22 | cn23 | air_waybill | bill_of_lading
    document_url TEXT,
    hs_codes JSONB DEFAULT '[]',
    declared_value DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'NGN',
    incoterm VARCHAR(10) DEFAULT 'DAP',
    origin_country VARCHAR(100),
    dest_country VARCHAR(100),
    customs_status VARCHAR(30) DEFAULT 'pending', -- pending | submitted | cleared | held | rejected
    duties_estimated DECIMAL(12,2),
    duties_actual DECIMAL(12,2),
    duties_paid_by VARCHAR(20) DEFAULT 'customer', -- customer | vendor | kauvex
    awb_number VARCHAR(50),
    bol_reference VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HS CODES (Harmonized System codes for customs)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_hs_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50),
    product_id VARCHAR(50),
    hs_code VARCHAR(20) NOT NULL,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESTRICTED ITEMS (International shipping restrictions)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_restricted_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_description VARCHAR(200) NOT NULL,
    restriction_type VARCHAR(20) NOT NULL, -- global | country_specific
    country_code VARCHAR(10),
    restriction_level VARCHAR(20) NOT NULL, -- soft_warning | hard_block
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENDOR DROP-OFF MANIFESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_dropoff_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(50) NOT NULL,
    hub_id VARCHAR(50),
    order_ids UUID[] DEFAULT '{}',
    waybill_numbers TEXT[] DEFAULT '{}',
    total_packages INT NOT NULL,
    total_weight_kg DECIMAL(10,3),
    status VARCHAR(20) DEFAULT 'pending', -- pending | received | partial | discrepancy
    dropped_off_at TIMESTAMPTZ,
    received_by VARCHAR(50),
    discrepancy_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PACKAGING ELEMENTS REGISTRY
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_packaging_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- outer | inner | seal | insert | label
    name VARCHAR(200) NOT NULL,
    size_code VARCHAR(20),
    dimensions_cm JSONB,
    max_weight_kg DECIMAL(10,3),
    unit_cost DECIMAL(10,2),
    is_kauvex_branded BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PACKAGING ADD-ONS (Premium packaging services)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_packaging_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    available_for VARCHAR(50) DEFAULT 'all', -- fbk | express | all
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER PACKAGING (Per-order packaging record)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_order_packaging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(50) NOT NULL,
    fulfillment_type VARCHAR(20) NOT NULL, -- fbk | fbm | supplier | cj | pod | express
    outer_packaging_id UUID,
    inner_protection JSONB DEFAULT '[]',
    seal_type VARCHAR(50),
    inserts JSONB DEFAULT '[]',
    add_ons JSONB DEFAULT '[]',
    packaging_cost DECIMAL(10,2),
    kauvex_branded BOOLEAN DEFAULT true,
    vendor_branded BOOLEAN DEFAULT false,
    white_label BOOLEAN DEFAULT false,
    gift_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SURGE PRICING PERIODS
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_surge_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    surge_multiplier DECIMAL(5,2) DEFAULT 1.5,
    applicable_tiers TEXT[] DEFAULT '{}',
    applicable_regions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COVERAGE GAPS ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_coverage_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    gap_severity VARCHAR(20) NOT NULL, -- critical | moderate | minor
    demand_score INT DEFAULT 0,
    partner_count INT DEFAULT 0,
    recruitment_campaign_launched BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSINESS ACCOUNTS (Kauvex Express for Business)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_business_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(200) UNIQUE NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    billing_type VARCHAR(20) DEFAULT 'per_shipment', -- per_shipment | monthly_invoice | prepaid_wallet
    wallet_balance DECIMAL(12,2) DEFAULT 0,
    volume_tier VARCHAR(20) DEFAULT 'bronze', -- bronze | silver | gold | platinum
    discount_percent DECIMAL(5,2) DEFAULT 0,
    monthly_invoice_day INT DEFAULT 1,
    payment_terms_days INT DEFAULT 30,
    api_access BOOLEAN DEFAULT false,
    custom_waybill_branding BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPRESS SHIPMENTS (Kauvex Express standalone courier)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_express_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waybill_number VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(200) NOT NULL,
    sender_phone VARCHAR(30) NOT NULL,
    sender_email VARCHAR(200),
    business_account_id UUID REFERENCES kv_ship_business_accounts(id),
    receiver_name VARCHAR(200) NOT NULL,
    receiver_phone VARCHAR(30) NOT NULL,
    pickup_address TEXT,
    pickup_city VARCHAR(100),
    pickup_country VARCHAR(100) NOT NULL,
    pickup_lat DECIMAL(10,6),
    pickup_lng DECIMAL(10,6),
    dropoff_address TEXT,
    dropoff_city VARCHAR(100),
    dropoff_country VARCHAR(100) NOT NULL,
    dropoff_lat DECIMAL(10,6),
    dropoff_lng DECIMAL(10,6),
    contents_type VARCHAR(50),
    contents_description TEXT,
    weight_kg DECIMAL(10,3),
    length_cm DECIMAL(10,2),
    width_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    dimensional_weight_kg DECIMAL(10,3),
    chargeable_weight_kg DECIMAL(10,3),
    declared_value DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'NGN',
    service_level VARCHAR(20), -- economy | standard | express | same_day
    tier VARCHAR(20),
    carrier_used VARCHAR(50),
    price_paid DECIMAL(12,2),
    insurance_purchased BOOLEAN DEFAULT false,
    insurance_premium DECIMAL(10,2),
    pack_for_me BOOLEAN DEFAULT false,
    pack_for_me_fee DECIMAL(10,2),
    special_instructions TEXT,
    signature_required BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(200),
    logistics_job_id UUID,
    status VARCHAR(20) DEFAULT 'pending', -- pending | picked_up | in_transit | out_for_delivery | delivered | failed | returned
    waybill_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RATE CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier VARCHAR(20) NOT NULL, -- tier_1 | tier_2 | tier_3_air | tier_3_sea
    origin_country VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100),
    destination_city VARCHAR(100),
    weight_min_kg DECIMAL(10,3),
    weight_max_kg DECIMAL(10,3),
    base_rate DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    partner_payout_percent DECIMAL(5,2),
    kauvex_fee_percent DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PICKUP WINDOWS (Vendor pickup availability)
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_pickup_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(50) NOT NULL,
    day_of_week INT NOT NULL, -- 0=Sunday .. 6=Saturday
    is_available BOOLEAN DEFAULT true,
    open_time VARCHAR(10), -- HH:MM format
    close_time VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTNER PAYOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS kv_ship_partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES kv_logistics_partners(id),
    amount DECIMAL(12,2) NOT NULL,
    deduction_amount DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending | processing | paid | failed
    payout_reference VARCHAR(200),
    period_start DATE,
    period_end DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_logistics_jobs_status ON kv_logistics_jobs(status);
CREATE INDEX IF NOT EXISTS idx_logistics_jobs_partner ON kv_logistics_jobs(partner_id);
CREATE INDEX IF NOT EXISTS idx_logistics_jobs_order ON kv_logistics_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_jobs_tier ON kv_logistics_jobs(tier);
CREATE INDEX IF NOT EXISTS idx_logistics_partners_city ON kv_logistics_partners(base_city, base_country);
CREATE INDEX IF NOT EXISTS idx_logistics_partners_status ON kv_logistics_partners(status);
CREATE INDEX IF NOT EXISTS idx_logistics_partners_online ON kv_logistics_partners(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_shipping_profiles_vendor ON kv_shipping_profiles(vendor_id);
CREATE INDEX IF NOT EXISTS idx_fbk_debt_vendor ON kv_ship_fbk_debt(vendor_id);
CREATE INDEX IF NOT EXISTS idx_fbk_debt_status ON kv_ship_fbk_debt(status);
CREATE INDEX IF NOT EXISTS idx_insurance_shipment ON kv_ship_insurance_reserve(shipment_id);
CREATE INDEX IF NOT EXISTS idx_customs_shipment ON kv_ship_customs_documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_hs_codes_code ON kv_ship_hs_codes(hs_code);
CREATE INDEX IF NOT EXISTS idx_express_waybill ON kv_ship_express_shipments(waybill_number);
CREATE INDEX IF NOT EXISTS idx_express_status ON kv_ship_express_shipments(status);
CREATE INDEX IF NOT EXISTS idx_express_business ON kv_ship_express_shipments(business_account_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_route ON kv_ship_rate_cards(origin_country, destination_country, tier);
CREATE INDEX IF NOT EXISTS idx_dropoff_vendor ON kv_ship_dropoff_manifests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_pickup_windows_vendor ON kv_ship_pickup_windows(vendor_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON kv_ship_partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON kv_ship_partner_payouts(status);
