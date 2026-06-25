import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const DEMO_PARTNERS = [
  {
    email: "associate.demo@kauvex.com",
    password: "KauvexDemo2026!",
    displayName: "Demo Associate",
    username: "demo_associate",
    partnerType: "associate" as const,
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
    partnerType: "influencer" as const,
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
    partnerType: "associate" as const,
    primaryPlatform: "Blog/Website",
    primaryAudienceCountry: "United Kingdom",
    contentCategories: ["Home & Kitchen", "Sports"],
    payoutMethod: "bank_transfer",
  },
];

export async function POST(request: NextRequest) {
  try {
    const results = [];

    for (const p of DEMO_PARTNERS) {
      const { data: existing } = await admin.auth.admin.listUsers();
      if (existing?.users?.some((u: any) => u.email === p.email)) {
        results.push({ email: p.email, status: "already_exists" });
        continue;
      }

      const { data: authUser, error: createErr } = await admin.auth.admin.createUser({
        email: p.email,
        password: p.password,
        email_confirm: true,
        user_metadata: { role: "affiliate", name: p.displayName, partner_type: p.partnerType },
      });

      if (createErr || !authUser?.user) {
        results.push({ email: p.email, status: "error", error: createErr?.message });
        continue;
      }

      const userId = authUser.user.id;
      const trackingId = `${p.username}_${Date.now().toString(36).toUpperCase()}`;

      const { data: partner, error: pErr } = await admin
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

      if (pErr) {
        await admin.auth.admin.deleteUser(userId);
        results.push({ email: p.email, status: "error", error: pErr.message });
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
        { id: userId, email: p.email, full_name: p.displayName, role: "affiliate" },
        { onConflict: "id" },
      );

      results.push({
        email: p.email,
        status: "created",
        userId,
        partnerId: partner.id,
        trackingId,
      });
    }

    return NextResponse.json({
      success: true,
      accounts: DEMO_PARTNERS.map((p) => ({
        type: p.partnerType,
        email: p.email,
        password: p.password,
        loginUrl: "/partners/login",
      })),
      details: results,
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
