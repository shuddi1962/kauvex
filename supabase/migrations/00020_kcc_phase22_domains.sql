-- Phase 22: Domain Provisioning System

CREATE TABLE IF NOT EXISTS kv_dom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  whitelabel_client_id UUID,
  domain VARCHAR(200) UNIQUE NOT NULL,
  subdomain VARCHAR(100),
  domain_type VARCHAR(30) NOT NULL DEFAULT 'vendor_subdomain',
  status VARCHAR(20) DEFAULT 'pending',
  ssl_status VARCHAR(20) DEFAULT 'pending',
  vercel_domain_id VARCHAR(200),
  cf_record_id VARCHAR(200),
  dns_instructions JSONB,
  dns_verified BOOLEAN DEFAULT false,
  dns_reminder_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  provisioned_at TIMESTAMP,
  activated_at TIMESTAMP,
  suspended_at TIMESTAMP,
  removed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kv_dom_subdomain_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain VARCHAR(100) NOT NULL,
  checked_by_vendor_id UUID,
  is_available BOOLEAN,
  reason VARCHAR(50),
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kv_dom_ssl_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES kv_dom_domains(id),
  ssl_status VARCHAR(20),
  vercel_response JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kv_dom_dns_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES kv_dom_domains(id),
  event_type VARCHAR(30) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dom_domains_vendor ON kv_dom_domains(vendor_id);
CREATE INDEX IF NOT EXISTS idx_dom_domains_domain ON kv_dom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_dom_domains_status ON kv_dom_domains(status);
CREATE INDEX IF NOT EXISTS idx_dom_domains_type ON kv_dom_domains(domain_type);
CREATE INDEX IF NOT EXISTS idx_dom_subdomain_checks_subdomain ON kv_dom_subdomain_checks(subdomain);
CREATE INDEX IF NOT EXISTS idx_dom_ssl_checks_domain ON kv_dom_ssl_checks(domain_id);
CREATE INDEX IF NOT EXISTS idx_dom_dns_events_domain ON kv_dom_dns_events(domain_id);

-- Seed: core kauvex.com domains
INSERT INTO kv_dom_domains (domain, subdomain, domain_type, status, ssl_status) VALUES
('kauvex.com', NULL, 'core', 'active', 'issued'),
('www.kauvex.com', 'www', 'core', 'active', 'issued'),
('admin.kauvex.com', 'admin', 'core', 'active', 'issued'),
('seller.kauvex.com', 'seller', 'core', 'active', 'issued'),
('partners.kauvex.com', 'partners', 'core', 'active', 'issued'),
('logistics.kauvex.com', 'logistics', 'core', 'active', 'issued'),
('warehouse.kauvex.com', 'warehouse', 'core', 'active', 'issued'),
('express.kauvex.com', 'express', 'core', 'active', 'issued'),
('supplier.kauvex.com', 'supplier', 'core', 'active', 'issued'),
('api.kauvex.com', 'api', 'core', 'active', 'issued'),
('*.kauvex.com', '*', 'core', 'active', 'issued')
ON CONFLICT (domain) DO NOTHING;

-- Kauvex country TLD domains
INSERT INTO kv_dom_domains (domain, domain_type, status, ssl_status) VALUES
('kauvex.co.uk', 'kauvex_country', 'pending', 'pending'),
('kauvex.ca', 'kauvex_country', 'pending', 'pending'),
('kauvex.com.au', 'kauvex_country', 'pending', 'pending'),
('kauvex.ng', 'kauvex_country', 'pending', 'pending'),
('kauvex.in', 'kauvex_country', 'pending', 'pending'),
('kauvex.ae', 'kauvex_country', 'pending', 'pending'),
('kauvex.de', 'kauvex_country', 'pending', 'pending'),
('kauvex.fr', 'kauvex_country', 'pending', 'pending'),
('kauvex.com.gh', 'kauvex_country', 'pending', 'pending'),
('kauvex.co.ke', 'kauvex_country', 'pending', 'pending'),
('kauvex.co.za', 'kauvex_country', 'pending', 'pending'),
('kauvex.sa', 'kauvex_country', 'pending', 'pending'),
('kauvex.com.br', 'kauvex_country', 'pending', 'pending'),
('kauvex.jp', 'kauvex_country', 'pending', 'pending')
ON CONFLICT (domain) DO NOTHING;
