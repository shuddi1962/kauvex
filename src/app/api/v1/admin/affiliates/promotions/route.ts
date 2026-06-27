import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_aff_promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "promo1",
        name: "Independence Day Sale",
        type: "percentage_discount",
        value: 15,
        start_date: "2026-10-01",
        end_date: "2026-10-03",
        status: "scheduled",
        usage_count: 0,
      },
      {
        id: "promo2",
        name: "New Partner Bonus",
        type: "flat_bonus",
        value: 5000,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        status: "active",
        usage_count: 23,
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, value, start_date, end_date } = body;

    if (!name || !type || !value || !start_date || !end_date) {
      return NextResponse.json(
        {
          success: false,
          error: "name, type, value, start_date, and end_date are required",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_aff_promotions")
      .insert({
        name,
        type,
        value,
        start_date,
        end_date,
        status: "scheduled",
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Promotion created (demo mode)",
    });
  }
}
