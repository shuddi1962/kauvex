-- PHASE 37: PRODUCT MEDIA

CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'image',
  url VARCHAR(1000) NOT NULL,
  alt VARCHAR(500),
  width INT,
  height INT,
  size INT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kv_product_media_product ON product_media(product_id);

ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product media" ON product_media
  FOR SELECT USING (true);

CREATE POLICY "Vendors insert own product media" ON product_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND vendor_id = auth.uid()::text)
  );

CREATE POLICY "Vendors update own product media" ON product_media
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND vendor_id = auth.uid()::text)
  );

CREATE POLICY "Vendors delete own product media" ON product_media
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND vendor_id = auth.uid()::text)
  );