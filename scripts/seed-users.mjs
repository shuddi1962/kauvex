import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stbgamqenraauqpgtbkv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const users = [
  { email: "admin@kauvex.com", password: "Admin@2026!", name: "Super Admin", role: "super-admin" },
  { email: "customer@kauvex.com", password: "Customer@2026!", name: "John Okafor", role: "customer" },
  { email: "vendor@kauvex.com", password: "Vendor@2026!", name: "Lagos Traders", role: "vendor" },
];

for (const user of users) {
  console.log(`\nCreating ${user.role}: ${user.email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name, role: user.role },
  });

  if (error) {
    console.log(`  Error: ${error.message}`);
    continue;
  }

  console.log(`  Created! User ID: ${data?.user?.id}`);

  if (data?.user?.id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        phone: "+234 800 000 0000",
      });
    if (profileError) console.log(`  Profile insert error: ${profileError.message}`);
    else console.log(`  Profile created`);
  }
}

console.log("\n--- Done ---");
