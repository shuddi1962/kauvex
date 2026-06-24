const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://stbgamqenraauqpgtbkv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdhbXFlbnJhYXVxcGd0Ymt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAwODczOSwiZXhwIjoyMDk2NTg0NzM5fQ.otAVW7NKu5KoNCWsRgug59DpqsNrDXzjUYL0QzGMKx4',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const plans = [
    {
      name: 'Free', slug: 'free', description: 'Start selling on Kauvex',
      monthly_price: 0, annual_price: 0, currency: 'USD',
      commission_rate: 12, max_products: 10, max_storefronts: 1, max_staff: 1,
      allows_subdomain: false, allows_custom_domain: false, allows_fbk: false,
      allows_ads: false, allows_api: false, allows_white_label: false, allows_b2b: false,
      analytics_level: 'basic', support_level: 'standard',
      features: JSON.stringify(['10 products', '1 storefront', '1 staff account', 'Basic analytics', '12% commission']),
      is_active: true, sort_order: 1,
    },
    {
      name: 'Premium', slug: 'premium', description: 'Grow your business faster',
      monthly_price: 29, annual_price: 290, currency: 'USD',
      commission_rate: 8, max_products: null, max_storefronts: 3, max_staff: 5,
      allows_subdomain: true, allows_custom_domain: true, allows_fbk: true,
      allows_ads: true, allows_api: true, allows_white_label: false, allows_b2b: true,
      analytics_level: 'advanced', support_level: 'priority',
      features: JSON.stringify(['Unlimited products', '3 storefronts', '5 staff accounts', 'Advanced analytics', '8% commission', 'FBK eligible', 'Advertising', 'API access', 'B2B', 'Priority support']),
      is_active: true, sort_order: 2,
    },
    {
      name: 'Enterprise', slug: 'enterprise', description: 'For high-volume sellers',
      monthly_price: 99, annual_price: 990, currency: 'USD',
      commission_rate: 5, max_products: null, max_storefronts: null, max_staff: null,
      allows_subdomain: true, allows_custom_domain: true, allows_fbk: true,
      allows_ads: true, allows_api: true, allows_white_label: true, allows_b2b: true,
      analytics_level: 'realtime', support_level: 'dedicated',
      features: JSON.stringify(['Unlimited products', 'Unlimited storefronts', 'Unlimited staff', 'Real-time analytics', '5% commission', 'FBK eligible', 'Advertising', 'API access', 'B2B', 'White label', 'Custom domain', 'Custom CSS/scripts', 'Dedicated support']),
      is_active: true, sort_order: 3,
    },
  ];

  for (const plan of plans) {
    const { data: existing } = await supabase.from('vendor_plans').select('id').eq('slug', plan.slug).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('vendor_plans').update(plan).eq('slug', plan.slug);
      console.log(error ? `✗ ${plan.name}: ${error.message}` : `✓ ${plan.name} updated`);
    } else {
      const { error } = await supabase.from('vendor_plans').insert(plan);
      console.log(error ? `✗ ${plan.name}: ${error.message}` : `✓ ${plan.name} created`);
    }
  }
}
main().catch(console.error);
