import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    // Fetch data from multiple tables in parallel
    const [products, orders, wallet] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, regular_price, inventory_quantity, status, sales_count")
        .eq("vendor_id", vendorId || "")
        .order("sales_count", { ascending: false })
        .limit(5),
      supabase
        .from("orders")
        .select("id, status, total, created_at")
        .eq("vendor_id", vendorId || "")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("kv_wallets")
        .select("balance, pending_balance, total_earned, total_withdrawn")
        .eq("user_id", vendorId || "")
        .single(),
    ]);

    const productList = (products.data || []) as Record<string, unknown>[];
    const orderList = (orders.data || []) as Record<string, unknown>[];
    const walletData = wallet.data as Record<string, unknown> | null;

    // Build dashboard response
    const kpis = {
      totalRevenue: walletData ? Number(walletData.total_earned || 0) : 0,
      pendingOrders: orderList.filter((o) => o.status === "pending").length,
      shippedOrders: orderList.filter((o) => ["shipped", "delivered"].includes(String(o.status))).length,
      totalProducts: productList.length,
      lowStock: productList.filter((p) => Number(p.inventory_quantity || 0) < 10).length,
      walletBalance: walletData ? Number(walletData.balance || 0) : 0,
      pendingPayout: walletData ? Number(walletData.pending_balance || 0) : 0,
      todayOrders: orderList.filter((o) => {
        const d = new Date(String(o.created_at || ""));
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length,
    };

    const topProducts = productList.slice(0, 5).map((p) => ({
      id: String(p.id),
      name: String(p.name || "Product"),
      price: Number(p.regular_price || 0),
      stock: Number(p.inventory_quantity || 0),
      sales: Number(p.sales_count || 0),
    }));

    const recentOrders = orderList.slice(0, 8).map((o) => ({
      id: String(o.id),
      status: String(o.status || "pending"),
      total: Number(o.total || 0),
      date: String(o.created_at || new Date().toISOString()),
    }));

    return NextResponse.json({
      data: {
        kpis,
        topProducts,
        recentOrders,
        healthScore: 92,
        outOfStock: kpis.lowStock,
        buyBoxWinRate: 78,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
