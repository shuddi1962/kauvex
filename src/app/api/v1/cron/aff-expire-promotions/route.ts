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

    const { data: promotions, error: fetchError } = await supabase
      .from("kv_aff_promotions")
      .select("id")
      .eq("status", "active")
      .lt("end_date", new Date().toISOString());

    if (fetchError) {
      if (fetchError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw fetchError;
    }

    if (!promotions || promotions.length === 0) {
      return NextResponse.json({ count: 0, message: "No expired promotions found" });
    }

    const ids = promotions.map((p) => p.id);

    const { error: updateError } = await supabase
      .from("kv_aff_promotions")
      .update({ status: "expired" })
      .in("id", ids);

    if (updateError) throw updateError;

    return NextResponse.json({
      count: ids.length,
      message: `Expired ${ids.length} promotions`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
