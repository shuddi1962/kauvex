import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_METRICS = [
  { date: "2026-06-25", impressions: 420, clicks: 12, orders: 1, spend: 105, revenue: 850 },
  { date: "2026-06-24", impressions: 380, clicks: 9, orders: 0, spend: 95, revenue: 0 },
  { date: "2026-06-23", impressions: 410, clicks: 11, orders: 2, spend: 100, revenue: 1700 },
  { date: "2026-06-22", impressions: 350, clicks: 8, orders: 0, spend: 85, revenue: 0 },
  { date: "2026-06-21", impressions: 440, clicks: 14, orders: 3, spend: 110, revenue: 2550 },
  { date: "2026-06-20", impressions: 390, clicks: 10, orders: 1, spend: 98, revenue: 850 },
  { date: "2026-06-19", impressions: 370, clicks: 7, orders: 0, spend: 90, revenue: 0 },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "7d";

    const days = period === "90d" ? 90 : period === "30d" ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_ad_campaign_metrics")
      .select("*")
      .eq("campaign_id", id)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? DEMO_METRICS.slice(0, days));
  } catch {
    return NextResponse.json(DEMO_METRICS);
  }
}
