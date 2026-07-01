-- ============================================================
-- PHASE 25: Security & External Services
-- Tables: kv_sec_* (7 tables)
-- ============================================================

-- Blocked requests log (WAF/firewall)
CREATE TABLE IF NOT EXISTS kv_sec_blocked_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(50) NOT NULL,
  request_path TEXT NOT NULL,
  block_reason VARCHAR(100) NOT NULL,
  attack_type VARCHAR(50),
  country_code VARCHAR(10),
  user_agent TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_blocked_ip ON kv_sec_blocked_requests (ip_address);
CREATE INDEX IF NOT EXISTS idx_kv_sec_blocked_at ON kv_sec_blocked_requests (blocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_sec_blocked_attack ON kv_sec_blocked_requests (attack_type);

-- Identity verification (KYC)
CREATE TABLE IF NOT EXISTS kv_sec_identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_type VARCHAR(30) NOT NULL,
  -- vendor | logistics_partner | manufacturer | supplier | customer | affiliate
  provider VARCHAR(30) NOT NULL,
  -- smile_identity | onfido | persona
  document_type VARCHAR(50),
  -- passport | national_id | drivers_license | bvn | nin
  document_url TEXT,
  selfie_url TEXT,
  provider_reference VARCHAR(200),
  confidence_score DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | passed | failed | manual_review
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_kyc_user ON kv_sec_identity_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_kv_sec_kyc_status ON kv_sec_identity_verifications (status);
CREATE INDEX IF NOT EXISTS idx_kv_sec_kyc_role ON kv_sec_identity_verifications (role_type);

-- Fraud scores (per order/transaction)
CREATE TABLE IF NOT EXISTS kv_sec_fraud_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  user_id UUID NOT NULL,
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_signals JSONB DEFAULT '[]'::jsonb,
  outcome VARCHAR(20) DEFAULT 'proceeded',
  -- proceeded | flagged | held | declined
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_fraud_order ON kv_sec_fraud_scores (order_id);
CREATE INDEX IF NOT EXISTS idx_kv_sec_fraud_user ON kv_sec_fraud_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_kv_sec_fraud_outcome ON kv_sec_fraud_scores (outcome);
CREATE INDEX IF NOT EXISTS idx_kv_sec_fraud_score ON kv_sec_fraud_scores (risk_score DESC);

-- Blacklist (IPs, emails, card BINs, device fingerprints)
CREATE TABLE IF NOT EXISTS kv_sec_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_type VARCHAR(20) NOT NULL,
  -- ip | email | card_bin | device
  value VARCHAR(200) NOT NULL,
  reason TEXT,
  added_by UUID,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kv_sec_blacklist_unique ON kv_sec_blacklist (list_type, value);
CREATE INDEX IF NOT EXISTS idx_kv_sec_blacklist_type ON kv_sec_blacklist (list_type, is_active);

-- File scan results
CREATE TABLE IF NOT EXISTS kv_sec_file_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  uploaded_by UUID,
  scan_provider VARCHAR(30) NOT NULL,
  -- virustotal | sightengine | cloudflare_images
  scan_result VARCHAR(20) DEFAULT 'pending',
  -- clean | infected | suspicious | pending | error
  scan_details JSONB,
  quarantined BOOLEAN DEFAULT FALSE,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_scan_result ON kv_sec_file_scans (scan_result);
CREATE INDEX IF NOT EXISTS idx_kv_sec_scan_uploaded ON kv_sec_file_scans (uploaded_by);

-- Independent backups (to Cloudflare R2)
CREATE TABLE IF NOT EXISTS kv_sec_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(20) NOT NULL,
  -- daily | weekly | monthly
  storage_location TEXT NOT NULL,
  file_name VARCHAR(255),
  size_mb DECIMAL(14,2),
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | completed | failed | verified
  error_message TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_backup_type ON kv_sec_backups (backup_type);
CREATE INDEX IF NOT EXISTS idx_kv_sec_backup_status ON kv_sec_backups (status);
CREATE INDEX IF NOT EXISTS idx_kv_sec_backup_created ON kv_sec_backups (created_at DESC);

-- Credential audit log
CREATE TABLE IF NOT EXISTS kv_sec_credential_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_name VARCHAR(100) NOT NULL,
  action VARCHAR(30) NOT NULL,
  -- created | rotated | viewed | revoked
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_cred_name ON kv_sec_credential_audit (credential_name);
CREATE INDEX IF NOT EXISTS idx_kv_sec_cred_action ON kv_sec_credential_audit (action);

-- OTP rate limiting
CREATE TABLE IF NOT EXISTS kv_sec_otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(200) NOT NULL,
  -- phone number or email
  channel VARCHAR(10) NOT NULL,
  -- sms | email
  attempt_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sec_otp_identifier ON kv_sec_otp_rate_limits (identifier, channel);
