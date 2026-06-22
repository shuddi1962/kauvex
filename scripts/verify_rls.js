const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stbgamqenraauqpgtbkv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdhbXFlbnJhYXVxcGd0Ymt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDg3MzksImV4cCI6MjA5NjU4NDczOX0._tuvzSR82r7CrzAC4OJ5yZRZFn2sgB2ZAVn2JhLFBt0'
);

async function main() {
  // Test as anon
  const { data: anonData, error: anonErr } = await supabase
    .from('shared_catalog_products')
    .select('id')
    .limit(1);
  console.log('Anon SELECT:', anonErr ? `Error: ${anonErr.message}` : `Success, got ${anonData?.length} rows`);

  // Test authenticated - use a service role client to simulate
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stbgamqenraauqpgtbkv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdhbXFlbnJhYXVxcGd0Ymt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAwODczOSwiZXhwIjoyMDk2NTg0NzM5fQ.otAVW7NKu5KoNCWsRgug59DpqsNrDXzjUYL0QzGMKx4'
  );
  const { data: svcData, error: svcErr } = await serviceClient
    .from('shared_catalog_products')
    .select('id, title')
    .limit(5);
  console.log('Service role SELECT:', svcErr ? `Error: ${svcErr.message}` : `Success, got ${svcData?.length} rows`);
  if (svcData?.length) {
    console.log('Sample:', JSON.stringify(svcData.slice(0, 2)));
  }
}
main().catch(e => console.error(e.message));
