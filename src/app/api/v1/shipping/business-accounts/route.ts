import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_ship_business_accounts")
      .insert({
        company_name: body.company_name,
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        billing_type: body.billing_type || "per_shipment",
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("[Business Accounts POST]", error);
    return NextResponse.json({ success: false, error: "Failed to create business account" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const supabase = createAdminClient();

    let query = supabase.from("kv_ship_business_accounts").select("*");
    if (email) query = query.eq("contact_email", email);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ success: true, data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Business Accounts GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch business accounts" }, { status: 500 });
  }
}
