import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_REPORTS = [
  { id: "r1", name: "Sales Report - June 2026", type: "sales", status: "completed", created_at: "2026-06-25", download_url: "#" },
  { id: "r2", name: "Inventory Report", type: "inventory", status: "completed", created_at: "2026-06-24", download_url: "#" },
  { id: "r3", name: "Advertising Performance", type: "advertising", status: "generating", created_at: "2026-06-26", download_url: null },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_vendor_reports")
      .select("*")
      .eq("vendor_id", vendorId ?? "")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? DEMO_REPORTS);
  } catch {
    return NextResponse.json(DEMO_REPORTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, date_range } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_vendor_reports")
      .insert({ type, date_range, status: "generating" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { id: "r_new", status: "generating", created_at: new Date().toISOString(), download_url: null },
      { status: 201 }
    );
  }
}
