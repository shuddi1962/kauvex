import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const DEMO_ACCOUNTS: Record<string, {
  password: string;
  displayName: string;
  username: string;
  partnerType: string;
  influencerTier?: string;
  bio?: string;
  primaryPlatform?: string;
  primaryAudienceCountry?: string;
  contentCategories?: string[];
  payoutMethod?: string;
}> = {
  "associate.demo@kauvex.com": {
    password: "KauvexDemo2026!",
    displayName: "Demo Associate",
    username: "demo_associate",
    partnerType: "associate",
    primaryPlatform: "Blog/Website",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Electronics", "Fashion"],
    payoutMethod: "bank_transfer",
  },
  "influencer.demo@kauvex.com": {
    password: "KauvexDemo2026!",
    displayName: "Demo Influencer",
    username: "demo_influencer",
    partnerType: "influencer",
    influencerTier: "micro",
    bio: "Tech and lifestyle content creator with a passion for discovering amazing products.",
    primaryPlatform: "Instagram",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Electronics", "Fashion", "Beauty"],
    payoutMethod: "paypal",
  },
  "agency.demo@kauvex.com": {
    password: "KauvexDemo2026!",
    displayName: "Demo Agency",
    username: "demo_agency",
    partnerType: "associate",
    primaryPlatform: "Blog/Website",
    primaryAudienceCountry: "United Kingdom",
    contentCategories: ["Home & Kitchen", "Sports"],
    payoutMethod: "bank_transfer",
  },
  "b2b.demo@kauvex.com": {
    password: "KauvexDemo2026!",
    displayName: "Demo B2B Partner",
    username: "demo_b2b",
    partnerType: "b2b_referral",
    primaryPlatform: "Direct Outreach",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Technology", "Finance"],
    payoutMethod: "bank_transfer",
    bio: "B2B referral partner specializing in enterprise vendor onboarding.",
  },
};

async function seedDemoAccount(email: string): Promise<boolean> {
  const demo = DEMO_ACCOUNTS[email];
  if (!demo) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[Partner Login] Missing SUPABASE_SERVICE_ROLE_KEY, cannot auto-seed");
    return false;
  }

  console.log(`[Partner Login] Auto-seeding demo account: ${email}`);

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authUser, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: demo.password,
    email_confirm: true,
    user_metadata: {
      role: "affiliate",
      name: demo.displayName,
      partner_type: demo.partnerType,
    },
  });

  if (createErr || !authUser?.user) {
    console.error(`[Partner Login] Failed to create auth user ${email}:`, createErr?.message);
    return false;
  }

  const userId = authUser.user.id;
  const trackingId = `${demo.username}_${Date.now().toString(36).toUpperCase()}`;

  const { data: partner, error: pErr } = await admin
    .from("kv_aff_partners")
    .insert({
      user_id: userId,
      tracking_id: trackingId,
      partner_type: demo.partnerType,
      influencer_tier: demo.partnerType === "influencer" ? (demo.influencerTier || "nano") : null,
      display_name: demo.displayName,
      username: demo.username,
      bio: demo.bio || null,
      primary_platform: demo.primaryPlatform || null,
      primary_audience_country: demo.primaryAudienceCountry || null,
      content_categories: demo.contentCategories || null,
      payout_method: demo.payoutMethod || null,
      status: "active",
      minimum_payout: 5000,
      pending_balance: 0,
      confirmed_balance: 0,
      total_paid_out: 0,
      cookie_window_days: demo.partnerType === "b2b_referral" ? 90 : 30,
      commission_tier: "standard",
      tax_withholding_rate: 0,
    })
    .select("id")
    .single();

  if (pErr) {
    console.error(`[Partner Login] Failed to create partner record for ${email}:`, pErr.message);
    await admin.auth.admin.deleteUser(userId);
    return false;
  }

  await admin.from("kv_aff_tracking_ids").insert({
    partner_id: partner.id,
    tracking_id: trackingId,
    label: "Primary",
    platform: demo.primaryPlatform || null,
    is_primary: true,
    is_active: true,
  });

  if (demo.partnerType === "influencer") {
    await admin.from("kv_aff_storefronts").insert({
      partner_id: partner.id,
      slug: demo.username.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      is_published: true,
      follower_count: 0,
      total_views: 0,
      total_clicks: 0,
    });
  }

  await admin.from("profiles").upsert(
    { id: userId, email, full_name: demo.displayName, role: "affiliate" },
    { onConflict: "id" },
  );

  console.log(`[Partner Login] Seeded: ${email} | userId=${userId} | partnerId=${partner.id}`);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let cookiesToSet: { name: string; value: string; options?: any }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookiesToSet = cookies;
          },
        },
      },
    );

    let { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && DEMO_ACCOUNTS[email] && password === DEMO_ACCOUNTS[email].password) {
      const seeded = await seedDemoAccount(email);
      if (seeded) {
        const retrySupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookies) {
                cookiesToSet = cookies;
              },
            },
          },
        );
        const retry = await retrySupabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const body = {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.name,
        role: user?.user_metadata?.role,
        partnerType: user?.user_metadata?.partner_type,
      },
    };

    const response = NextResponse.json(body, { status: 200 });

    for (const cookie of cookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  } catch (err) {
    console.error("Partner login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
