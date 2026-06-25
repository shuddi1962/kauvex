import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const registerPartnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1).max(200),
  username: z.string().min(3).max(100).regex(/^[a-z0-9_]+$/, "Username must be lowercase alphanumeric with underscores"),
  partner_type: z.enum(["associate", "influencer", "agency", "b2b_referral"]),
  influencer_tier: z.enum(["nano", "micro", "mid", "macro", "mega", "celebrity"]).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  social_links: z.record(z.string(), z.string()).optional(),
  primary_platform: z.string().optional(),
  primary_audience_country: z.string().optional(),
  content_categories: z.array(z.string()).optional(),
  payout_method: z.enum(["bank_transfer", "mobile_money", "paypal"]).optional(),
  payout_details: z.record(z.string(), z.any()).optional(),
  bank_name: z.string().optional(),
  bank_account_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  mobile_money_provider: z.string().optional(),
  mobile_money_number: z.string().optional(),
  paypal_email: z.string().email().optional(),
  tax_withholding_rate: z.number().min(0).max(100).optional(),
  is_influencer: z.boolean().optional(),
  agree_terms: z.boolean(),
  captcha_token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBody(request, registerPartnerSchema);
  if (valErr) return valErr;

  if (!body!.agree_terms) {
    return errorResponse("You must agree to the terms and conditions", 400);
  }

  try {
    const adminDb = createAdminClient();

    const { data: existingUser } = await adminDb.auth.admin.listUsers();
    const emailTaken = existingUser?.users?.some((u: any) => u.email === body!.email);
    if (emailTaken) {
      return errorResponse("An account with this email already exists", 409);
    }

    const { data: existingUsername } = await adminDb
      .from("kv_aff_partners")
      .select("id")
      .eq("username", body!.username)
      .maybeSingle();
    if (existingUsername) {
      return errorResponse("This username is already taken", 409);
    }

    const { data: authUser, error: createErr } = await adminDb.auth.admin.createUser({
      email: body!.email,
      password: body!.password,
      email_confirm: true,
      user_metadata: {
        role: "affiliate",
        name: body!.display_name,
        partner_type: body!.partner_type,
      },
    });

    if (createErr || !authUser?.user) {
      return errorResponse(createErr?.message || "Failed to create user", 400);
    }

    const userId = authUser.user.id;
    const trackingId = `${body!.username}_${Date.now().toString(36).toUpperCase()}`;

    let payoutDetails: Record<string, any> = {};
    if (body!.payout_method === "bank_transfer") {
      payoutDetails = {
        bank_name: body!.bank_name,
        account_name: body!.bank_account_name,
        account_number: body!.bank_account_number,
      };
    } else if (body!.payout_method === "mobile_money") {
      payoutDetails = {
        provider: body!.mobile_money_provider,
        number: body!.mobile_money_number,
      };
    } else if (body!.payout_method === "paypal") {
      payoutDetails = { email: body!.paypal_email };
    }

    const { data: partner, error: partnerErr } = await adminDb
      .from("kv_aff_partners")
      .insert({
        user_id: userId,
        tracking_id: trackingId,
        partner_type: body!.partner_type,
        influencer_tier: body!.partner_type === "influencer" ? (body!.influencer_tier || "nano") : null,
        display_name: body!.display_name,
        username: body!.username,
        bio: body!.bio || null,
        website_url: body!.website_url || null,
        social_links: body!.social_links || null,
        primary_platform: body!.primary_platform || null,
        primary_audience_country: body!.primary_audience_country || null,
        content_categories: body!.content_categories || null,
        payout_method: body!.payout_method || null,
        payout_details: Object.keys(payoutDetails).length > 0 ? payoutDetails : null,
        tax_withholding_rate: body!.tax_withholding_rate || 0,
        status: "pending",
        minimum_payout: 5000,
        pending_balance: 0,
        confirmed_balance: 0,
        total_paid_out: 0,
      })
      .select("*")
      .single();

    if (partnerErr) {
      await adminDb.auth.admin.deleteUser(userId);
      return errorResponse("Failed to create partner: " + partnerErr.message, 400);
    }

    await adminDb.from("kv_aff_tracking_ids").insert({
      partner_id: partner!.id,
      tracking_id: trackingId,
      label: "Primary",
      platform: body!.primary_platform || null,
      is_primary: true,
      is_active: true,
    });

    if (body!.is_influencer || body!.partner_type === "influencer") {
      const slug = body!.username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      await adminDb.from("kv_aff_storefronts").insert({
        partner_id: partner!.id,
        slug,
        is_published: true,
        follower_count: 0,
        total_views: 0,
        total_clicks: 0,
      });
    }

    await adminDb.from("profiles").insert({
      id: userId,
      email: body!.email,
      full_name: body!.display_name,
      phone: body!.phone || null,
      role: "affiliate",
    });

    return successResponse({
      partner_id: partner!.id,
      tracking_id: trackingId,
      username: body!.username,
      status: "pending",
      message: "Partner account created successfully. We'll review your application shortly.",
    }, 201);

  } catch (err) {
    console.error("Partner registration error:", err);
    return errorResponse("Internal server error", 500);
  }
}
