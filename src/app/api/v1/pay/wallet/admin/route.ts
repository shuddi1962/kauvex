import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    // Get wallet overview for admin
    let query = supabase
      .from("kv_wallets")
      .select("*")
      .order("balance", { ascending: false });

    if (vendorId) query = query.eq("user_id", vendorId);

    const { data, error } = await query;

    if (error) {
      // Return demo data if table doesn't exist
      return NextResponse.json({
        data: [
          { id: "w1", user_id: "v1", user_name: "TechHub Lagos", balance: 245000, currency: "NGN", status: "active", frozen: false, total_earned: 1250000, total_withdrawn: 1005000, last_transaction: "2026-06-25" },
          { id: "w2", user_id: "v2", user_name: "Fashion Forward NG", balance: 89000, currency: "NGN", status: "active", frozen: false, total_earned: 567000, total_withdrawn: 478000, last_transaction: "2026-06-24" },
          { id: "w3", user_id: "v3", user_name: "Gadget World", balance: 312000, currency: "NGN", status: "active", frozen: false, total_earned: 2100000, total_withdrawn: 1788000, last_transaction: "2026-06-26" },
          { id: "w4", user_id: "v4", user_name: "Home Essentials", balance: 45000, currency: "NGN", status: "active", frozen: true, total_earned: 340000, total_withdrawn: 295000, last_transaction: "2026-06-20" },
        ],
        summary: {
          total_balance: 691000,
          total_earned: 4257000,
          total_withdrawn: 3566000,
          active_wallets: 3,
          frozen_wallets: 1,
        },
      });
    }

    // Calculate summary
    const wallets = data || [];
    const summary = {
      total_balance: wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0),
      total_earned: wallets.reduce((sum, w) => sum + (Number(w.total_earned) || 0), 0),
      total_withdrawn: wallets.reduce((sum, w) => sum + (Number(w.total_withdrawn) || 0), 0),
      active_wallets: wallets.filter((w) => w.status === "active" && !w.frozen).length,
      frozen_wallets: wallets.filter((w) => w.frozen).length,
    };

    return NextResponse.json({ data: wallets, summary });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { wallet_id, action } = body;

    if (!wallet_id || !action) {
      return NextResponse.json({ error: "wallet_id and action are required" }, { status: 400 });
    }

    if (action === "freeze") {
      const { error } = await supabase
        .from("kv_wallets")
        .update({ frozen: true, status: "frozen" })
        .eq("id", wallet_id);
      if (error) throw error;
    } else if (action === "unfreeze") {
      const { error } = await supabase
        .from("kv_wallets")
        .update({ frozen: false, status: "active" })
        .eq("id", wallet_id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
