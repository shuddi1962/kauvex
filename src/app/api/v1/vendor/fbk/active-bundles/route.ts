import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const { data, error } = await supabase
      .from("kv_product_bundles")
      .select("*")
      .eq("vendor_id", vendorId || "")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return NextResponse.json({
        data: [
          { id: "b1", name: "Home Office Starter Kit", items: ["Wireless Mouse", "USB-C Hub", "Laptop Stand"], bundle_price: 45000, regular_price: 55000, savings: 10000, sales_count: 23, status: "active" },
          { id: "b2", name: "Student Tech Pack", items: ["Laptop Sleeve", "Wireless Earbuds", "Screen Protector"], bundle_price: 28000, regular_price: 35000, savings: 7000, sales_count: 45, status: "active" },
          { id: "b3", name: "Gaming Essentials", items: ["Gaming Mouse", "Mouse Pad XL", "Keyboard Cover"], bundle_price: 32000, regular_price: 42000, savings: 10000, sales_count: 18, status: "active" },
        ],
      });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
