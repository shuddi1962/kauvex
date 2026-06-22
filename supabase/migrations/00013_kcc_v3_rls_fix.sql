-- Enable RLS and add SELECT policy for shared_catalog_products
-- so that authenticated users and anon users can read catalog entries

ALTER TABLE public.shared_catalog_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "authenticated_read_shared_catalog" ON public.shared_catalog_products;
DROP POLICY IF EXISTS "anon_read_shared_catalog" ON public.shared_catalog_products;
DROP POLICY IF EXISTS "service_role_all_shared_catalog" ON public.shared_catalog_products;

-- Allow authenticated users (vendors) to read catalog products
CREATE POLICY "authenticated_read_shared_catalog" ON public.shared_catalog_products
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to read catalog products (needed for offer page)
CREATE POLICY "anon_read_shared_catalog" ON public.shared_catalog_products
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role full access (already implied by bypassing RLS, but explicit for clarity)
CREATE POLICY "service_role_all_shared_catalog" ON public.shared_catalog_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
