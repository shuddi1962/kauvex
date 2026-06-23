import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const city = searchParams.get("city");

    const supabase = createAdminClient();
    let query = supabase.from("kv_logistics_partners").select("*");

    if (type) query = query.eq("partner_type", type);
    if (status) query = query.eq("status", status);
    if (city) query = query.ilike("base_city", `%${city}%`);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ partners: data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Partners API]", error);
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("kv_logistics_partners").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ partner: data });
  } catch (error) {
    console.error("[Partners PATCH]", error);
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}
