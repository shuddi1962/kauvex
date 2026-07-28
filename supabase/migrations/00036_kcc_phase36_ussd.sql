-- PHASE 36: USSD PAYMENT GATEWAY

CREATE TABLE IF NOT EXISTS kv_ussd_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  ussd_code VARCHAR(20),
  bank VARCHAR(50),
  provider VARCHAR(20) DEFAULT 'paystack',
  status VARCHAR(20) DEFAULT 'pending',
  purpose VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kv_ussd_account ON kv_ussd_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_kv_ussd_reference ON kv_ussd_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_kv_ussd_status ON kv_ussd_transactions(status);

ALTER TABLE kv_ussd_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own USSD" ON kv_ussd_transactions
  FOR SELECT USING (auth.uid()::text = account_id::text);

CREATE POLICY "Admin all USSD" ON kv_ussd_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service insert" ON kv_ussd_transactions
  FOR INSERT WITH CHECK (true);