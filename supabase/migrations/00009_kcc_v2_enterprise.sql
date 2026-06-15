-- KAUVEX COMMERCE CLOUD v2 — Enterprise+
-- Sections 86-116: ERP, Procurement, Supplier Network, RFQ, B2B, BNPL,
-- Vendor Financing, Affiliate Marketing, Social Commerce, Live Shopping,
-- Auctions, Subscriptions, Digital Products, Email Marketing, CRM,
-- AI Assistant, Forecasting, Fraud Detection, Chat, Multi-Language,
-- Franchise, Geo Marketplace, Reputation, Authenticity, Tax, Accounting,
-- Insurance, Credit System
-- ============================================================

-- ============================================================
-- SECTION 86-87: ERP / PROCUREMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS erp_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense')),
  parent_id UUID REFERENCES erp_accounts(id),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erp_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  reference_type TEXT,
  reference_id TEXT,
  total_debit DECIMAL(14,2) DEFAULT 0,
  total_credit DECIMAL(14,2) DEFAULT 0,
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erp_journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES erp_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES erp_accounts(id),
  debit DECIMAL(14,2) DEFAULT 0,
  credit DECIMAL(14,2) DEFAULT 0,
  description TEXT,
  cost_center TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erp_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  budget_amount DECIMAL(14,2) DEFAULT 0,
  spent_amount DECIMAL(14,2) DEFAULT 0,
  manager TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erp_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INT NOT NULL,
  account_id UUID REFERENCES erp_accounts(id),
  cost_center_id UUID REFERENCES erp_cost_centers(id),
  budgeted_amount DECIMAL(14,2) DEFAULT 0,
  actual_amount DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS procurement_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'net30',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended','inactive')),
  rating DECIMAL(2,1) DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(14,2) DEFAULT 0,
  is_certified BOOLEAN DEFAULT false,
  certifications JSONB DEFAULT '[]',
  categories TEXT[] DEFAULT '{}',
  moq_policy TEXT,
  lead_time_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS procurement_supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  moq INT DEFAULT 1,
  available_qty INT DEFAULT 0,
  lead_time_days INT DEFAULT 0,
  description TEXT,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS procurement_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','confirmed','shipped','partially_received','received','cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'USD',
  subtotal DECIMAL(14,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  customs_cost DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','partial','refunded')),
  payment_terms TEXT DEFAULT 'net30',
  shipping_method TEXT,
  tracking_number TEXT,
  created_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS procurement_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE,
  supplier_product_id UUID REFERENCES procurement_supplier_products(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INT NOT NULL DEFAULT 1,
  received_qty INT DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  warehouse_id UUID,
  bin_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 88-89: SUPPLIER NETWORK + RFQ
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id) ON DELETE CASCADE,
  cert_type TEXT NOT NULL,
  cert_name TEXT NOT NULL,
  issuing_body TEXT,
  cert_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  file_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number TEXT UNIQUE NOT NULL,
  buyer_id UUID,
  buyer_company TEXT,
  buyer_contact TEXT,
  buyer_email TEXT,
  product_needed TEXT NOT NULL,
  quantity INT NOT NULL,
  delivery_country TEXT,
  delivery_timeline TEXT,
  budget_range_min DECIMAL(12,2),
  budget_range_max DECIMAL(12,2),
  packaging_requirements TEXT,
  specifications TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','responded','awarded','closed','cancelled')),
  response_count INT DEFAULT 0,
  awarded_to UUID REFERENCES procurement_suppliers(id),
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rfq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  lead_time_days INT,
  delivery_terms TEXT,
  validity_days INT DEFAULT 30,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 90: B2B WHOLESALE PORTAL
-- ============================================================

CREATE TABLE IF NOT EXISTS b2b_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,
  business_type TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  verification_docs JSONB DEFAULT '[]',
  credit_limit DECIMAL(14,2) DEFAULT 0,
  credit_used DECIMAL(14,2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'net30',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','closed')),
  account_manager TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES b2b_companies(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('admin','buyer','approver','viewer')),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  min_quantity INT DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES b2b_companies(id),
  customer_name TEXT NOT NULL,
  contact_email TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','negotiating','accepted','rejected','expired')),
  subtotal DECIMAL(14,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(14,2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES b2b_quotes(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  type TEXT DEFAULT 'product' CHECK (type IN ('product','service')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES b2b_companies(id),
  quote_id UUID REFERENCES b2b_quotes(id),
  customer_name TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  amount_paid DECIMAL(14,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled','refunded')),
  due_date DATE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 91: BNPL (BUY NOW PAY LATER)
-- ============================================================

CREATE TABLE IF NOT EXISTS bnpl_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  down_payment_percent DECIMAL(5,2) NOT NULL DEFAULT 25,
  installment_count INT NOT NULL DEFAULT 4,
  installment_frequency TEXT DEFAULT 'monthly' CHECK (installment_frequency IN ('weekly','biweekly','monthly')),
  interest_rate DECIMAL(5,2) DEFAULT 0,
  late_fee_percent DECIMAL(5,2) DEFAULT 5,
  min_order_amount DECIMAL(12,2) DEFAULT 0,
  max_order_amount DECIMAL(12,2) DEFAULT 999999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bnpl_credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL,
  score INT DEFAULT 500 CHECK (score >= 0 AND score <= 1000),
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('poor','fair','standard','good','excellent')),
  total_borrowed DECIMAL(14,2) DEFAULT 0,
  total_repaid DECIMAL(14,2) DEFAULT 0,
  active_contracts INT DEFAULT 0,
  completed_contracts INT DEFAULT 0,
  late_payments INT DEFAULT 0,
  last_assessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bnpl_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  order_id TEXT,
  plan_id UUID NOT NULL REFERENCES bnpl_plans(id),
  total_amount DECIMAL(14,2) NOT NULL,
  down_payment DECIMAL(14,2) NOT NULL,
  down_paid BOOLEAN DEFAULT false,
  installment_amount DECIMAL(12,2) NOT NULL,
  total_interest DECIMAL(12,2) DEFAULT 0,
  total_installments INT NOT NULL,
  installments_paid INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','completed','defaulted','cancelled')),
  next_payment_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bnpl_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES bnpl_contracts(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','late','failed')),
  late_fee DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  gateway_ref TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 92: VENDOR FINANCING
-- ============================================================

CREATE TABLE IF NOT EXISTS vendor_financing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('inventory','advertising','store_growth','fulfillment')),
  requested_amount DECIMAL(14,2) NOT NULL,
  approved_amount DECIMAL(14,2),
  currency TEXT DEFAULT 'USD',
  term_months INT DEFAULT 12,
  interest_rate DECIMAL(5,2),
  purpose TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','rejected','disbursed','completed','defaulted')),
  monthly_sales DECIMAL(14,2),
  return_rate DECIMAL(5,2),
  customer_rating DECIMAL(2,1),
  delivery_performance DECIMAL(5,2),
  store_age_months INT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_financing_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES vendor_financing_applications(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','late','defaulted')),
  late_fee DECIMAL(10,2) DEFAULT 0,
  gateway_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 93: AFFILIATE MARKETING NETWORK
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  tier INT DEFAULT 1,
  min_payout DECIMAL(10,2) DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  order_id TEXT,
  product_id TEXT,
  sale_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  gateway_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 94-95: SOCIAL COMMERCE + LIVE SHOPPING
-- ============================================================

CREATE TABLE IF NOT EXISTS social_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  vendor_id UUID,
  full_name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_sales INT DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES social_creators(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video','image','carousel','story','post')),
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  is_shoppable BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','published','archived','flagged')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_content_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES social_content(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT,
  price_at_pin DECIMAL(12,2),
  pin_position JSONB,
  clicks INT DEFAULT 0,
  sales INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES social_creators(id),
  vendor_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INT DEFAULT 0,
  peak_viewers INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_stream_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT,
  price DECIMAL(12,2),
  flash_price DECIMAL(12,2),
  quantity INT DEFAULT 0,
  sold INT DEFAULT 0,
  pinned_at TIMESTAMPTZ DEFAULT now(),
  unpinned_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 96: AUCTION MARKETPLACE
-- ============================================================

CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  vendor_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  starting_bid DECIMAL(12,2) NOT NULL,
  reserve_price DECIMAL(12,2),
  current_bid DECIMAL(12,2),
  min_bid_increment DECIMAL(10,2) DEFAULT 1.00,
  bid_count INT DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','extended','ended','sold','unsold','cancelled')),
  winner_id UUID,
  winner_bid DECIMAL(12,2),
  auto_extend BOOLEAN DEFAULT true,
  auto_extend_minutes INT DEFAULT 5,
  auto_bid_enabled BOOLEAN DEFAULT true,
  max_auto_bid DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT false,
  max_bid_amount DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auction_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, auction_id)
);

-- ============================================================
-- SECTION 97: SUBSCRIPTION COMMERCE (Customer-facing)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  product_id TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly','monthly','quarterly','annual')),
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  trial_days INT DEFAULT 0,
  min_commitment_months INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','expired','past_due')),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  next_billing_date DATE,
  last_billing_date TIMESTAMPTZ,
  billing_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  order_id TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','refunded')),
  gateway_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 98: DIGITAL PRODUCTS / LICENSES
-- ============================================================

CREATE TABLE IF NOT EXISTS digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('software','course','ebook','pdf','membership','license','template')),
  file_url TEXT,
  file_size BIGINT DEFAULT 0,
  download_limit INT DEFAULT 5,
  requires_license BOOLEAN DEFAULT false,
  license_generation_rule TEXT,
  delivery_method TEXT DEFAULT 'download' CHECK (delivery_method IN ('download','email','api')),
  sample_url TEXT,
  system_requirements TEXT,
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_product_id UUID NOT NULL REFERENCES digital_products(id),
  order_id TEXT,
  customer_id UUID,
  license_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked','expired','used')),
  max_activations INT DEFAULT 1,
  activation_count INT DEFAULT 0,
  activations JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 99: EMAIL MARKETING
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  category TEXT DEFAULT 'general',
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  recipient_filter JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused','cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  bounced_count INT DEFAULT 0,
  unsubscribed_count INT DEFAULT 0,
  revenue DECIMAL(14,2) DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent','delivered','opened','clicked','bounced','unsubscribed','failed')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subscriber_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  list_id UUID REFERENCES email_lists(id),
  full_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(email, list_id)
);

-- ============================================================
-- SECTION 100: CRM ENHANCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS crm_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID,
  customer_email TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_on_customer','resolved','closed')),
  assigned_to TEXT,
  order_id TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  rating INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES crm_tickets(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_role TEXT,
  sender_name TEXT,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id),
  company_id UUID REFERENCES b2b_companies(id),
  customer_id UUID,
  title TEXT NOT NULL,
  value DECIMAL(14,2) DEFAULT 0,
  stage TEXT NOT NULL,
  probability INT DEFAULT 0,
  expected_close_date DATE,
  source TEXT,
  notes TEXT,
  assigned_to TEXT,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES crm_deals(id),
  ticket_id UUID REFERENCES crm_tickets(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 101-103: AI ASSISTANT, FORECASTING, FRAUD
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  context_type TEXT DEFAULT 'shopping',
  context_id TEXT,
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_quantity INT NOT NULL,
  confidence_lower INT,
  confidence_upper INT,
  factors JSONB DEFAULT '{}',
  actual_quantity INT,
  accuracy DECIMAL(5,2),
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('return','order','payment','account','review')),
  entity_id TEXT NOT NULL,
  risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  indicators JSONB DEFAULT '[]',
  action_taken TEXT,
  flagged_by TEXT DEFAULT 'system',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 104: INTERNAL CHAT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('vendor_customer','admin_vendor','warehouse_driver','support_ticket','system')),
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_role TEXT,
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file','system')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 105: MULTI-LANGUAGE SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT,
  is_rtl BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  namespace TEXT DEFAULT 'general',
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key, namespace)
);

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES languages(code),
  value TEXT NOT NULL,
  is_auto_translated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key_id, language_code)
);

-- ============================================================
-- SECTION 107: POS ENHANCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  terminal_type TEXT DEFAULT 'counter' CHECK (terminal_type IN ('counter','mobile','kiosk','tablet')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online','offline','maintenance')),
  last_ping_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  staff_id UUID,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_balance DECIMAL(12,2) DEFAULT 0,
  closing_balance DECIMAL(12,2),
  cash_sales DECIMAL(12,2) DEFAULT 0,
  card_sales DECIMAL(12,2) DEFAULT 0,
  transfer_sales DECIMAL(12,2) DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_refunds DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','reconciled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 108: FRANCHISE / RESELLER NETWORK
-- ============================================================

CREATE TABLE IF NOT EXISTS franchise_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('franchise','reseller','agent','affiliate')),
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  territory TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','terminated')),
  total_commission_earned DECIMAL(14,2) DEFAULT 0,
  total_commission_paid DECIMAL(14,2) DEFAULT 0,
  total_sales INT DEFAULT 0,
  parent_agent_id UUID REFERENCES franchise_agents(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchise_mini_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES franchise_agents(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  theme JSONB DEFAULT '{}',
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  is_active BOOLEAN DEFAULT true,
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 109: GEO MARKETPLACE ENGINE
-- ============================================================

CREATE TABLE IF NOT EXISTS product_geo_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  price_adjustment DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, country_code)
);

-- ============================================================
-- SECTION 110-111: REPUTATION + AUTHENTICITY
-- ============================================================

CREATE TABLE IF NOT EXISTS vendor_reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID UNIQUE NOT NULL,
  overall_score DECIMAL(3,1) DEFAULT 0,
  delivery_speed_score DECIMAL(3,1) DEFAULT 0,
  return_rate_score DECIMAL(3,1) DEFAULT 0,
  satisfaction_score DECIMAL(3,1) DEFAULT 0,
  complaint_rate_score DECIMAL(3,1) DEFAULT 0,
  authenticity_score DECIMAL(3,1) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  return_rate DECIMAL(5,2) DEFAULT 0,
  complaint_rate DECIMAL(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_authenticity_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  authenticity_code TEXT UNIQUE NOT NULL,
  nfc_tag_id TEXT,
  qr_code_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','verified','revoked','expired')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 112-113: TAX + ACCOUNTING
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('sales','purchase','credit_note','debit_note')),
  customer_id UUID,
  supplier_id UUID REFERENCES procurement_suppliers(id),
  order_id TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(14,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(14,2) NOT NULL,
  amount_paid DECIMAL(14,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled','refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounting_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES accounting_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounting_general_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  description TEXT,
  debit DECIMAL(14,2) DEFAULT 0,
  credit DECIMAL(14,2) DEFAULT 0,
  balance DECIMAL(14,2) DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 114: MARKETPLACE INSURANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT UNIQUE NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('shipment','product_protection','extended_warranty','liability')),
  customer_id UUID,
  vendor_id UUID,
  order_id TEXT,
  product_id TEXT,
  coverage_amount DECIMAL(14,2) NOT NULL,
  premium_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','claimed','cancelled')),
  terms JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  claim_amount DECIMAL(14,2) NOT NULL,
  approved_amount DECIMAL(14,2),
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected','paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 115: MARKETPLACE CREDIT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES b2b_companies(id),
  customer_id UUID,
  requested_limit DECIMAL(14,2) NOT NULL,
  approved_limit DECIMAL(14,2),
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT DEFAULT 'net30',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES b2b_companies(id),
  customer_id UUID,
  credit_limit DECIMAL(14,2) NOT NULL,
  credit_used DECIMAL(14,2) DEFAULT 0,
  credit_available DECIMAL(14,2) GENERATED ALWAYS AS (credit_limit - credit_used) STORED,
  currency TEXT DEFAULT 'USD',
  interest_rate DECIMAL(5,2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'net30',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_erp_journal_date ON erp_journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_erp_journal_lines_entry ON erp_journal_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_erp_journal_lines_account ON erp_journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_erp_accounts_type ON erp_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_erp_budgets_fiscal ON erp_budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_procurement_po_supplier ON procurement_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_po_status ON procurement_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_procurement_po_items_po ON procurement_purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_procurement_supplier_products_supplier ON procurement_supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq ON rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_b2b_companies_status ON b2b_companies(status);
CREATE INDEX IF NOT EXISTS idx_b2b_quotes_company ON b2b_quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_company ON b2b_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_contracts_customer ON bnpl_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_contracts_status ON bnpl_contracts(status);
CREATE INDEX IF NOT EXISTS idx_bnpl_payments_contract ON bnpl_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_payments_status ON bnpl_payments(status);
CREATE INDEX IF NOT EXISTS idx_vendor_financing_vendor ON vendor_financing_applications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_financing_status ON vendor_financing_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_social_content_creator ON social_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_social_content_type ON social_content(content_type);
CREATE INDEX IF NOT EXISTS idx_live_streams_creator ON live_streams(creator_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer ON customer_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_license_keys_product ON license_keys(digital_product_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_status ON crm_tickets(status);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_assigned ON crm_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_ticket_messages_ticket ON crm_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline ON crm_deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_product ON demand_forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON demand_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_fraud_checks_entity ON fraud_checks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_terminal ON pos_sessions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX IF NOT EXISTS idx_franchise_agents_type ON franchise_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_franchise_agents_status ON franchise_agents(status);
CREATE INDEX IF NOT EXISTS idx_franchise_mini_stores_agent ON franchise_mini_stores(agent_id);
CREATE INDEX IF NOT EXISTS idx_product_geo_visibility_product ON product_geo_visibility(product_id);
CREATE INDEX IF NOT EXISTS idx_product_authenticity_codes_product ON product_authenticity_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_authenticity_codes_status ON product_authenticity_codes(status);
CREATE INDEX IF NOT EXISTS idx_accounting_invoices_type ON accounting_invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_accounting_general_ledger_date ON accounting_general_ledger(entry_date);
CREATE INDEX IF NOT EXISTS idx_accounting_general_ledger_account ON accounting_general_ledger(account_code);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_type ON insurance_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_credit_applications_status ON credit_applications(status);
CREATE INDEX IF NOT EXISTS idx_credit_lines_company ON credit_lines(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reputation_scores_score ON vendor_reputation_scores(overall_score);
CREATE INDEX IF NOT EXISTS idx_erp_cost_centers_code ON erp_cost_centers(code);
