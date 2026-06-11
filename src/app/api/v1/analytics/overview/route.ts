import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") || "30")));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: profile } = await db.from("profiles").select("role, vendor_id").eq("id", user!.id).single();
    const isVendor = profile?.role === "vendor";
    const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

    if (!isVendor && !isAdmin) return errorResponse("Access denied", 403);

    if (isVendor) {
      const vendorId = profile!.vendor_id;

      const { count: totalProducts } = await db
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorId);

      const { count: publishedProducts } = await db
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorId)
        .eq("status", "published");

      const { data: vendorInfo } = await db
        .from("vendors")
        .select("total_sales, total_revenue, rating, positive_feedback")
        .eq("id", vendorId)
        .single();

      const { data: recentOrders } = await db
        .from("order_items")
        .select("*, order:order_id!inner(id, order_number, status, total, created_at)")
        .eq("order.status", "completed")
        .gte("order.created_at", since.toISOString())
        .limit(5);

      const revenue = vendorInfo?.total_revenue || 0;

      return successResponse({
        type: "vendor",
        total_products: totalProducts || 0,
        published_products: publishedProducts || 0,
        total_sales: vendorInfo?.total_sales || 0,
        total_revenue: revenue,
        rating: vendorInfo?.rating || 0,
        positive_feedback: vendorInfo?.positive_feedback || 0,
        recent_revenue_period: revenue,
        period_days: days,
      });
    }

    const { count: totalUsers } = await db.from("profiles").select("*", { count: "exact", head: true });
    const { count: totalVendors } = await db.from("vendors").select("*", { count: "exact", head: true });
    const { count: approvedVendors } = await db.from("vendors").select("*", { count: "exact", head: true }).eq("status", "approved");
    const { count: totalProducts } = await db.from("products").select("*", { count: "exact", head: true });
    const { count: publishedProducts } = await db.from("products").select("*", { count: "exact", head: true }).eq("status", "published");
    const { count: totalOrders } = await db.from("orders").select("*", { count: "exact", head: true });
    const { count: periodOrders } = await db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", since.toISOString());
    const { count: completedOrders } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed");

    const { data: revenueData } = await db
      .from("orders")
      .select("total")
      .eq("payment_status", "paid");

    const totalRevenue = (revenueData || []).reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);

    const { data: dailyMetrics } = await db
      .from("daily_metrics")
      .select("date, metric_type, value, count")
      .gte("created_at", since.toISOString())
      .order("date", { ascending: false })
      .limit(30);

    return successResponse({
      type: "platform",
      total_users: totalUsers || 0,
      total_vendors: totalVendors || 0,
      approved_vendors: approvedVendors || 0,
      total_products: totalProducts || 0,
      published_products: publishedProducts || 0,
      total_orders: totalOrders || 0,
      period_orders: periodOrders || 0,
      completed_orders: completedOrders || 0,
      total_revenue: totalRevenue,
      period_days: days,
      daily_metrics: dailyMetrics || [],
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
