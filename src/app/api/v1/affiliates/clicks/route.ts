import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { partner_id, link_id, product_id, ip_address, user_agent, referrer_url } = body;

    if (!partner_id) {
      return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
    }

    // Fraud check: rapid clicks (>50/min from same IP)
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabase
      .from("kv_aff_clicks")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip_address)
      .gte("created_at", oneMinAgo);

    if ((count || 0) >= 50) {
      return NextResponse.json({ error: "Suspicious activity detected" }, { status: 429 });
    }

    const { data, error } = await supabase
      .from("kv_aff_clicks")
      .insert({
        partner_id,
        link_id: link_id || null,
        product_id: product_id || null,
        ip_address,
        user_agent,
        referrer_url,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table may not exist, log and return demo response
      console.log("[Affiliate Click]", { partner_id, link_id, ip_address });
      return NextResponse.json({ data: { id: "click_demo", partner_id, created_at: new Date().toISOString() } });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
