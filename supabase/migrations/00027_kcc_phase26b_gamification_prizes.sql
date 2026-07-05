-- KCC Phase 26b: Add productId and productName to spin_wheel_prizes
ALTER TABLE public.spin_wheel_prizes ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.spin_wheel_prizes ADD COLUMN IF NOT EXISTS product_name TEXT;
