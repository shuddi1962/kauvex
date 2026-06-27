import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoReferrals = {
  code: "JOHN2026",
  link: "https://kauvex.com/ref/JOHN2026",
  stats: {
    total_referrals: 12,
    successful: 8,
    pending: 4,
    earned: 24000,
    pending_rewards: 6000,
    conversion_rate: 66.7,
  },
  history: [
    { id: "ref1", name: "Alice M.", status: "completed", date: "2026-06-24", reward: 3000 },
    { id: "ref2", name: "Bob K.", status: "completed", date: "2026-06-22", reward: 3000 },
    { id: "ref3", name: "Carol D.", status: "pending", date: "2026-06-20", reward: 3000 },
    { id: "ref4", name: "David E.", status: "completed", date: "2026-06-18", reward: 3000 },
    { id: "ref5", name: "Eve F.", status: "pending", date: "2026-06-15", reward: 3000 },
    { id: "ref6", name: "Frank G.", status: "completed", date: "2026-06-10", reward: 3000 },
    { id: "ref7", name: "Grace H.", status: "completed", date: "2026-06-08", reward: 3000 },
  ],
  tiers: [
    { referrals: 1, reward: 1000, label: "First Referral" },
    { referrals: 5, reward: 2000, label: "5 Referrals" },
    { referrals: 10, reward: 5000, label: "10 Referrals" },
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
      .from("kv_referrals")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return NextResponse.json({ referrals: data });
  } catch {
    return NextResponse.json({ referrals: demoReferrals });
  }
}
