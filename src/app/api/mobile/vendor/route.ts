import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest, paginateMobileQuery } from "@/lib/mobile-api-helpers";

const demoSalesData = {
  todaySales: 450000,
  todayOrders: 12,
  pendingOrders: 5,
  totalRevenue: 12500000,
  walletBalance: 2850000,
  monthlyRevenue: 3200000,
  adsPerformance: {
    impressions: 45200,
    clicks: 2340,
    spend: 143200,
    roas: 3.2,
  },
  recentOrders: [
    { id: "ORD-8842", customer: "John Doe", total: 85000, status: "pending", items: 3, date: "2026-04-05" },
    { id: "ORD-8841", customer: "Amara Obi", total: 195000, status: "processing", items: 1, date: "2026-04-04" },
    { id: "ORD-8840", customer: "Chidi Eze", total: 45000, status: "shipped", items: 2, date: "2026-04-04" },
  ],
  topProducts: [
    { id: "P-001", name: "Yamaha F150 Engine", sales: 45, revenue: 202500000, stock: 12 },
    { id: "P-002", name: "Marine GPS Device", sales: 120, revenue: 54000000, stock: 45 },
    { id: "P-003", name: "Bilge Pump 2000 GPH", sales: 200, revenue: 5500000, stock: 150 },
  ],
};

const demoProducts = Array.from({ length: 50 }, (_, i) => ({
  id: `PROD-${String(i + 1).padStart(3, "0")}`,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 500000) + 1000,
  stock: Math.floor(Math.random() * 100),
  status: ["active", "draft", "out_of_stock"][Math.floor(Math.random() * 3)],
  sales: Math.floor(Math.random() * 200),
}));

const demoOrders = Array.from({ length: 30 }, (_, i) => ({
  id: `ORD-${String(8800 + i)}`,
  customer: `Customer ${i + 1}`,
  total: Math.floor(Math.random() * 500000) + 5000,
  status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)],
  items: Math.floor(Math.random() * 5) + 1,
  date: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString().split("T")[0],
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
      return formatMobileResponse(demoSalesData);

    case "products":
      return formatMobileResponse(
        paginateMobileQuery(demoProducts, page, limit)
      );

    case "orders":
      return formatMobileResponse(
        paginateMobileQuery(demoOrders, page, limit)
      );

    case "analytics": {
      const dailySales = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 500000) + 50000,
        orders: Math.floor(Math.random() * 20) + 5,
        views: Math.floor(Math.random() * 5000) + 500,
      }));
      return formatMobileResponse({
        totalRevenue: 12500000,
        totalOrders: 340,
        averageOrderValue: 36765,
        conversionRate: 3.2,
        dailySales,
      });
    }

    case "ads": {
      const campaigns = [
        { id: "CAMP-001", name: "Spring Sale", status: "active", budget: 200000, spent: 143200, impressions: 45200, clicks: 2340, roas: 3.2 },
        { id: "CAMP-002", name: "Marine Electronics", status: "active", budget: 180000, spent: 98000, impressions: 28900, clicks: 1450, roas: 2.8 },
      ];
      return formatMobileResponse(campaigns);
    }

    case "wallet":
      return formatMobileResponse({
        balance: 2850000,
        pending: 450000,
        totalWithdrawn: 12000000,
        recentTransactions: [
          { id: "T-001", type: "credit", amount: 85000, desc: "Order payout #ORD-8842", date: "2026-04-05" },
          { id: "T-002", type: "debit", amount: 50000, desc: "Ad spend", date: "2026-04-04" },
        ],
      });

    default:
      return formatMobileError(`Unknown section: ${section}`);
  }
}

export async function PUT(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "update_inventory") {
      return formatMobileResponse({
        updated: true,
        productId: body.productId,
        quantity: body.quantity,
      });
    }

    return formatMobileError(`Unknown action: ${action}`);
  } catch {
    return formatMobileError("Invalid request body");
  }
}
