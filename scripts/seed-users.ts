import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: "admin@kauvex.com",
    password: "Admin@123456",
    name: "Super Admin",
    role: "super-admin",
  },
  {
    email: "vendor@kauvex.com",
    password: "Vendor@123456",
    name: "Test Vendor",
    role: "vendor",
  },
  {
    email: "customer@kauvex.com",
    password: "Customer@123456",
    name: "Test Customer",
    role: "customer",
  },
];

async function main() {
  console.log("Creating seed users...\n");

  // First, list all existing auth users
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const authUsers = new Map(
    (existingUsers?.users ?? []).map((u) => [u.email, u])
  );

  for (const u of users) {
    const existing = authUsers.get(u.email);

    if (existing) {
      // Update password just in case
      await admin.auth.admin.updateUserById(existing.id, {
        password: u.password,
        user_metadata: { name: u.name, role: u.role },
      });

      // Upsert profile
      const { error: profileErr } = await admin
        .from("profiles")
        .upsert(
          { id: existing.id, email: u.email, full_name: u.name, role: u.role },
          { onConflict: "id" }
        );

      if (profileErr) {
        // Maybe table has different columns — try without upsert
        console.log(`  ${u.email}: profile upsert error: ${profileErr.message}`);
      } else {
        console.log(`  ${u.email}: profile set (role: ${u.role})`);
      }
      continue;
    }

    // Create new auth user
    const { data: user, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    if (error) {
      console.error(`  ${u.email}: ERROR ${error.message}`);
      continue;
    }

    if (user?.user) {
      await admin
        .from("profiles")
        .upsert(
          {
            id: user.user.id,
            email: u.email,
            full_name: u.name,
            role: u.role,
          },
          { onConflict: "id" }
        );
      console.log(`  ${u.email}: created (role: ${u.role})`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
