import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_aff_b2b_partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "b1",
        company: "ABC Enterprises",
        contact: "John Smith",
        referral_commission: 3,
        account_value: 2500000,
        status: "active",
        referred_vendors: 12,
      },
      {
        id: "b2",
        company: "Global Trade Ltd",
        contact: "Sarah Johnson",
        referral_commission: 2.5,
        account_value: 1800000,
        status: "active",
        referred_vendors: 8,
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}
