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

    const { data: existingPayouts, error: fetchError } = await supabase
      .from("kv_aff_payouts")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      if (fetchError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw fetchError;
    }

    if (!existingPayouts || existingPayouts.length === 0) {
      return NextResponse.json({ count: 0, message: "No pending payouts older than 7 days" });
    }

    let processedCount = 0;

    for (const payout of existingPayouts) {
      await supabase
        .from("kv_aff_payouts")
        .update({ status: "processing" })
        .eq("id", payout.id);

      const { error: updateError } = await supabase
        .from("kv_aff_payouts")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      if (!updateError) {
        processedCount++;
      }
    }

    const { data: eligiblePartners } = await supabase
      .from("kv_aff_partners")
      .select("id, confirmed_balance, minimum_payout")
      .gte("confirmed_balance", 0);

    let newPayoutsCount = 0;

    if (eligiblePartners) {
      for (const partner of eligiblePartners) {
        const minPayout = partner.minimum_payout || 5000;
        if ((partner.confirmed_balance || 0) >= minPayout) {
          const { error: insertError } = await supabase
            .from("kv_aff_payouts")
            .insert({
              partner_id: partner.id,
              amount: partner.confirmed_balance,
              status: "pending",
              created_at: new Date().toISOString(),
            });

          if (!insertError) {
            newPayoutsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      count: processedCount,
      newPayoutsCreated: newPayoutsCount,
      message: `Processed ${processedCount} payouts, created ${newPayoutsCount} new payout requests`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
