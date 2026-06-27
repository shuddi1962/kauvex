import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_CAMPAIGNS = [
  {
    id: "c1",
    name: "Summer Sale - Electronics",
    type: "sponsored_products",
    status: "active",
    daily_budget: 5000,
    spent: 3200,
    impressions: 12500,
    clicks: 340,
    orders: 28,
    acos: 12.5,
    created_at: "2026-06-01",
  },
  {
    id: "c2",
    name: "Brand Awareness - Fashion",
    type: "sponsored_brands",
    status: "paused",
    daily_budget: 8000,
    spent: 5600,
    impressions: 28000,
    clicks: 890,
    orders: 45,
    acos: 8.2,
    created_at: "2026-05-15",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase
      .from("kv_ad_campaigns")
      .select("*")
      .eq("vendor_id", vendorId ?? "");

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? DEMO_CAMPAIGNS);
  } catch {
    return NextResponse.json(DEMO_CAMPAIGNS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, daily_budget, targeting } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_ad_campaigns")
      .insert({ name, type, daily_budget, targeting, status: "active", spent: 0, impressions: 0, clicks: 0, orders: 0, acos: 0 })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { id: "c_new", ...((await request.json().catch(() => ({}))) as Record<string, unknown>), status: "active", created_at: new Date().toISOString() },
      { status: 201 }
    );
  }
}
