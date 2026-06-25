import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface DemoPartner {
  email: string;
  password: string;
  displayName: string;
  username: string;
  partnerType: "associate" | "influencer";
  influencerTier?: string;
  bio?: string;
  primaryPlatform?: string;
  primaryAudienceCountry?: string;
  contentCategories?: string[];
  payoutMethod?: string;
}

const demoPartners: DemoPartner[] = [
  {
    email: "associate.demo@kauvex.com",
    password: "KauvexDemo2026!",
    displayName: "Demo Associate",
    username: "demo_associate",
    partnerType: "associate",
    primaryPlatform: "Blog/Website",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Electronics", "Fashion"],
    payoutMethod: "bank_transfer",
  },
  {
    email: "influencer.demo@kauvex.com",
    password: "KauvexDemo2026!",
    displayName: "Demo Influencer",
    username: "demo_influencer",
    partnerType: "influencer",
    influencerTier: "micro",
    bio: "Tech and lifestyle content creator with a passion for discovering amazing products. Sharing honest reviews and deals with my audience across Africa and beyond.",
    primaryPlatform: "Instagram",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Electronics", "Fashion", "Beauty"],
    payoutMethod: "paypal",
  },
  {
    email: "agency.demo@kauvex.com",
    password: "KauvexDemo2026!",
    displayName: "Demo Agency",
    username: "demo_agency",
    partnerType: "associate",
    primaryPlatform: "Blog/Website",
    primaryAudienceCountry: "United Kingdom",
    contentCategories: ["Home & Kitchen", "Sports"],
    payoutMethod: "bank_transfer",
  },
];

async function seed() {
  console.log("[Seed] Creating demo partner accounts...\n");

  for (const p of demoPartners) {
    console.log(`--- Creating: ${p.displayName} (${p.email}) ---`);

    const { data: existing } = await admin.auth.admin.listUsers();
    const alreadyExists = existing?.users?.some((u: any) => u.email === p.email);
    if (alreadyExists) {
      console.log(`  Skipping — user ${p.email} already exists.\n`);
      continue;
    }

    const { data: authUser, error: createErr } = await admin.auth.admin.createUser({
      email: p.email,
      password: p.password,
      email_confirm: true,
      user_metadata: {
        role: "affiliate",
        name: p.displayName,
        partner_type: p.partnerType,
      },
    });

    if (createErr || !authUser?.user) {
      console.error(`  Failed to create auth user: ${createErr?.message}`);
      continue;
    }

    const userId = authUser.user.id;
    const trackingId = `${p.username}_${Date.now().toString(36).toUpperCase()}`;

    const { data: partner, error: partnerErr } = await admin
      .from("kv_aff_partners")
      .insert({
        user_id: userId,
        tracking_id: trackingId,
        partner_type: p.partnerType,
        influencer_tier: p.partnerType === "influencer" ? (p.influencerTier || "nano") : null,
        display_name: p.displayName,
        username: p.username,
        bio: p.bio || null,
        primary_platform: p.primaryPlatform || null,
        primary_audience_country: p.primaryAudienceCountry || null,
        content_categories: p.contentCategories || null,
        payout_method: p.payoutMethod || null,
        status: "active",
        minimum_payout: 5000,
        pending_balance: 0,
        confirmed_balance: 0,
        total_paid_out: 0,
        cookie_window_days: 30,
        commission_tier: "standard",
        tax_withholding_rate: 0,
      })
      .select("id")
      .single();

    if (partnerErr) {
      console.error(`  Failed to create partner record: ${partnerErr.message}`);
      await admin.auth.admin.deleteUser(userId);
      continue;
    }

    await admin.from("kv_aff_tracking_ids").insert({
      partner_id: partner.id,
      tracking_id: trackingId,
      label: "Primary",
      platform: p.primaryPlatform || null,
      is_primary: true,
      is_active: true,
    });

    if (p.partnerType === "influencer") {
      await admin.from("kv_aff_storefronts").insert({
        partner_id: partner.id,
        slug: p.username.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        is_published: true,
        follower_count: 0,
        total_views: 0,
        total_clicks: 0,
      });
    }

    await admin.from("profiles").upsert(
      {
        id: userId,
        email: p.email,
        full_name: p.displayName,
        role: "affiliate",
      },
      { onConflict: "id" },
    );

    console.log(`  Auth user:  ${userId}`);
    console.log(`  Partner ID: ${partner.id}`);
    console.log(`  Tracking:   ${trackingId}`);
    console.log(`  Status:     active`);
    console.log(`  Login:      ${p.email} / ${p.password}\n`);
  }

  console.log("[Seed] Done. Demo accounts created with status: active.");
  console.log("\n--- LOGIN CREDENTIALS ---\n");
  for (const p of demoPartners) {
    console.log(`  ${p.partnerType.toUpperCase().padEnd(12)} | ${p.email.padEnd(30)} | ${p.password}`);
  }
  console.log("");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
