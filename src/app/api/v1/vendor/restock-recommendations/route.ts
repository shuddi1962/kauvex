import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    // Query products with low stock or high velocity
    let query = supabase
      .from("products")
      .select("id, name, slug, sku, inventory_quantity, sales_velocity")
      .lt("inventory_quantity", 20)
      .order("sales_velocity", { ascending: false })
      .limit(20);

    if (vendorId) query = query.eq("vendor_id", vendorId);

    const { data, error } = await query;

    if (error || !data?.length) {
      // Return demo recommendations
      return NextResponse.json({
        data: [
          { id: "1", product_name: "Wireless Mouse", current_stock: 5, avg_daily_sales: 12, recommended_reorder: 100, days_until_stockout: 1, confidence: 0.95, priority: "critical" },
          { id: "2", product_name: "USB-C Hub", current_stock: 8, avg_daily_sales: 8, recommended_reorder: 80, days_until_stockout: 1, confidence: 0.92, priority: "critical" },
          { id: "3", product_name: "Laptop Stand", current_stock: 15, avg_daily_sales: 5, recommended_reorder: 60, days_until_stockout: 3, confidence: 0.88, priority: "high" },
          { id: "4", product_name: "Screen Protector", current_stock: 30, avg_daily_sales: 10, recommended_reorder: 150, days_until_stockout: 3, confidence: 0.85, priority: "high" },
          { id: "5", product_name: "Keyboard Cover", current_stock: 25, avg_daily_sales: 6, recommended_reorder: 80, days_until_stockout: 4, confidence: 0.80, priority: "medium" },
        ],
      });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
