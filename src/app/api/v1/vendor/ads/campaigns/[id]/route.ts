import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_CAMPAIGN_DETAIL = {
  id: "c1",
  name: "Summer Sale",
  metrics: {
    impressions: 12500,
    clicks: 340,
    orders: 28,
    spend: 3200,
    revenue: 25600,
    acos: 12.5,
    ctr: 2.72,
    conversion_rate: 8.24,
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_ad_campaigns")
      .select("*, kv_ad_campaign_metrics(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEMO_CAMPAIGN_DETAIL);
  }
}
