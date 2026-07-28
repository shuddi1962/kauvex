import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "dashboard";

    switch (section) {
      case "dashboard": {
        const [vendors, orders, disputes, products] = await Promise.all([
          prisma.vendor.count(),
          prisma.order.count(),
          prisma.dispute.count({ where: { status: "open" } }),
          prisma.product.count({ where: { status: "active" } }),
        ]);

        return formatMobileResponse({
          totalVendors: vendors,
          totalOrders: orders,
          openDisputes: disputes,
          activeProducts: products,
          recentVendors: await prisma.vendor.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, storeName: true, status: true, createdAt: true } }),
        });
      }

      case "vendors": {
        const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
        return formatMobileResponse({ vendors });
      }

      case "disputes": {
        const disputes = await prisma.dispute.findMany({ where: { status: "open" }, orderBy: { openedAt: "desc" }, take: 20 });
        return formatMobileResponse({ disputes });
      }

      default:
        return formatMobileError(`Unknown section: ${section}`);
    }
  } catch (error) {
    return formatMobileError("Failed to load admin data");
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

    if (action === "resolve_dispute") {
      await prisma.dispute.update({ where: { id: body.disputeId }, data: { status: "resolved", adminDecision: body.decision } });
      return formatMobileResponse({ resolved: true, disputeId: body.disputeId });
    }

    return formatMobileError(`Unknown action: ${action}`);
  } catch {
    return formatMobileError("Invalid request body");
  }
}