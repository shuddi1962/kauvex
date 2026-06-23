import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase.from("kv_ship_insurance_reserve").select("*");

    if (shipmentId) query = query.eq("shipment_id", shipmentId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    const totalPremiums = data?.reduce((s, r) => s + Number(r.premium_amount || 0), 0) || 0;
    const totalClaims = data?.reduce((s, r) => s + Number(r.claim_amount || 0), 0) || 0;

    return NextResponse.json({ reserves: data, totalPremiums, totalClaims, count: data?.length || 0 });
  } catch (error) {
    console.error("[Insurance API]", error);
    return NextResponse.json({ error: "Failed to fetch insurance reserves" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const premiumRate = 0.015;
    const declaredValue = body.declared_value || 0;
    const premiumAmount = declaredValue * premiumRate;

    const { data, error } = await supabase.from("kv_ship_insurance_reserve").insert({
      shipment_id: body.shipment_id,
      shipment_type: body.shipment_type || "marketplace",
      declared_value: declaredValue,
      premium_amount: premiumAmount,
      premium_rate: premiumRate,
      status: "active",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ reserve: data, premiumAmount }, { status: 201 });
  } catch (error) {
    console.error("[Insurance POST]", error);
    return NextResponse.json({ error: "Failed to create insurance reserve" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Reserve ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("kv_ship_insurance_reserve").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ reserve: data });
  } catch (error) {
    console.error("[Insurance PATCH]", error);
    return NextResponse.json({ error: "Failed to update reserve" }, { status: 500 });
  }
}
