-- Change shared_product_id from UUID to TEXT in vendor_offers and buy_box_winners
-- to support non-UUID demo product IDs

ALTER TABLE public.vendor_offers
  DROP CONSTRAINT IF EXISTS vendor_offers_shared_product_id_fkey,
  ALTER COLUMN shared_product_id TYPE TEXT;

ALTER TABLE public.buy_box_winners
  DROP CONSTRAINT IF EXISTS buy_box_winners_shared_product_id_fkey,
  ALTER COLUMN shared_product_id TYPE TEXT;

ALTER TABLE public.request_vendor_offers
  ALTER COLUMN shared_product_id TYPE TEXT;
