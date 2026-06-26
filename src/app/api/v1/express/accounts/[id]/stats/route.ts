import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const account = await (prisma as any).ksp_express_accounts.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalShipments,
      deliveredShipments,
      totalSpend,
      avgDeliveryTime,
      topRoutes,
      shipmentsByService,
    ] = await Promise.all([
      (prisma as any).ksp_express_waybills.count({
        where: {
          accountId: id,
          createdAt: { gte: startDate },
        },
      }),
      (prisma as any).ksp_express_waybills.count({
        where: {
          accountId: id,
          status: "delivered",
          createdAt: { gte: startDate },
        },
      }),
      (prisma as any).ksp_express_waybills.aggregate({
        where: {
          accountId: id,
          createdAt: { gte: startDate },
        },
        _sum: { totalCost: true },
      }),
      (prisma as any).ksp_express_waybills.aggregate({
        where: {
          accountId: id,
          status: "delivered",
          deliveredAt: { not: null },
          createdAt: { gte: startDate },
        },
        _avg: {
          deliveredAt: true,
        },
      }),
      (prisma as any).ksp_express_waybills.groupBy({
        by: ["originCity", "destCity"],
        where: {
          accountId: id,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      (prisma as any).ksp_express_waybills.groupBy({
        by: ["serviceTier"],
        where: {
          accountId: id,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        _sum: { totalCost: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalShipments,
        deliveredShipments,
        deliveryRate: totalShipments > 0
          ? ((deliveredShipments / totalShipments) * 100).toFixed(1)
          : "0",
        totalSpend: totalSpend._sum.totalCost || 0,
        avgDeliveryTime,
        topRoutes,
        shipmentsByService,
        period,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch account stats" },
      { status: 500 }
    );
  }
}
