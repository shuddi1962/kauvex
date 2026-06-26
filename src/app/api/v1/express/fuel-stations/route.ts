import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const fuelType = searchParams.get("fuel_type");

    let query = supabase
      .from("kv_ksp_fuel_stations")
      .select("*")
      .order("price", { ascending: true });

    if (country) query = query.eq("country_code", country);
    if (city) query = query.eq("city", city);
    if (fuelType) query = query.eq("fuel_type", fuelType);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
