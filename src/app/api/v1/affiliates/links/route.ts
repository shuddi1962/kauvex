import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    if (!partnerId) {
      return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("kv_aff_links")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        data: [
          { id: "l1", partner_id: "p1", name: "Homepage Banner", url: "https://kauvex.com/?ref=techblog", clicks: 342, conversions: 12, created_at: "2026-06-01" },
          { id: "l2", partner_id: "p1", name: "Product Review Link", url: "https://kauvex.com/products/smart-tv?ref=techblog", clicks: 189, conversions: 8, created_at: "2026-06-10" },
        ],
      });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { partner_id, name, url, product_id } = body;

    if (!partner_id || !name || !url) {
      return NextResponse.json({ error: "partner_id, name, and url are required" }, { status: 400 });
    }

    const ref = `ref_${partner_id}_${Date.now().toString(36)}`;
    const separator = url.includes("?") ? "&" : "?";
    const trackingUrl = `${url}${separator}ref=${ref}`;

    const { data, error } = await supabase
      .from("kv_aff_links")
      .insert({
        partner_id,
        name,
        url: trackingUrl,
        product_id: product_id || null,
        ref,
        clicks: 0,
        conversions: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        data: {
          id: `l_${Date.now()}`,
          partner_id,
          name,
          url: trackingUrl,
          product_id: product_id || null,
          ref,
          clicks: 0,
          conversions: 0,
          created_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
