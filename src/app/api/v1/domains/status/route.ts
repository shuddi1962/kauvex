import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendor_id");
  const domain = searchParams.get("domain");
  const supabase = createAdminClient();
  let query = supabase.from("kv_dom_domains").select("*");
  if (vendorId) query = query.eq("vendor_id", vendorId);
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ domains: data || [] });
}
