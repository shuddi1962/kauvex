import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const db = createAdminClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const country = searchParams.get("country");

    let query = db.from("warehouses").select("*").order("name");

    if (type) query = query.eq("type", type);
    if (status) query = query.eq("status", status);
    if (country) query = query.eq("country", country);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch warehouses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ warehouses: data || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = createAdminClient();
    const body = await request.json();

    const { data, error } = await db
      .from("warehouses")
      .insert({
        name: body.name,
        code: body.code,
        type: body.type || "standard",
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country || "US",
        postal_code: body.postal_code,
        contact_name: body.contact_name,
        phone: body.phone,
        email: body.email,
        is_pickup_point: body.is_pickup_point || false,
        is_dropoff_zone: body.is_dropoff_zone || false,
        status: body.status || "active",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ warehouse: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
