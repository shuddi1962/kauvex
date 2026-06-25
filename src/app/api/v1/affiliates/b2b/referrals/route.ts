import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createReferral, getPartnerReferrals } from "@/lib/affiliates/b2b";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function getPartnerFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)\./)?.[1] || "";
  const tokenMatch = cookieHeader.match(new RegExp(`sb-${projectRef}-auth-token=([^;]+)`));
  if (!tokenMatch) return null;

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await anon.auth.getUser(tokenMatch[1]);
  if (!user) return null;

  const { data: partner } = await admin
    .from("kv_aff_partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return partner;
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await getPartnerReferrals(partner.id);
    return NextResponse.json({ referrals });
  } catch (err) {
    console.error("B2B referrals GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { company_name, contact_name, contact_email, industry, deal_size, notes } = body;

    if (!company_name || !contact_name || !contact_email) {
      return NextResponse.json({ error: "company_name, contact_name, and contact_email are required" }, { status: 400 });
    }

    const referral = await createReferral(partner.id, {
      company_name,
      contact_name,
      contact_email,
      industry: industry || "Other",
      deal_size: deal_size || "small",
      notes,
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (err) {
    console.error("B2B referrals POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
