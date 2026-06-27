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

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleClicks, error: countError } = await supabase
      .from("kv_aff_clicks")
      .select("id", { count: "exact", head: true })
      .lt("created_at", cutoff);

    if (countError) {
      if (countError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw countError;
    }

    const { count } = await supabase
      .from("kv_aff_clicks")
      .select("id", { count: "exact", head: true })
      .lt("created_at", cutoff);

    const { error: deleteError } = await supabase
      .from("kv_aff_clicks")
      .delete()
      .lt("created_at", cutoff);

    if (deleteError) throw deleteError;

    const deletedCount = count || 0;

    return NextResponse.json({
      count: deletedCount,
      message: `Deleted ${deletedCount} clicks older than 90 days`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
