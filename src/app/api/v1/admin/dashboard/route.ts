import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    const { count: totalUsers } = await db.from("profiles").select("*", { count: "exact", head: true });
    const { count: newUsersToday } = await db
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    const { count: totalVendors } = await db.from("vendors").select("*", { count: "exact", head: true });
    const { count: pendingVendors } = await db.from("vendors").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: approvedVendors } = await db.from("vendors").select("*", { count: "exact", head: true }).eq("status", "approved");

    const { count: totalProducts } = await db.from("products").select("*", { count: "exact", head: true });
    const { count: publishedProducts } = await db.from("products").select("*", { count: "exact", head: true }).eq("status", "published");
    const { count: draftProducts } = await db.from("products").select("*", { count: "exact", head: true }).eq("status", "draft");

    const { count: totalOrders } = await db.from("orders").select("*", { count: "exact", head: true });
    const { count: pendingOrders } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: processingOrders } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "processing");
    const { count: completedOrders } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed");
    const { count: cancelledOrders } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled");

    const { count: totalDisputes } = await db.from("disputes").select("*", { count: "exact", head: true });
    const { count: openDisputes } = await db.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open");

    const { data: revenueByMonth } = await db
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid")
      .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString())
      .order("created_at", { ascending: false });

    const totalRevenue30d = (revenueByMonth || [])
      .filter((o: any) => new Date(o.created_at) >= new Date(Date.now() - 30 * 86400000))
      .reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);

    const totalRevenue90d = (revenueByMonth || [])
      .reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);

    const { data: recentOrders } = await db
      .from("orders")
      .select("id, order_number, status, total, customer_id, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: topVendors } = await db
      .from("vendors")
      .select("id, shop_name, shop_slug, total_sales, total_revenue, rating")
      .eq("status", "approved")
      .order("total_sales", { ascending: false })
      .limit(10);

    const { data: recentStorefronts } = await db
      .from("storefronts")
      .select("id, name, slug, status, is_default, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: lowStockItems } = await db
      .from("product_inventory")
      .select("*, product:product_id(name, sku)")
      .lt("quantity", 5)
      .limit(20);

    return successResponse({
      users: { total: totalUsers || 0, new_today: newUsersToday || 0 },
      vendors: { total: totalVendors || 0, pending: pendingVendors || 0, approved: approvedVendors || 0 },
      products: { total: totalProducts || 0, published: publishedProducts || 0, draft: draftProducts || 0 },
      orders: {
        total: totalOrders || 0,
        pending: pendingOrders || 0,
        processing: processingOrders || 0,
        completed: completedOrders || 0,
        cancelled: cancelledOrders || 0,
      },
      disputes: { total: totalDisputes || 0, open: openDisputes || 0 },
      revenue: { last_30_days: totalRevenue30d, last_90_days: totalRevenue90d },
      recent_orders: recentOrders || [],
      top_vendors: topVendors || [],
      recent_storefronts: recentStorefronts || [],
      low_stock_items: lowStockItems || [],
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
