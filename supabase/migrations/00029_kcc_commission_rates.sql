-- Add commission_rate to categories table for category-based marketplace commission
ALTER TABLE categories ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) DEFAULT 12;

COMMENT ON COLUMN categories.commission_rate IS 'Category-based commission rate (%). Falls back to vendor-level commission and then default platform rate.';

-- Seed default commission rates matching Amazon-style category rates
UPDATE categories SET commission_rate = 8  WHERE LOWER(name) IN ('electronics','computers','phones','accessories','cameras');
UPDATE categories SET commission_rate = 15 WHERE LOWER(name) IN ('fashion','clothing','shoes','beauty','health','personal care');
UPDATE categories SET commission_rate = 20 WHERE LOWER(name) IN ('jewelry','watches','digital products','digital','software');
UPDATE categories SET commission_rate = 5  WHERE LOWER(name) IN ('groceries','food','books','media');
UPDATE categories SET commission_rate = 12 WHERE LOWER(name) IN ('home','kitchen','sports','outdoors','toys','games','automotive','general','tools');
UPDATE categories SET commission_rate = 15 WHERE LOWER(name) IN ('furniture','appliances','pet supplies','baby');
