import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ warehouse: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;
    const body = await request.json();

    const { data, error } = await db
      .from("warehouses")
      .update({
        name: body.name,
        code: body.code,
        type: body.type,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postal_code: body.postal_code,
        contact_name: body.contact_name,
        phone: body.phone,
        email: body.email,
        is_pickup_point: body.is_pickup_point,
        is_dropoff_zone: body.is_dropoff_zone,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ warehouse: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;

    const { error } = await db
      .from("warehouses")
      .update({ status: "inactive", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Warehouse deactivated" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
