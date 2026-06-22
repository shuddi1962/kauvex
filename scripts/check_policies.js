require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();

  const p = await c.query("SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE tablename = 'shared_catalog_products'");
  console.log('Current policies:', JSON.stringify(p.rows));

  // Check column type
  const col = await c.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'shared_catalog_products' AND column_name = 'id'");
  console.log('shared_catalog_products.id type:', col.rows[0]?.data_type);

  const col2 = await c.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'vendor_offers' AND column_name = 'shared_product_id'");
  console.log('vendor_offers.shared_product_id type:', col2.rows[0]?.data_type);

  await c.end();
}
main().catch(e => console.error(e.message));
