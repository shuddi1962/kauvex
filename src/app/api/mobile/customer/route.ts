import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized - valid Bearer token required", 401);
  }

  try {
    const userId = auth.userId;
    const accountId = auth.accountId || userId;

    const [orders, wishlistItems, wallet, loyalty] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, status: true, total: true,
          orderItems: { select: { quantity: true } },
          createdAt: true,
        },
      }),
      prisma.kv_wishlist_item.count({ where: { customerId: accountId } }).catch(() => 0),
      prisma.wallet.findUnique({ where: { accountId }, select: { balance: true } }).catch(() => null),
      prisma.loyaltyProgram.findUnique({ where: { customerId: userId }, select: { points: true, tier: true } }).catch(() => null),
    ]);

    const activeOrders = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status || "")).length;

    const dashboard = {
      activeOrders,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      wishlistCount: wishlistItems,
      walletBalance: wallet?.balance || 0,
      loyaltyPoints: loyalty?.points || 0,
      loyaltyTier: loyalty?.tier || "Bronze",
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        items: o.orderItems.reduce((s, i) => s + i.quantity, 0),
        date: o.createdAt.toISOString(),
      })),
    };

    return formatMobileResponse(dashboard);
  } catch (error) {
    return formatMobileError("Failed to load dashboard");
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
      case "register_device":
        return formatMobileResponse({ registered: true, deviceToken: body.deviceToken, platform: body.platform });

      case "update_profile":
        return formatMobileResponse({ updated: true, profile: { ...body.profile, id: auth.userId } });

      default:
        return formatMobileError(`Unknown action: ${action}`);
    }
  } catch {
    return formatMobileError("Invalid request body");
  }
}