import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest, paginateMobileQuery } from "@/lib/mobile-api-helpers";

const demoDashboard = {
  warehouseName: "Lagos Main Warehouse",
  totalProducts: 15230,
  lowStockItems: 23,
  outOfStockItems: 5,
  pendingShipments: 18,
  processingOrders: 12,
  todaysReceivals: 8,
  capacity: 78,
  recentMovements: [
    { id: "MV-001", product: "Yamaha F150 Engine", type: "inbound", quantity: 10, date: "2026-04-05", user: "John W." },
    { id: "MV-002", product: "Marine GPS Device", type: "outbound", quantity: 5, date: "2026-04-05", user: "Sarah M." },
    { id: "MV-003", product: "Bilge Pump 2000 GPH", type: "transfer", quantity: 50, date: "2026-04-04", user: "John W." },
  ],
};

const demoInventory = Array.from({ length: 100 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  productName: `Product ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(5, "0")}`,
  quantity: Math.floor(Math.random() * 500),
  location: `Aisle-${String(Math.floor(Math.random() * 10) + 1).padStart(2, "0")}`,
  lowStockThreshold: 10,
  lastCounted: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split("T")[0],
}));

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || "dashboard";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  switch (section) {
    case "dashboard":
      return formatMobileResponse(demoDashboard);

    case "inventory":
      return formatMobileResponse(paginateMobileQuery(demoInventory, page, limit));

    case "shipments": {
      const shipments = Array.from({ length: 25 }, (_, i) => ({
        id: `SHP-${String(500 + i).padStart(3, "0")}`,
        orderId: `ORD-${String(8800 + i)}`,
        destination: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"][Math.floor(Math.random() * 5)],
        status: ["pending", "packing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
        items: Math.floor(Math.random() * 5) + 1,
        carrier: ["GIG Logistics", "DHL", "FedEx", "Aramex"][Math.floor(Math.random() * 4)],
      }));
      return formatMobileResponse(paginateMobileQuery(shipments, page, limit));
    }

    default:
      return formatMobileError(`Unknown section: ${section}`);
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "receive": {
        return formatMobileResponse({
          received: true,
          productId: body.productId,
          sku: body.sku,
          quantity: body.quantity,
          location: body.location,
          timestamp: new Date().toISOString(),
        });
      }

      case "transfer": {
        return formatMobileResponse({
          transferred: true,
          productId: body.productId,
          quantity: body.quantity,
          fromLocation: body.fromLocation,
          toLocation: body.toLocation,
          timestamp: new Date().toISOString(),
        });
      }

      case "ship": {
        return formatMobileResponse({
          processed: true,
          shipmentId: body.shipmentId,
          status: "packing",
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return formatMobileError(`Unknown action: ${action}`);
    }
  } catch {
    return formatMobileError("Invalid request body");
  }
}
