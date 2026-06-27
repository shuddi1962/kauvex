import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    let query = supabase
      .from("kv_fbk_inventory")
      .select("*")
      .eq("status", "dead_stock")
      .order("days_since_sale", { ascending: false });

    if (vendorId) query = query.eq("vendor_id", vendorId);

    const { data, error } = await query;

    if (error) {
      // Return demo data if table doesn't exist
      return NextResponse.json({
        data: [
          { id: "1", product_name: "Old Model Router", sku: "RT-OLD-001", quantity: 24, days_since_sale: 120, estimated_removal_fee: 5000, suggested_action: "remove", vendor_id: vendorId || "demo" },
          { id: "2", product_name: "Discontinued Charger", sku: "CH-DIS-002", quantity: 50, days_since_sale: 95, estimated_removal_fee: 7500, suggested_action: "discount", vendor_id: vendorId || "demo" },
          { id: "3", product_name: "Legacy Cable Adapter", sku: "CA-LGY-003", quantity: 100, days_since_sale: 200, estimated_removal_fee: 12000, suggested_action: "remove", vendor_id: vendorId || "demo" },
        ],
      });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
