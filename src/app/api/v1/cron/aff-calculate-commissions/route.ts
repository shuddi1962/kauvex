import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: commissions, error: fetchError } = await supabase
      .from("kv_aff_commissions")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      if (fetchError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw fetchError;
    }

    if (!commissions || commissions.length === 0) {
      return NextResponse.json({ count: 0, message: "No pending commissions" });
    }

    let processedCount = 0;

    for (const commission of commissions) {
      let calculatedAmount = 0;

      switch (commission.commission_model) {
        case "percentage":
          calculatedAmount = (commission.sale_amount || 0) * ((commission.commission_rate || 0) / 100);
          break;
        case "flat_fee":
          calculatedAmount = commission.commission_rate || 0;
          break;
        case "tiered":
        case "performance":
          calculatedAmount = (commission.sale_amount || 0) * ((commission.commission_rate || 0) / 100);
          break;
        case "bounty":
          calculatedAmount = commission.commission_rate || 0;
          break;
        default:
          calculatedAmount = (commission.sale_amount || 0) * ((commission.commission_rate || 0) / 100);
      }

      const { error: updateError } = await supabase
        .from("kv_aff_commissions")
        .update({
          amount: Math.round(calculatedAmount * 100) / 100,
          status: "calculated",
          calculated_at: new Date().toISOString(),
        })
        .eq("id", commission.id);

      if (!updateError) {
        processedCount++;
      }
    }

    return NextResponse.json({
      count: processedCount,
      message: `Processed ${processedCount} commissions`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
