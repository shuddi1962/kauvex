import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type"); // "elements" or "addons"

    const supabase = createAdminClient();

    if (type === "addons") {
      let query = supabase.from("kv_ship_packaging_add_ons").select("*").eq("is_active", true);
      if (category) query = query.eq("available_for", category);
      const { data, error } = await query.order("name");
      if (error) throw error;
      return NextResponse.json({ addOns: data, total: data?.length || 0 });
    }

    let query = supabase.from("kv_ship_packaging_elements").select("*").eq("is_active", true);
    if (category) query = query.eq("category", category);
    const { data, error } = await query.order("category").order("name");
    if (error) throw error;

    return NextResponse.json({ elements: data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Packaging API]", error);
    return NextResponse.json({ error: "Failed to fetch packaging" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const table = body.type === "addon" ? "kv_ship_packaging_add_ons" : "kv_ship_packaging_elements";
    let insertData: Record<string, unknown>;

    if (body.type === "addon") {
      insertData = {
        name: body.name,
        description: body.description || "",
        price: body.price || 0,
        available_for: body.available_for || "all",
        is_active: true,
      };
    } else {
      insertData = {
        category: body.category || "outer",
        name: body.name,
        size_code: body.size_code || "",
        unit_cost: body.unit_cost || 0,
        is_kauvex_branded: body.is_kauvex_branded || false,
        is_active: true,
      };
    }

    const { data, error } = await supabase.from(table).insert(insertData).select().single();
    if (error) throw error;

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("[Packaging POST]", error);
    return NextResponse.json({ error: "Failed to create packaging item" }, { status: 500 });
  }
}
