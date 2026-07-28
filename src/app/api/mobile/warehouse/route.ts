import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const warehouseId = auth.accountId || auth.userId;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "dashboard";

    switch (section) {
      case "dashboard": {
        const [inboundCount, inventory, orders] = await Promise.all([
          prisma.kv_warehouse_inbound_shipment.count({ where: { warehouseId, status: "pending" as any } }).catch(() => 0),
          prisma.product.findMany({ take: 100, select: { id: true } }).catch(() => []),
          prisma.order.count({ where: { status: "processing" } }).catch(() => 0),
        ]);

        return formatMobileResponse({
          pendingInbound: inboundCount,
          totalInventory: inventory.length,
          processingOrders: orders,
          recentInventory: inventory.slice(0, 10).map((p: any) => ({ id: p.id })),
        });
      }

      case "inventory": {
        const products = await prisma.product.findMany({ take: 50, orderBy: { createdAt: "desc" }, select: { id: true, name: true, sku: true, status: true } }).catch(() => []);
        return formatMobileResponse({ inventory: products });
      }

      default:
        return formatMobileError(`Unknown section: ${section}`);
    }
  } catch (error) {
    return formatMobileError("Failed to load warehouse data");
  }
}