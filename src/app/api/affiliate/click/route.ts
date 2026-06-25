import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { insforge } from "@/lib/insforge";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function hashIp(ip: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function fraudCheck(partnerId: string, ip: string, sessionId: string): Promise<{ isFraud: boolean; reason?: string }> {
  const adminDb = createAdminClient();
  const ipHash = hashIp(ip);

  const { data: partner } = await adminDb.from("kv_aff_partners").select("user_id").eq("id", partnerId).single();
  if (!partner) return { isFraud: true, reason: "invalid_partner" };

  const { count: sameIpClicks } = await adminDb
    .from("kv_aff_clicks")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - 3600000).toISOString());

  if ((sameIpClicks ?? 0) > 20) return { isFraud: true, reason: "rate_limit_exceeded" };

  const { count: selfClickCount } = await adminDb
    .from("kv_aff_clicks")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("is_self_click", true);

  if ((selfClickCount ?? 0) > 3) return { isFraud: true, reason: "self_click_abuse" };

  return { isFraud: false };
}

export async function POST(request: NextRequest) {
  try {
    let ref: string | null = null;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      ref = body.ref || request.nextUrl.searchParams.get("ref");
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      ref = (formData.get("ref") as string) || request.nextUrl.searchParams.get("ref");
    } else {
      ref = request.nextUrl.searchParams.get("ref");
    }

    if (!ref) {
      return NextResponse.json({ success: false, error: "Missing tracking reference" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    const { data: trackingId } = await adminDb
      .from("kv_aff_tracking_ids")
      .select("partner_id, tracking_id")
      .eq("tracking_id", ref)
      .eq("is_active", true)
      .maybeSingle();

    if (!trackingId) {
      const { data: partnerByTracking } = await adminDb
        .from("kv_aff_partners")
        .select("id, tracking_id")
        .eq("tracking_id", ref)
        .eq("status", "active")
        .maybeSingle();

      if (!partnerByTracking) {
        return NextResponse.json({ success: false, error: "Invalid tracking reference" }, { status: 404 });
      }

      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
      const sessionId = request.cookies.get("kv_aff_session")?.value || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const ipHash = hashIp(ip);
      const userAgent = request.headers.get("user-agent") || "";
      const userAgentCategory = userAgent.includes("Mobile") ? "mobile" : userAgent.includes("Bot") || userAgent.includes("bot") || userAgent.includes("curl") ? "bot" : "desktop";
      const referrer = request.headers.get("referer") || "";
      const landingUrl = request.url;

      const ipCountry = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "";

      const { isFraud, reason } = await fraudCheck(partnerByTracking.id, ip, sessionId);

      await insforge.database.from("kv_aff_clicks").insert({
        partner_id: partnerByTracking.id,
        tracking_id: ref,
        referrer_url: referrer,
        landing_url: landingUrl,
        ip_hash: ipHash,
        country_code: ipCountry,
        device_type: userAgentCategory,
        user_agent_category: userAgentCategory,
        is_self_click: ref === userAgentCategory || false,
        is_fraudulent: isFraud,
        commission_eligible: !isFraud,
        session_id: sessionId,
      });

      const response = NextResponse.json({
        success: true,
        redirectUrl: request.nextUrl.searchParams.get("redirect") || "/",
        click_id: null,
      });

      response.cookies.set("kv_affiliate_ref", ref, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      response.cookies.set("kv_aff_session", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return response;
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const sessionId = request.cookies.get("kv_aff_session")?.value || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const ipHash = hashIp(ip);
    const userAgent = request.headers.get("user-agent") || "";
    const userAgentCategory = userAgent.includes("Mobile") ? "mobile" : userAgent.includes("Bot") || userAgent.includes("bot") || userAgent.includes("curl") ? "bot" : "desktop";
    const referrer = request.headers.get("referer") || "";
    const landingUrl = request.url;
    const ipCountry = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "";

    const { isFraud, reason } = await fraudCheck(trackingId.partner_id, ip, sessionId);

    await insforge.database.from("kv_aff_clicks").insert({
      partner_id: trackingId.partner_id,
      tracking_id: ref,
      referrer_url: referrer,
      landing_url: landingUrl,
      ip_hash: ipHash,
      country_code: ipCountry,
      device_type: userAgentCategory,
      user_agent_category: userAgentCategory,
      is_self_click: false,
      is_fraudulent: isFraud,
      commission_eligible: !isFraud,
      session_id: sessionId,
    });

    if (isFraud) {
      await insforge.database.from("kv_aff_fraud_log").insert({
        partner_id: trackingId.partner_id,
        fraud_type: reason === "rate_limit_exceeded" ? "rate_limit" : reason === "self_click_abuse" ? "self_click" : "suspicious",
        evidence: { ip_hash: ipHash, session_id: sessionId, reason },
        action_taken: "flagged",
      });
    }

    const response = NextResponse.json({
      success: true,
      redirectUrl: request.nextUrl.searchParams.get("redirect") || "/",
    });

    response.cookies.set("kv_affiliate_ref", ref, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    response.cookies.set("kv_aff_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error("Affiliate click error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
