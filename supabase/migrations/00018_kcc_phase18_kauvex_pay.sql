-- ============================================================
-- PHASE 18: KAUVEX PAY — WALLET + BNPL
-- Migration: 00018_kcc_phase18_kauvex_pay.sql
-- ============================================================

-- KAUVEX PAY WALLETS
CREATE TABLE IF NOT EXISTS kv_pay_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID UNIQUE NOT NULL,
  owner_type VARCHAR(20) NOT NULL DEFAULT 'customer',
  balance DECIMAL(14,2) DEFAULT 0,
  pending_balance DECIMAL(14,2) DEFAULT 0,
  reserved_balance DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'active',
  daily_spend_limit DECIMAL(14,2) DEFAULT 500000,
  daily_withdrawal_limit DECIMAL(14,2) DEFAULT 200000,
  single_transaction_limit DECIMAL(14,2) DEFAULT 200000,
  pin_hash VARCHAR(200),
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_wallets_owner ON kv_pay_wallets(owner_id, owner_type);

-- VIRTUAL ACCOUNTS (for bank transfer top-up)
CREATE TABLE IF NOT EXISTS kv_pay_virtual_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES kv_pay_wallets(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'paystack',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_virtual_accounts_wallet ON kv_pay_virtual_accounts(wallet_id);

-- WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS kv_pay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES kv_pay_wallets(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  balance_before DECIMAL(14,2) NOT NULL,
  balance_after DECIMAL(14,2) NOT NULL,
  reference_type VARCHAR(30),
  reference_id UUID,
  description TEXT,
  gateway VARCHAR(30),
  gateway_reference VARCHAR(200),
  status VARCHAR(20) DEFAULT 'completed',
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  ip_address VARCHAR(50),
  device_fingerprint VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_transactions_wallet_time ON kv_pay_transactions(wallet_id, created_at);
CREATE INDEX idx_kv_pay_transactions_type ON kv_pay_transactions(transaction_type);
CREATE INDEX idx_kv_pay_transactions_ref ON kv_pay_transactions(reference_id);

-- CASHBACK RULES
CREATE TABLE IF NOT EXISTS kv_pay_cashback_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(200) NOT NULL,
  category_id UUID,
  storefront_id UUID,
  cashback_percent DECIMAL(5,2) NOT NULL,
  funded_by VARCHAR(20) DEFAULT 'kauvex',
  vendor_id UUID,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CASHBACK QUEUE
CREATE TABLE IF NOT EXISTS kv_pay_cashback_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES kv_pay_wallets(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  rule_id UUID REFERENCES kv_pay_cashback_rules(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  eligible_from TIMESTAMP,
  credited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_cashback_wallet_status ON kv_pay_cashback_queue(wallet_id, status);
CREATE INDEX idx_kv_pay_cashback_order ON kv_pay_cashback_queue(order_id);

-- BNPL AGREEMENTS
CREATE TABLE IF NOT EXISTS kv_pay_bnpl_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  order_id UUID NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  installment_count INT DEFAULT 4,
  installment_amount DECIMAL(14,2) NOT NULL,
  first_payment_percent DECIMAL(5,2) DEFAULT 25,
  first_payment_amount DECIMAL(14,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  flat_fee DECIMAL(10,2) DEFAULT 0,
  promotional_period_end DATE,
  payment_method_type VARCHAR(20),
  payment_method_id UUID,
  credit_partner VARCHAR(50),
  credit_partner_reference VARCHAR(200),
  credit_score INT,
  status VARCHAR(20) DEFAULT 'active',
  total_paid DECIMAL(14,2) DEFAULT 0,
  total_outstanding DECIMAL(14,2) NOT NULL,
  missed_payment_count INT DEFAULT 0,
  late_fees_accrued DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_bnpl_agreements_customer ON kv_pay_bnpl_agreements(customer_id);
CREATE INDEX idx_kv_pay_bnpl_agreements_order ON kv_pay_bnpl_agreements(order_id);
CREATE INDEX idx_kv_pay_bnpl_agreements_status ON kv_pay_bnpl_agreements(status);

-- BNPL PAYMENTS (installment schedule)
CREATE TABLE IF NOT EXISTS kv_pay_bnpl_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES kv_pay_bnpl_agreements(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  late_fee DECIMAL(10,2) DEFAULT 0,
  total_charged DECIMAL(14,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  payment_method VARCHAR(20),
  gateway_reference VARCHAR(200),
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kv_pay_bnpl_payments_agreement ON kv_pay_bnpl_payments(agreement_id);
CREATE INDEX idx_kv_pay_bnpl_payments_due_status ON kv_pay_bnpl_payments(due_date, status);

-- BNPL ELIGIBILITY
CREATE TABLE IF NOT EXISTS kv_pay_bnpl_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL,
  is_eligible BOOLEAN DEFAULT false,
  current_limit DECIMAL(14,2) DEFAULT 0,
  used_limit DECIMAL(14,2) DEFAULT 0,
  available_limit DECIMAL(14,2) DEFAULT 0,
  eligibility_score INT DEFAULT 0,
  credit_partner_score INT,
  successful_repayments INT DEFAULT 0,
  missed_payments INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'not_evaluated',
  last_evaluated TIMESTAMP,
  suspended_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BNPL CONFIGURATION
CREATE TABLE IF NOT EXISTS kv_pay_bnpl_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FLOAT INCOME TRACKING
CREATE TABLE IF NOT EXISTS kv_pay_float_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_wallet_balance DECIMAL(16,2) DEFAULT 0,
  customer_balance DECIMAL(16,2) DEFAULT 0,
  vendor_balance DECIMAL(16,2) DEFAULT 0,
  partner_balance DECIMAL(16,2) DEFAULT 0,
  estimated_interest DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DEFAULT BNPL CONFIG
-- ============================================================
INSERT INTO kv_pay_bnpl_config (config_key, config_value, description) VALUES
  ('min_order_value', '5000', 'Minimum order value to use BNPL (₦)'),
  ('installment_count', '4', 'Number of installments'),
  ('installment_interval_days', '21', 'Days between installments'),
  ('first_payment_percent', '25', 'First installment percentage'),
  ('promo_0_percent_end_date', (NOW() + INTERVAL '6 months')::TEXT, 'End date for 0% promotional period'),
  ('post_promo_flat_fee', '0', 'Flat fee after promotional period ends'),
  ('post_promo_interest_rate', '0', 'Interest rate (APR) after promo period'),
  ('late_fee_amount', '500', 'Late fee per missed payment (₦)'),
  ('late_fee_grace_days', '7', 'Days before late fee applies'),
  ('max_retry_count', '3', 'Max retry attempts per charge'),
  ('new_customer_limit', '20000', 'BNPL limit for new eligible customers'),
  ('limit_after_2_agreements', '50000', 'Limit after 2 successful repayments'),
  ('limit_after_5_agreements', '100000', 'Limit after 5 successful repayments'),
  ('limit_after_10_agreements', '200000', 'Limit after 10 successful repayments'),
  ('credit_check_threshold', '50000', 'Order value requiring external credit check'),
  ('eligible_categories', '[]', 'Category IDs eligible for BNPL (empty = all)')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- SEED DEFAULT CASHBACK RULES
-- ============================================================
INSERT INTO kv_pay_cashback_rules (rule_name, cashback_percent, funded_by, is_active) VALUES
  ('Standard Customer Cashback', 1.00, 'kauvex', true),
  ('Digital Products Cashback', 0.50, 'kauvex', true),
  ('Premium Category Cashback', 3.00, 'kauvex', true);

-- ============================================================
-- AUTO-CREATE WALLET ON PROFILE CREATION (Trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION kv_pay_create_wallet_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO kv_pay_wallets (owner_id, owner_type, balance, currency)
  VALUES (NEW.id, 'customer', 0, 'NGN');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create wallet for customers (vendors get wallets via their vendor_id)
-- This trigger fires on profile creation
DROP TRIGGER IF EXISTS trg_kv_pay_create_wallet ON profiles;
CREATE TRIGGER trg_kv_pay_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'customer')
  EXECUTE FUNCTION kv_pay_create_wallet_on_profile();

-- ============================================================
-- DAILY FLOAT TRACKING (runs at midnight)
-- ============================================================
CREATE OR REPLACE FUNCTION kv_pay_track_float()
RETURNS void AS $$
BEGIN
  INSERT INTO kv_pay_float_tracking (date, total_wallet_balance, customer_balance, vendor_balance)
  SELECT
    CURRENT_DATE,
    COALESCE(SUM(balance), 0),
    COALESCE(SUM(CASE WHEN owner_type = 'customer' THEN balance ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN owner_type = 'vendor' THEN balance ELSE 0 END), 0)
  FROM kv_pay_wallets
  WHERE status = 'active'
  ON CONFLICT (date) DO UPDATE SET
    total_wallet_balance = EXCLUDED.total_wallet_balance,
    customer_balance = EXCLUDED.customer_balance,
    vendor_balance = EXCLUDED.vendor_balance;
END;
$$ LANGUAGE plpgsql;
