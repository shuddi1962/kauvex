import { createClient } from '@supabase/supabase-js';

const url = 'https://stbgamqenraauqpgtbkv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdhbXFlbnJhYXVxcGd0Ymt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAwODczOSwiZXhwIjoyMDk2NTg0NzM5fQ.otAVW7NKu5KoNCWsRgug59DpqsNrDXzjUYL0QzGMKx4';

const sb = createClient(url, key);

const DEMO_PRODUCTS = [
  { name: 'Wireless Bluetooth Headphones', sku_suffix: '001', price: 45000 },
  { name: 'Premium Leather Wallet', sku_suffix: '002', price: 12500 },
  { name: 'Portable Power Bank 20000mAh', sku_suffix: '003', price: 22000 },
  { name: 'Organic Green Tea Set', sku_suffix: '004', price: 8500 },
  { name: 'Stainless Steel Water Bottle', sku_suffix: '005', price: 15000 },
  { name: 'Smart LED Desk Lamp', sku_suffix: '006', price: 18500 },
  { name: 'Ergonomic Mouse Pad', sku_suffix: '007', price: 6500 },
  { name: 'Noise Cancelling Earbuds', sku_suffix: '008', price: 35000 },
  { name: 'Men\'s Classic Watch', sku_suffix: '009', price: 28500 },
  { name: 'Laptop Stand Adjustable', sku_suffix: '010', price: 19500 },
];

// 1. Ensure warehouses
const warehouseDemos = [
  { name: 'KAUVEX Lagos Main Hub', code: 'LOS-001', type: 'standard', address: '42 Warehouse Road, Ikeja', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postal_code: '100001', status: 'active' },
  { name: 'KAUVEX Abuja Hub', code: 'ABV-001', type: 'standard', address: '15 Trade Zone, Central Area', city: 'Abuja', state: 'FCT', country: 'Nigeria', postal_code: '900001', status: 'active' },
  { name: 'KAUVEX Port Harcourt Hub', code: 'PHC-001', type: 'standard', address: '8 Industrial Layout', city: 'Port Harcourt', state: 'Rivers', country: 'Nigeria', postal_code: '500001', status: 'active' },
];

for (const w of warehouseDemos) {
  const { error } = await sb.from('warehouses').upsert(w, { onConflict: 'code' });
  if (error) console.error('Warehouse error:', error.message);
}
console.log('✓ Warehouses seeded');

// 2. Get all vendors
const { data: vendors } = await sb.from('vendors').select('id, shop_name');
if (!vendors || vendors.length === 0) {
  console.log('No vendors found. Skipping product seed.');
  process.exit(0);
}
console.log(`Found ${vendors.length} vendor(s)`);

// 3. For each vendor, create demo products + inventory
for (const vendor of vendors) {
  const { data: existing } = await sb.from('products').select('id').eq('vendor_id', vendor.id).limit(1);
  if (existing && existing.length > 0) {
    console.log(`  ${vendor.shop_name}: already has products, skipping`);
    continue;
  }

  const slug = vendor.id.slice(0, 6);
  let count = 0;

  for (const dp of DEMO_PRODUCTS) {
    const slugVal = `demo-${dp.name.toLowerCase().replace(/\s+/g, '-')}-${slug}`.slice(0, 100);
    const { data: product, error: prodErr } = await sb
      .from('products')
      .insert({
        vendor_id: vendor.id,
        name: dp.name,
        slug: slugVal,
        sku: `DEMO-${slug}-${dp.sku_suffix}`,
        regular_price: dp.price,
        sale_price: Math.round(dp.price * 0.9),
        cost_price: Math.round(dp.price * 0.6),
        status: 'published',
        images: [],
        type: 'simple',
        short_description: `High-quality ${dp.name.toLowerCase()} — perfect for everyday use.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (prodErr) {
      console.error(`  Error creating ${dp.name}: ${prodErr.message}`);
      continue;
    }

    // Sync to product_inventory
    const qty = Math.floor(Math.random() * 80) + 15;
    await sb.from('product_inventory').insert({
      product_id: product.id,
      location_name: 'default',
      quantity: qty,
      low_stock_threshold: 5,
      backorder_enabled: false,
    });

    count++;
  }

  console.log(`  ${vendor.shop_name}: ${count} products + inventory created`);
}

console.log('Done! All vendors have demo products with inventory.');
