import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest, paginateMobileQuery } from "@/lib/mobile-api-helpers";

const demoDashboard = {
  stats: {
    totalRevenue: 18450000,
    totalOrders: 1240,
    totalVendors: 45,
    totalCustomers: 12580,
    totalProducts: 15230,
    pendingVendors: 3,
    openDisputes: 5,
    growthRate: 12.5,
  },
  recentOrders: [
    { id: "ORD-8842", customer: "John Doe", total: 85000, status: "processing", date: "2026-04-05" },
    { id: "ORD-8841", customer: "Amara Obi", total: 195000, status: "shipped", date: "2026-04-05" },
    { id: "ORD-8840", customer: "Chidi Eze", total: 45000, status: "delivered", date: "2026-04-04" },
  ],
  revenueChart: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    revenue: Math.floor(Math.random() * 3000000) + 1000000,
    orders: Math.floor(Math.random() * 100) + 50,
  })),
  topVendors: [
    { id: "V-001", name: "MarinePro NG", sales: 450, revenue: 5200000 },
    { id: "V-002", name: "SecurityFirst Ltd", sales: 320, revenue: 3800000 },
    { id: "V-003", name: "AutoParts Direct", sales: 280, revenue: 2900000 },
  ],
};

const demoPendingVendors = [
  { id: "V-004", shopName: "TechGadgets NG", owner: "James O.", email: "james@techgadgets.ng", registered: "2026-04-03", documents: ["business_reg.pdf", "tax_clearance.pdf"] },
  { id: "V-005", shopName: "FashionHub Africa", owner: "Mira A.", email: "mira@fashionhub.africa", registered: "2026-04-02", documents: ["cac_cert.pdf"] },
  { id: "V-006", shopName: "HomeAppliances NG", owner: "Tunde B.", email: "tunde@homeappliances.ng", registered: "2026-04-01", documents: ["business_reg.pdf", "id_card.pdf", "tax_clearance.pdf"] },
];

const demoAnalytics = {
  totalSessions: 284500,
  activeUsers: 1250,
  bounceRate: 32.5,
  avgSessionDuration: "4m 32s",
  topPages: [
    { path: "/category/marine", views: 45200 },
    { path: "/product/yamaha-f150", views: 12800 },
    { path: "/search?q=outboard", views: 9800 },
  ],
  deviceBreakdown: {
    mobile: 68,
    desktop: 25,
    tablet: 7,
  },
};

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

    case "vendors": {
      const allVendors = [
        { id: "V-001", shopName: "MarinePro NG", status: "active", sales: 450, revenue: 5200000, rating: 4.5 },
        { id: "V-002", shopName: "SecurityFirst Ltd", status: "active", sales: 320, revenue: 3800000, rating: 4.2 },
        { id: "V-003", shopName: "AutoParts Direct", status: "active", sales: 280, revenue: 2900000, rating: 4.0 },
        ...demoPendingVendors.map((v) => ({ ...v, sales: 0, revenue: 0, rating: 0, status: "pending" })),
      ];
      return formatMobileResponse(paginateMobileQuery(allVendors, page, limit));
    }

    case "orders": {
      const allOrders = Array.from({ length: 50 }, (_, i) => ({
        id: `ORD-${String(8800 + i)}`,
        customer: `Customer ${i + 1}`,
        total: Math.floor(Math.random() * 500000) + 5000,
        status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split("T")[0],
      }));
      return formatMobileResponse(paginateMobileQuery(allOrders, page, limit));
    }

    case "analytics":
      return formatMobileResponse(demoAnalytics);

    case "customers": {
      const customers = Array.from({ length: 50 }, (_, i) => ({
        id: `USR-${String(5000 + i)}`,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@email.com`,
        orders: Math.floor(Math.random() * 20),
        spent: Math.floor(Math.random() * 2000000),
        joined: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString().split("T")[0],
      }));
      return formatMobileResponse(paginateMobileQuery(customers, page, limit));
    }

    case "warehouses":
      return formatMobileResponse({
        warehouses: [
          { id: "WH-001", name: "Lagos Main", location: "Ikeja, Lagos", capacity: 85, items: 15230, status: "active" },
          { id: "WH-002", name: "Abuja Hub", location: "Central, Abuja", capacity: 45, items: 8200, status: "active" },
          { id: "WH-003", name: "Port Harcourt", location: "PH Township", capacity: 30, items: 4500, status: "active" },
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

    switch (action) {
      case "approve_vendor": {
        return formatMobileResponse({
          approved: true,
          vendorId: body.vendorId,
          status: body.approve ? "active" : "rejected",
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
