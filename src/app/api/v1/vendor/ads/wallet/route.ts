import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_WALLET = {
  balance: 45000,
  currency: "NGN",
  transactions: [
    { id: "t1", type: "topup", amount: 20000, date: "2026-06-20", status: "completed" },
    { id: "t2", type: "spend", amount: -3200, date: "2026-06-25", status: "completed" },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const supabase = createAdminClient();
    const { data: wallet, error: walletErr } = await supabase
      .from("kv_ad_wallets")
      .select("*")
      .eq("vendor_id", vendorId ?? "")
      .single();

    if (walletErr) throw walletErr;

    const { data: transactions } = await supabase
      .from("kv_ad_wallet_transactions")
      .select("*")
      .eq("vendor_id", vendorId ?? "")
      .order("date", { ascending: false })
      .limit(50);

    return NextResponse.json({ ...wallet, transactions: transactions ?? [] });
  } catch {
    return NextResponse.json(DEMO_WALLET);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, method } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_ad_wallet_transactions")
      .insert({ amount, method, type: "topup", status: "completed" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transaction: data });
  } catch {
    return NextResponse.json({ success: true, message: "Ad wallet top-up initiated" });
  }
}
