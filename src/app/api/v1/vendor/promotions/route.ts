import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_PROMOTIONS = [
  {
    id: "p1",
    code: "SUMMER10",
    type: "percentage",
    value: 10,
    min_order: 50000,
    max_uses: 100,
    used: 23,
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    status: "active",
  },
  {
    id: "p2",
    code: "WELCOME5000",
    type: "fixed",
    value: 5000,
    min_order: 25000,
    max_uses: 500,
    used: 187,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_promotions")
      .select("*")
      .eq("vendor_id", vendorId ?? "")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? DEMO_PROMOTIONS);
  } catch {
    return NextResponse.json(DEMO_PROMOTIONS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, min_order, max_uses, start_date, end_date } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_promotions")
      .insert({
        code,
        type,
        value,
        min_order,
        max_uses,
        start_date,
        end_date,
        used: 0,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { id: "p_new", ...((await request.json().catch(() => ({}))) as Record<string, unknown>), used: 0, status: "active" },
      { status: 201 }
    );
  }
}
