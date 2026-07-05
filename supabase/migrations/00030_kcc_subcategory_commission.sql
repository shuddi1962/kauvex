-- Add commission_rate to subcategories table for subcategory-level commission
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) DEFAULT 12;

COMMENT ON COLUMN subcategories.commission_rate IS 'Subcategory-level commission rate (%). Overrides the parent category rate.';

-- Seed subcategory rates matching parent category defaults
UPDATE subcategories SET commission_rate = 8  WHERE LOWER(name) IN ('phones','computers','laptops','tablets','cameras','headphones','speakers','gadgets');
UPDATE subcategories SET commission_rate = 15 WHERE LOWER(name) IN ('dresses','shirts','pants','shoes','makeup','skincare','perfume','supplements');
UPDATE subcategories SET commission_rate = 20 WHERE LOWER(name) IN ('rings','necklaces','bracelets','earrings','smartwatches','software','ebooks');
UPDATE subcategories SET commission_rate = 5  WHERE LOWER(name) IN ('rice','beverages','snacks','canned goods','cereals');
UPDATE subcategories SET commission_rate = 12 WHERE LOWER(name) IN ('cookware','furniture','bedding','decor','fitness','camping','board games','tires');
