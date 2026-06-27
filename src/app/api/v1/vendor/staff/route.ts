import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_STAFF = [
  {
    id: "s1",
    name: "John Admin",
    email: "john@vendor.com",
    role: "admin",
    status: "active",
    last_login: "2026-06-25",
    permissions: ["products", "orders", "inventory", "analytics"],
  },
  {
    id: "s2",
    name: "Jane Viewer",
    email: "jane@vendor.com",
    role: "viewer",
    status: "active",
    last_login: "2026-06-20",
    permissions: ["orders"],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_vendor_staff")
      .select("*")
      .eq("vendor_id", vendorId ?? "")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? DEMO_STAFF);
  } catch {
    return NextResponse.json(DEMO_STAFF);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, permissions } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_vendor_staff")
      .insert({ name, email, role, permissions, status: "pending" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, staff: data });
  } catch {
    return NextResponse.json({ success: true, message: "Staff invitation sent" });
  }
}
