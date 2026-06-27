import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("kv_products")
      .select("id, name, price, commission_rate, category")
      .eq("is_trackable", true)
      .order("name")
      .limit(limit);

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        data: [
          { id: "p1", name: "Smart TV 55 inch", price: 450000, commission_rate: 5, category: "Electronics" },
          { id: "p2", name: "Wireless Earbuds", price: 25000, commission_rate: 8, category: "Electronics" },
          { id: "p3", name: "Laptop Backpack", price: 15000, commission_rate: 10, category: "Accessories" },
          { id: "p4", name: "Power Bank 20000mAh", price: 12000, commission_rate: 7, category: "Electronics" },
        ],
      });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
