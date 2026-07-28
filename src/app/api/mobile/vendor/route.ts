import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest, paginateMobileQuery } from "@/lib/mobile-api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || "dashboard";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const vendorId = auth.userId;

  try {
    switch (section) {
      case "dashboard": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const [orders, products, vendor] = await Promise.all([
          prisma.order.findMany({ where: { vendorId }, select: { id: true, total: true, status: true, createdAt: true } }),
          prisma.product.findMany({ where: { vendorId }, select: { id: true } }),
          prisma.vendor.findUnique({ where: { id: vendorId }, select: { walletBalance: true } }).catch(() => null),
        ]);

        const todayOrders = orders.filter((o) => o.createdAt >= today);
        const monthlyOrders = orders.filter((o) => o.createdAt >= monthStart);

        return formatMobileResponse({
          todaySales: todayOrders.reduce((s, o) => s + Number(o.total), 0),
          todayOrders: todayOrders.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
          walletBalance: vendor?.walletBalance || 0,
          monthlyRevenue: monthlyOrders.reduce((s, o) => s + Number(o.total), 0),
          totalProducts: products.length,
          recentOrders: orders.slice(0, 5).map((o) => ({ id: o.id, status: o.status, total: Number(o.total), date: o.createdAt.toISOString().split("T")[0] })),
        });
      }

      case "products": {
        const products = await prisma.product.findMany({
          where: { vendorId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: (page - 1) * limit,
        });
        return formatMobileResponse(paginateMobileQuery(products, page, limit));
      }

      case "orders": {
        const orders = await prisma.order.findMany({
          where: { vendorId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: (page - 1) * limit,
        });
        return formatMobileResponse(paginateMobileQuery(orders, page, limit));
      }

      case "wallet": {
        const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { walletBalance: true } });
        return formatMobileResponse({ balance: vendor?.walletBalance || 0 });
      }

      default:
        return formatMobileError(`Unknown section: ${section}`);
    }
  } catch (error) {
    return formatMobileError("Failed to load data");
  }
}