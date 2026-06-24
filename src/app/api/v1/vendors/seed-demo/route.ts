import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireVendor } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  try {
    const adminDb = createAdminClient();

    const { data: existing } = await adminDb.from("products").select("id").eq("vendor_id", vendor!.id).limit(1);
    if (existing && existing.length > 0) {
      return successResponse({ message: "Inventory already has products" });
    }

    const slug = vendor!.id.slice(0, 6);
    const demoProducts = [
      { name: "Wireless Bluetooth Headphones", slug: `demo-headphones-${slug}`, sku: `DEMO-${slug}-001`, price: 45000 },
      { name: "Premium Leather Wallet", slug: `demo-wallet-${slug}`, sku: `DEMO-${slug}-002`, price: 12500 },
      { name: "Portable Power Bank 20000mAh", slug: `demo-powerbank-${slug}`, sku: `DEMO-${slug}-003`, price: 22000 },
      { name: "Organic Green Tea Set", slug: `demo-tea-${slug}`, sku: `DEMO-${slug}-004`, price: 8500 },
      { name: "Stainless Steel Water Bottle", slug: `demo-bottle-${slug}`, sku: `DEMO-${slug}-005`, price: 15000 },
    ];

    for (const dp of demoProducts) {
      const { data: product } = await adminDb
        .from("products")
        .insert({
          vendor_id: vendor!.id,
          name: dp.name,
          slug: dp.slug,
          sku: dp.sku,
          regular_price: dp.price,
          sale_price: Math.round(dp.price * 0.9),
          cost_price: Math.round(dp.price * 0.6),
          status: "published",
          images: [],
          type: "simple",
          short_description: `High-quality ${dp.name.toLowerCase()} — perfect for everyday use.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      // Sync to product_inventory
      if (product) {
        await adminDb.from("product_inventory").insert({
          product_id: product.id,
          location_name: "default",
          quantity: Math.floor(Math.random() * 50) + 10,
          low_stock_threshold: 5,
          backorder_enabled: false,
        });
      }
    }

    return successResponse({ message: "Demo products seeded with inventory", count: demoProducts.length });
  } catch {
    return errorResponse("Failed to seed demo products", 500);
  }
}
