import { createClient } from '@supabase/supabase-js';

const url = 'https://stbgamqenraauqpgtbkv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdhbXFlbnJhYXVxcGd0Ymt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAwODczOSwiZXhwIjoyMDk2NTg0NzM5fQ.otAVW7NKu5KoNCWsRgug59DpqsNrDXzjUYL0QzGMKx4';

const sb = createClient(url, key);

const demos = [
  { name: 'KAUVEX Lagos Main Hub', code: 'LOS-001', type: 'standard', address: '42 Warehouse Road, Ikeja', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postal_code: '100001', status: 'active' },
  { name: 'KAUVEX Abuja Hub', code: 'ABV-001', type: 'standard', address: '15 Trade Zone, Central Area', city: 'Abuja', state: 'FCT', country: 'Nigeria', postal_code: '900001', status: 'active' },
  { name: 'KAUVEX Port Harcourt Hub', code: 'PHC-001', type: 'standard', address: '8 Industrial Layout', city: 'Port Harcourt', state: 'Rivers', country: 'Nigeria', postal_code: '500001', status: 'active' },
];

for (const w of demos) {
  const { data, error } = await sb.from('warehouses').upsert(w, { onConflict: 'code' }).select('id, name');
  if (error) console.error('Error:', error.message);
  else console.log('Created:', data?.[0]?.name);
}

console.log('Done!');
