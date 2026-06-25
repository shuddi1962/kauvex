import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing env: NEXT_PUBLIC_SUPABASE_URL=${!!url}, SUPABASE_SERVICE_ROLE_KEY=${!!key}`);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
    bio: "Tech and lifestyle content creator with a passion for discovering amazing products.",
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
  {
    email: "b2b.demo@kauvex.com",
    password: "KauvexDemo2026!",
    displayName: "Demo B2B Partner",
    username: "demo_b2b",
    partnerType: "b2b_referral" as const,
    primaryPlatform: "Direct Outreach",
    primaryAudienceCountry: "Nigeria",
    contentCategories: ["Technology", "Finance"],
    payoutMethod: "bank_transfer",
    bio: "B2B referral partner specializing in enterprise vendor onboarding.",
    b2bReferrals: [
      { company_name: "TechCorp Nigeria Ltd", contact_name: "James Okafor", contact_email: "james@techcorp.ng", industry: "Technology", deal_size: "large", pipeline_stage: "closed" },
      { company_name: "Marine Logistics Pro", contact_name: "Fatima Usman", contact_email: "fatima@marinelogistics.com", industry: "Logistics", deal_size: "medium", pipeline_stage: "closed" },
      { company_name: "Greenfield Agro Ltd", contact_name: "Chidi Eze", contact_email: "chidi@greenfieldagro.com", industry: "Agriculture", deal_size: "medium", pipeline_stage: "meeting" },
      { company_name: "Pinnacle Health Corp", contact_name: "Sarah Adeyemi", contact_email: "sarah@pinnaclehealth.com", industry: "Healthcare", deal_size: "small", pipeline_stage: "proposal" },
      { company_name: "Bluewave Energy Plc", contact_name: "Michael Dakuku", contact_email: "michael@bluewaveenergy.com", industry: "Energy", deal_size: "enterprise", pipeline_stage: "lead" },
    ],
  },
];

export async function POST(request: NextRequest) {
  const results: any[] = [];

  try {
    const admin = getAdmin();

    const { data: healthCheck, error: healthErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (healthErr) {
      return NextResponse.json({
        success: false,
        error: "Cannot connect to Supabase Auth",
        details: healthErr.message,
        hint: "Check that SUPABASE_SERVICE_ROLE_KEY is set correctly in Vercel environment variables.",
      }, { status: 500 });
    }

    for (const p of DEMO_PARTNERS) {
      const { data: existingUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const alreadyExists = existingUsers?.users?.some((u: any) => u.email === p.email);

      if (alreadyExists) {
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
        results.push({ email: p.email, status: "error", step: "createUser", error: createErr?.message });
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
          cookie_window_days: p.partnerType === "b2b_referral" ? 90 : 30,
          commission_tier: "standard",
          tax_withholding_rate: 0,
        })
        .select("id")
        .single();

      if (pErr) {
        await admin.auth.admin.deleteUser(userId);
        results.push({ email: p.email, status: "error", step: "insertPartner", error: pErr.message });
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

      if (p.partnerType === "b2b_referral" && "b2bReferrals" in p && p.b2bReferrals) {
        for (const ref of p.b2bReferrals) {
          await admin.from("kv_aff_b2b_clients").insert({
            partner_id: partner.id,
            client_type: "vendor",
            company_name: ref.company_name,
            contact_name: ref.contact_name,
            contact_email: ref.contact_email,
            industry: ref.industry,
            deal_size: ref.deal_size,
            pipeline_stage: ref.pipeline_stage,
            referral_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            first_payment_date: ref.pipeline_stage === "closed" ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null,
            recurring_commission_rate: 5,
            recurring_commission_months: 12,
            recurring_paid_months: ref.pipeline_stage === "closed" ? Math.floor(Math.random() * 3) : 0,
            total_earned: ref.pipeline_stage === "closed" ? Math.floor(Math.random() * 5000) + 500 : 0,
            status: "active",
          });
        }
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
        partnerType: p.partnerType,
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
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Internal server error",
      details: results,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const admin = getAdmin();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return NextResponse.json({ connected: false, error: error.message });
    }
    const demoEmails = DEMO_PARTNERS.map((p) => p.email);
    const existing = data?.users?.filter((u: any) => demoEmails.includes(u.email)).map((u: any) => u.email) || [];
    return NextResponse.json({
      connected: true,
      totalUsers: data?.users?.length || 0,
      demoAccountsExisting: existing,
      demoAccountsMissing: demoEmails.filter((e) => !existing.includes(e)),
    });
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message });
  }
}
