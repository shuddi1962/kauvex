import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");

    const supabase = createAdminClient();
    let query = supabase.from("kv_logistics_jobs").select("*");

    if (partnerId) query = query.eq("assigned_partner_id", partnerId);
    if (status) query = query.eq("status", status);
    if (tier) query = query.eq("tier", tier);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) throw error;

    return NextResponse.json({ jobs: data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Jobs API]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase.from("kv_logistics_jobs").insert({
      pickup_location: body.pickup_location,
      dropoff_location: body.dropoff_location,
      pickup_lat: body.pickup_lat,
      pickup_lng: body.pickup_lng,
      dropoff_lat: body.dropoff_lat,
      dropoff_lng: body.dropoff_lng,
      weight_kg: body.weight_kg,
      tier: body.tier || "tier_1",
      status: "pending",
      delivery_pin: String(Math.floor(100000 + Math.random() * 900000)),
      job_number: `JOB-${Date.now().toString(36).toUpperCase()}`,
      pickup_code: `PK-${Math.floor(100 + Math.random() * 900)}`,
      expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    console.error("[Jobs POST]", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("kv_logistics_jobs").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ job: data });
  } catch (error) {
    console.error("[Jobs PATCH]", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}
