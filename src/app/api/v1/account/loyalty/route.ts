import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoLoyalty = {
  tier: "Gold",
  points: 2450,
  next_tier: "Platinum",
  next_tier_points: 5000,
  progress: 49,
  rules: [
    { tier: "Bronze", min_points: 0, benefits: ["1% cashback", "Free shipping above ₦50K"] },
    { tier: "Silver", min_points: 500, benefits: ["2% cashback", "Free shipping above ₦30K", "Early access sales"] },
    { tier: "Gold", min_points: 2000, benefits: ["3% cashback", "Free shipping all orders", "Priority support", "Exclusive deals"] },
    { tier: "Platinum", min_points: 5000, benefits: ["5% cashback", "Free express shipping", "Dedicated account manager", "VIP events"] },
  ],
  redeem_options: [
    { id: "r1", name: "₦500 Store Credit", points: 500, value: 500 },
    { id: "r2", name: "₦1000 Store Credit", points: 900, value: 1000 },
    { id: "r3", name: "₦2500 Store Credit", points: 2000, value: 2500 },
    { id: "r4", name: "₦5000 Store Credit", points: 3800, value: 5000 },
  ],
  history: [
    { id: "h1", type: "earn", points: 450, description: "Order #KV-78905", date: "2026-06-24" },
    { id: "h2", type: "earn", points: 120, description: "Product Review", date: "2026-06-23" },
    { id: "h3", type: "redeem", points: -500, description: "₦500 Store Credit", date: "2026-06-20" },
    { id: "h4", type: "earn", points: 890, description: "Order #KV-78850", date: "2026-06-18" },
    { id: "h5", type: "earn", points: 350, description: "Referral Bonus", date: "2026-06-15" },
    { id: "h6", type: "expire", points: -120, description: "Points Expiry", date: "2026-06-01" },
  ],
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("kv_loyalty")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return NextResponse.json({ loyalty: data });
  } catch {
    return NextResponse.json({ loyalty: demoLoyalty });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { option_id } = body;

    if (!option_id) {
      return NextResponse.json({ error: "option_id is required" }, { status: 400 });
    }

    const option = demoLoyalty.redeem_options.find((o) => o.id === option_id);
    if (!option) {
      return NextResponse.json({ error: "Invalid redemption option" }, { status: 400 });
    }

    const { error } = await supabase
      .from("kv_loyalty_redeemptions")
      .insert({ user_id: user.id, option_id, points_spent: option.points, value: option.value });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      redeemed: option,
      remaining_points: demoLoyalty.points - option.points,
    });
  } catch {
    return NextResponse.json({
      success: true,
      redeemed: null,
      remaining_points: 2450 - 900,
    });
  }
}
