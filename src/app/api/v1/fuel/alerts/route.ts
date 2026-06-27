import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoAlerts = [
  {
    id: "alert-001",
    account_id: "demo-account",
    alert_type: "price_threshold",
    origin_country: "NG",
    destination_country: "NG",
    threshold_percent: 10,
    channels: ["email"],
    frequency: "daily",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "alert-002",
    account_id: "demo-account",
    alert_type: "surcharge_change",
    origin_country: "GB",
    destination_country: "GB",
    threshold_percent: 5,
    channels: ["email", "sms"],
    frequency: "realtime",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: account_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_alerts")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: demoAlerts.filter((a) => a.account_id === accountId),
        source: "demo",
      });
    }

    return NextResponse.json({ success: true, data, source: "database" });
  } catch {
    return NextResponse.json({ success: true, data: demoAlerts, source: "demo" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, alert_type, origin_country, destination_country, threshold_percent, channels, frequency } = body;

    if (!account_id || !alert_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: account_id, alert_type" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_alerts")
      .insert({
        account_id,
        alert_type,
        origin_country: origin_country || null,
        destination_country: destination_country || null,
        threshold_percent: threshold_percent || 5,
        channels: channels || ["email"],
        frequency: frequency || "daily",
        is_active: true,
      })
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kv_fuel_alerts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
