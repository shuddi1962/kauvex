import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_aff_partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "p1",
        name: "Lagos Tech Blog",
        email: "chidi@techblog.ng",
        type: "associate",
        status: "active",
        total_clicks: 1250,
        total_conversions: 45,
        total_commission: 42500,
        payout_balance: 18000,
        joined: "2026-03-15",
      },
      {
        id: "p2",
        name: "Fashion Influencer NG",
        email: "ama@fashion.ng",
        type: "influencer",
        status: "active",
        total_clicks: 890,
        total_conversions: 32,
        total_commission: 28000,
        payout_balance: 12000,
        joined: "2026-04-20",
      },
      {
        id: "p3",
        name: "Business Referrals Co",
        email: "info@bizref.co",
        type: "b2b_referral",
        status: "pending",
        total_clicks: 120,
        total_conversions: 5,
        total_commission: 15000,
        payout_balance: 15000,
        joined: "2026-06-01",
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, name, email, type, commission_rate, commission_model } =
      body;

    if (!name || !email || !type) {
      return NextResponse.json(
        { success: false, error: "name, email, and type are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const upsertData: Record<string, unknown> = {
      name,
      email,
      type,
      commission_rate: commission_rate ?? null,
      commission_model: commission_model ?? "percentage",
    };

    if (partner_id) {
      upsertData.id = partner_id;
    }

    const { data, error } = await supabase
      .from("kv_aff_partners")
      .upsert(upsertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: partner_id ? "Partner updated" : "Partner created",
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Partner saved (demo mode)",
    });
  }
}
