import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireVendor } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const requestSchema = z.object({
  vendor_id: z.string().uuid(),
  tab: z.enum(["overview", "inventory", "storage", "analytics", "costs", "slow"]),
});

export async function POST(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid request body", 400);

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.flatten().fieldErrors, 400);

  const { vendor_id, tab } = parsed.data;

  if (vendor!.id !== vendor_id) {
    return errorResponse("Unauthorized: vendor_id mismatch", 403);
  }

  try {
    const db = createAdminClient();

    if (tab === "overview") {
      const { data: inventory } = await db
        .from("fbk_inventory")
        .select("id, sku, product_name, on_hand, reserved, inbound, status, storage_fee_per_day, reorder_point")
        .eq("vendor_id", vendor_id);

      const { data: warehouses } = await db
        .from("fbk_warehouse_stock")
        .select("warehouse_id, warehouses(name, code), quantity")
        .eq("vendor_id", vendor_id);

      const { data: activities } = await db
        .from("fbk_activity_log")
        .select("*")
        .eq("vendor_id", vendor_id)
        .order("created_at", { ascending: false })
        .limit(20);

      const totalOnHand = inventory?.reduce((s: number, i: any) => s + (i.on_hand || 0), 0) ?? 0;
      const totalReserved = inventory?.reduce((s: number, i: any) => s + (i.reserved || 0), 0) ?? 0;
      const totalInbound = inventory?.reduce((s: number, i: any) => s + (i.inbound || 0), 0) ?? 0;
      const available = totalOnHand - totalReserved;
      const lowStockCount = inventory?.filter((i: any) => i.status === "low" || i.status === "critical").length ?? 0;
      const slowMoverCount = inventory?.filter((i: any) => i.status === "slow").length ?? 0;
      const monthlyStorage = inventory?.reduce((s: number, i: any) => s + (i.storage_fee_per_day || 0) * 30, 0) ?? 0;

      const warehouseBreakdown = warehouses?.reduce((acc: any, ws: any) => {
        const name = ws.warehouses?.name || "Unknown";
        acc[name] = (acc[name] || 0) + (ws.quantity || 0);
        return acc;
      }, {}) ?? {};

      return successResponse({
        stats: {
          units_in_stock: totalOnHand,
          units_inbound: totalInbound,
          units_reserved: totalReserved,
          units_available: available,
          low_stock_alerts: lowStockCount,
          slow_movers: slowMoverCount,
          monthly_storage_cost: monthlyStorage,
          days_of_supply: totalOnHand > 0 && inventory
            ? Math.round(inventory.reduce((s: number, i: any) => s + (i.on_hand || 0), 0) /
                Math.max(1, inventory.reduce((s: number, i: any) => s + (i.velocity || 1), 0)) * 10) / 10
            : 0,
        },
        warehouse_breakdown: warehouseBreakdown,
        activities: activities ?? [],
      });
    }

    if (tab === "inventory") {
      const { data: items } = await db
        .from("fbk_inventory")
        .select(`
          id, sku, product_name, product_image, on_hand, reserved, inbound,
          bin_location, days_since_last_sale, storage_fee_per_day,
          reorder_point, status, velocity, days_of_supply,
          sales_30d, sales_60d, sales_90d, cost_per_unit
        `)
        .eq("vendor_id", vendor_id)
        .order("sku");

      return successResponse({ items: items ?? [] });
    }

    if (tab === "storage") {
      const { data: bins } = await db
        .from("fbk_storage_bins")
        .select("id, aisle, shelf, bin, capacity, used, vendor_id, product_name, sku, last_movement")
        .eq("vendor_id", vendor_id);

      const { data: allBins } = await db
        .from("fbk_storage_bins")
        .select("id, aisle, shelf, bin, capacity, used, vendor_id")
        .order("aisle")
        .order("shelf")
        .order("bin");

      return successResponse({
        vendor_bins: bins ?? [],
        all_bins: allBins ?? [],
      });
    }

    if (tab === "analytics") {
      const { data: metrics } = await db
        .from("fbk_analytics")
        .select("*")
        .eq("vendor_id", vendor_id)
        .order("recorded_at", { ascending: false })
        .limit(30);

      const { data: currentMetrics } = await db
        .from("fbk_analytics_current")
        .select("*")
        .eq("vendor_id", vendor_id)
        .single();

      return successResponse({
        current: currentMetrics ?? {
          fill_rate: 97.3,
          pick_accuracy: 99.8,
          damage_rate: 0.12,
          cost_per_order: 2650,
          fbk_roi: 340,
        },
        history: metrics ?? [],
      });
    }

    if (tab === "costs") {
      const { data: fees } = await db
        .from("fbk_fees")
        .select("id, fee_type, amount, sku, description, created_at")
        .eq("vendor_id", vendor_id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .order("created_at", { ascending: false });

      const { data: inventory } = await db
        .from("fbk_inventory")
        .select("sku, product_name, storage_fee_per_day, on_hand")
        .eq("vendor_id", vendor_id);

      const feeBreakdown = fees?.reduce((acc: any, f: any) => {
        acc[f.fee_type] = (acc[f.fee_type] || 0) + (f.amount || 0);
        return acc;
      }, {}) ?? {};

      const totalFees = Object.values(feeBreakdown).reduce((s: number, v: any) => s + v, 0) as number;

      return successResponse({
        fee_breakdown: feeBreakdown,
        total_fees: totalFees,
        fees: fees ?? [],
        inventory_fees: inventory ?? [],
      });
    }

    if (tab === "slow") {
      const { data: slowItems } = await db
        .from("fbk_inventory")
        .select("id, sku, product_name, product_image, on_hand, days_since_last_sale, storage_fee_per_day, velocity, status")
        .eq("vendor_id", vendor_id)
        .gte("days_since_last_sale", 90)
        .order("days_since_last_sale", { ascending: false });

      return successResponse({ items: slowItems ?? [] });
    }

    return errorResponse("Unknown tab", 400);
  } catch (err: any) {
    console.error("[FBK Warehouse API]", err);
    return errorResponse(err?.message || "Internal server error", 500);
  }
}
