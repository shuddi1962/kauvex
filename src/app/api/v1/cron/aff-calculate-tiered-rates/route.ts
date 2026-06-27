import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TIER_THRESHOLDS = [
  { minSales: 100, rate: 10 },
  { minSales: 51, rate: 7 },
  { minSales: 11, rate: 5 },
  { minSales: 0, rate: 3 },
];

function getTierRate(totalSales: number): number {
  for (const tier of TIER_THRESHOLDS) {
    if (totalSales >= tier.minSales) return tier.rate;
  }
  return 3;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: partners, error: fetchError } = await supabase
      .from("kv_aff_partners")
      .select("id, commission_model, commission_rate")
      .eq("commission_model", "tiered");

    if (fetchError) {
      if (fetchError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw fetchError;
    }

    if (!partners || partners.length === 0) {
      return NextResponse.json({ count: 0, message: "No partners with tiered commission model" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let updatedCount = 0;

    for (const partner of partners) {
      const { count: salesCount } = await supabase
        .from("kv_aff_commissions")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id)
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo);

      const totalSales = salesCount || 0;
      const newRate = getTierRate(totalSales);

      if (newRate !== partner.commission_rate) {
        const { error: updateError } = await supabase
          .from("kv_aff_partners")
          .update({
            commission_rate: newRate,
            tier_updated_at: new Date().toISOString(),
          })
          .eq("id", partner.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      count: updatedCount,
      message: `Updated ${updatedCount} partners with new tier rates`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
