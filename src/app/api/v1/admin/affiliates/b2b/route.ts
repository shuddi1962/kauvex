import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function GET(request: NextRequest) {
  try {
    const { data: referrals, error } = await admin
      .from("kv_aff_b2b_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const partnerIds = [...new Set((referrals || []).map((r: any) => r.partner_id).filter(Boolean))];
    const partnerMap: Record<string, { display_name: string; email: string }> = {};

    if (partnerIds.length > 0) {
      const { data: partners } = await admin
        .from("kv_aff_partners")
        .select("id, display_name, user_id")
        .in("id", partnerIds);

      const userIds = (partners || []).map((p: any) => p.user_id).filter(Boolean);
      const userMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        (profiles || []).forEach((p: any) => { userMap[p.id] = p.email; });
      }

      (partners || []).forEach((p: any) => {
        partnerMap[p.id] = {
          display_name: p.display_name,
          email: userMap[p.user_id] || "",
        };
      });
    }

    const enriched = (referrals || []).map((r: any) => ({
      ...r,
      partner_name: partnerMap[r.partner_id]?.display_name || "Unknown",
      partner_email: partnerMap[r.partner_id]?.email || "",
    }));

    return NextResponse.json({ referrals: enriched });
  } catch (err) {
    console.error("Admin B2B GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
