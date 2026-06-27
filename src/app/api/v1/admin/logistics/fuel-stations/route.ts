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
      .order("city", { ascending: true });

    if (country) query = query.eq("country_code", country);
    if (city) query = query.eq("city", city);
    if (fuelType) query = query.eq("fuel_type", fuelType);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

    const { data, error } = await supabase
      .from("kv_ksp_fuel_stations")
      .insert({
        name: body.name,
        city: body.city,
        country_code: body.country_code,
        latitude: body.latitude,
        longitude: body.longitude,
        fuel_type: body.fuel_type || "petrol",
        price: body.price,
        currency_code: body.currency_code || "NGN",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("kv_ksp_fuel_stations")
      .update({
        ...updates,
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await supabase
      .from("kv_ksp_fuel_stations")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
