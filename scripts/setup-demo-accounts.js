#!/usr/bin/env node
/**
 * Standalone demo accounts setup script.
 * Run: node scripts/setup-demo-accounts.js
 *
 * Creates demo accounts in Supabase Auth + database records via Supabase client.
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv/config");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Admin client with service role
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client for DB operations (RLS-aware)
const anon = createClient(supabaseUrl, anonKey || serviceKey);

const DEMO_ACCOUNTS = [
  {
    email: "manufacturer@kauvex.com",
    password: "Manufacturer1!",
    name: "Chen Wei",
    role: "vendor",
    manufacturer: {
      company_name: "Shenzhen Precision Electronics Co.",
      slug: "shenzhen-precision-electronics",
      country_code: "CN",
      city: "Shenzhen",
      business_type: "manufacturer",
      year_established: 2012,
      employee_count_range: "201-500",
      verification_tier: "factory_verified",
      status: "active",
      trust_score: 85,
      response_rate: 98,
      avg_response_time_hours: 6,
      total_orders_completed: 47,
      rating_average: 4.8,
    },
    categories: [
      { category: "Electronics & Hardware", is_primary: true, product_types: ["USB cables", "power adapters", "wireless chargers", "IoT devices"] },
      { category: "Custom/Promotional Products", is_primary: false, product_types: ["branded tech accessories"] },
    ],
    capability: {
      monthly_capacity: 500000,
      default_moq: 500,
      default_lead_time_days: 21,
      allows_oem: true,
      allows_odm: true,
      allows_private_label: true,
    },
    certifications: ["ISO 9001", "CE Marking", "RoHS"],
  },
  {
    email: "wholesale@kauvex.com",
    password: "Wholesale1!",
    name: "James Mitchell",
    role: "customer",
  },
];

async function main() {
  console.log("=== Kauvex Demo Accounts Setup ===\n");

  for (const account of DEMO_ACCOUNTS) {
    console.log(`Setting up: ${account.email} (${account.role})`);

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name, role: account.role },
    });

    let userId;

    if (authError) {
      if (authError.message?.includes("already")) {
        console.log(`  -> Auth user already exists, fetching...`);
        const { data: users } = await admin.auth.admin.listUsers();
        const existing = users?.users?.find((u) => u.email === account.email);
        if (existing) {
          userId = existing.id;
          console.log(`  -> Found user: ${userId}`);
        } else {
          console.error(`  -> Could not find existing user`);
          continue;
        }
      } else {
        console.error(`  -> Auth error: ${authError.message}`);
        continue;
      }
    } else {
      userId = authData.user.id;
      console.log(`  -> Auth user created: ${userId}`);
    }

    // 2. Upsert profile using service role (bypasses RLS)
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert({ id: userId, email: account.email, full_name: account.name, role: account.role }, { onConflict: "id" });

    if (profileErr) {
      console.error(`  -> Profile error: ${profileErr.message}`);
    } else {
      console.log(`  -> Profile upserted`);
    }

    // 3. Create manufacturer record if applicable
    if (account.manufacturer) {
      // Check if manufacturer already exists
      const { data: existing } = await admin
        .from("kv_mfg_manufacturers")
        .select("id")
        .eq("slug", account.manufacturer.slug)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`  -> Manufacturer already exists: ${account.manufacturer.slug}`);
        continue;
      }

      // Create manufacturer
      const { data: mfg, error: mfgErr } = await admin
        .from("kv_mfg_manufacturers")
        .insert({
          user_id: userId,
          ...account.manufacturer,
        })
        .select("id")
        .single();

      if (mfgErr) {
        console.error(`  -> Manufacturer error: ${mfgErr.message}`);
        continue;
      }

      const mfgId = mfg.id;
      console.log(`  -> Manufacturer created: ${mfgId}`);

      // Create categories
      const { error: catErr } = await admin.from("kv_mfg_categories").insert(
        account.categories.map((c) => ({
          manufacturer_id: mfgId,
          category: c.category,
          is_primary: c.is_primary,
          product_types: c.product_types,
        }))
      );
      if (catErr) console.error(`  -> Categories error: ${catErr.message}`);
      else console.log(`  -> ${account.categories.length} categories created`);

      // Create capability
      const { error: capErr } = await admin.from("kv_mfg_capability").insert({
        manufacturer_id: mfgId,
        ...account.capability,
      });
      if (capErr) console.error(`  -> Capability error: ${capErr.message}`);
      else console.log(`  -> Capability created`);

      // Create certifications
      const { error: certErr } = await admin.from("kv_mfg_certifications").insert(
        account.certifications.map((c) => ({
          manufacturer_id: mfgId,
          certification_type: c,
          status: "approved",
        }))
      );
      if (certErr) console.error(`  -> Certifications error: ${certErr.message}`);
      else console.log(`  -> ${account.certifications.length} certifications created`);
    }
  }

  console.log("\n=== Setup Complete ===");
  console.log("\nDemo Credentials:");
  console.log("═══════════════════════════════════════════");
  console.log("MANUFACTURER PORTAL:");
  console.log("  URL:      http://localhost:3000/manufacturers/login");
  console.log("  Email:    manufacturer@kauvex.com");
  console.log("  Password: Manufacturer1!");
  console.log("");
  console.log("WHOLESALE PORTAL:");
  console.log("  URL:      http://localhost:3000/wholesale/login");
  console.log("  Email:    wholesale@kauvex.com");
  console.log("  Password: Wholesale1!");
  console.log("═══════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
