import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoProfile = {
  id: "profile-001",
  partner_id: "partner-001",
  vehicle_type: "motorcycle",
  fuel_type: "petrol",
  consumption_per_km: 0.04,
  tank_capacity_liters: 15,
  average_speed_kmh: 45,
  routes_per_day: 8,
  avg_distance_per_route_km: 12,
  currency_code: "NGN",
  monthly_fuel_budget: 150000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: partner_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_partner_profiles")
      .select("*")
      .eq("partner_id", partnerId)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        data: { ...demoProfile, partner_id: partnerId },
        source: "demo",
      });
    }

    return NextResponse.json({ success: true, data, source: "database" });
  } catch {
    return NextResponse.json({ success: true, data: demoProfile, source: "demo" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: partner_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_partner_profiles")
      .upsert({
        partner_id,
        vehicle_type: body.vehicle_type || "motorcycle",
        fuel_type: body.fuel_type || "petrol",
        consumption_per_km: body.consumption_per_km || 0.04,
        tank_capacity_liters: body.tank_capacity_liters || 15,
        average_speed_kmh: body.average_speed_kmh || 45,
        routes_per_day: body.routes_per_day || 8,
        avg_distance_per_route_km: body.avg_distance_per_route_km || 12,
        currency_code: body.currency_code || "NGN",
        monthly_fuel_budget: body.monthly_fuel_budget || 150000,
        updated_at: new Date().toISOString(),
      }, { onConflict: "partner_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, ...fields } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: partner_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_partner_profiles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("partner_id", partner_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
