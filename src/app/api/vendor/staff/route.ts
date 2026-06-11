import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    if (!vendorId) {
      return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_staff")
      .select("id, email, role, status, last_active_at, invited_at, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
    }

    return NextResponse.json({ staff: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, email, role } = body;

    if (!vendor_id || !email || !role) {
      return NextResponse.json(
        { error: "vendor_id, email, and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["vendor_manager", "vendor_support", "vendor_warehouse"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_staff")
      .insert({
        vendor_id,
        email,
        role,
        status: "invited",
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to invite staff member" }, { status: 500 });
    }

    return NextResponse.json({ staff: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { error } = await db
      .from("vendor_staff")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove staff member" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
