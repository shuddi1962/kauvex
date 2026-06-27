import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    let query = supabase
      .from("kv_aff_banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (partnerId) query = query.eq("partner_id", partnerId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        data: [
          { id: "b1", name: "Hero Banner 728x90", size: "728x90", image_url: "/images/banners/hero-728x90.jpg", category: "homepage" },
          { id: "b2", name: "Product Banner 300x250", size: "300x250", image_url: "/images/banners/product-300x250.jpg", category: "product" },
          { id: "b3", name: "Sale Banner 160x600", size: "160x600", image_url: "/images/banners/sale-160x600.jpg", category: "promotion" },
        ],
      });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
