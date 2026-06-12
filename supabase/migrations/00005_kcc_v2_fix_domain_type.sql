-- Fix domain_type constraint to include 'tld'
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS storefronts_domain_type_check;
ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_domain_type_check
  CHECK (domain_type IN ('subdomain', 'custom_domain', 'tld'));

-- Update existing storefronts that were incorrectly stored as subdomain for tld types
-- (no automatic migration needed — new storefronts will use correct type going forward)
