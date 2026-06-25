import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPartnerB2bStats } from "@/lib/affiliates/b2b";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)\./)?.[1] || "";
    const tokenMatch = cookieHeader.match(new RegExp(`sb-${projectRef}-auth-token=([^;]+)`));
    if (!tokenMatch) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await anon.auth.getUser(tokenMatch[1]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: partner } = await admin
      .from("kv_aff_partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const stats = await getPartnerB2bStats(partner.id);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("B2B stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
