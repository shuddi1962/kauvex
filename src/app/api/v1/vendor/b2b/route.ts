import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_B2B = {
  opportunities: [
    { id: "o1", company: "TechCorp Ltd", product: "Wireless Earbuds", quantity: 500, budget: 2500000, status: "pending", created_at: "2026-06-24" },
    { id: "o2", company: "Fashion Hub", product: "Phone Cases", quantity: 2000, budget: 800000, status: "quoted", created_at: "2026-06-22" },
  ],
  quotes: [
    { id: "q1", opportunity_id: "o2", amount: 750000, status: "pending", valid_until: "2026-07-15" },
  ],
  discount_tiers: [
    { min_qty: 100, discount: 5 },
    { min_qty: 500, discount: 10 },
    { min_qty: 1000, discount: 15 },
    { min_qty: 5000, discount: 20 },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const supabase = createAdminClient();

    const [oppResult, quoteResult, tierResult] = await Promise.all([
      supabase
        .from("kv_b2b_opportunities")
        .select("*")
        .eq("vendor_id", vendorId ?? "")
        .order("created_at", { ascending: false }),
      supabase
        .from("kv_b2b_quotes")
        .select("*")
        .eq("vendor_id", vendorId ?? "")
        .order("created_at", { ascending: false }),
      supabase
        .from("kv_b2b_discount_tiers")
        .select("*")
        .eq("vendor_id", vendorId ?? "")
        .order("min_qty", { ascending: true }),
    ]);

    if (oppResult.error) throw oppResult.error;

    return NextResponse.json({
      opportunities: oppResult.data ?? DEMO_B2B.opportunities,
      quotes: quoteResult.data ?? DEMO_B2B.quotes,
      discount_tiers: tierResult.data ?? DEMO_B2B.discount_tiers,
    });
  } catch {
    return NextResponse.json(DEMO_B2B);
  }
}
