import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { waybillId, vehicleType, distanceKm, weightKg, packagingType } = body;

    if (!waybillId || !distanceKm) {
      return NextResponse.json(
        { error: "waybillId and distanceKm are required" },
        { status: 400 }
      );
    }

    const emissionFactors: Record<string, number> = {
      motorcycle: 0.103,
      van: 0.210,
      truck: 0.310,
      electric_van: 0.050,
      electric_truck: 0.080,
      bicycle: 0,
      walking: 0,
    };

    const factor = emissionFactors[vehicleType || "van"] || 0.210;
    const weightFactor = weightKg ? 1 + (weightKg / 1000) * 0.1 : 1;
    const co2Grams = Math.round(distanceKm * factor * weightFactor * 100) / 100;
    const co2Kg = Math.round(co2Grams / 1000 * 100) / 100;

    const treeOffsetCost = Math.round(co2Kg * 0.5 * 100) / 100;

    const carbonRecord = await (prisma as any).ksp_carbon_tracking.create({
      data: {
        waybillId,
        vehicleType: vehicleType || "van",
        distanceKm,
        weightKg: weightKg || null,
        co2Grams,
        co2Kg,
        packagingType: packagingType || null,
        treeOffsetCost,
        offsetStatus: "pending",
      },
    });

    return NextResponse.json({
      carbon: {
        ...carbonRecord,
        equivalent: {
          treeDays: Math.round(co2Kg / 0.06 * 10) / 10,
          phoneCharges: Math.round(co2Kg / 0.008 * 10) / 10,
          NetflixHours: Math.round(co2Kg / 0.036 * 10) / 10,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to track carbon" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const period = searchParams.get("period") || "30d";

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

    const where: any = { createdAt: { gte: startDate } };
    if (accountId) {
      where.waybillId = {
        in: (await (prisma as any).ksp_express_waybills.findMany({
          where: { accountId },
          select: { id: true },
        })).map((w: any) => w.id),
      };
    }

    const [totalCarbon, byVehicle, offsetStats] = await Promise.all([
      (prisma as any).ksp_carbon_tracking.aggregate({
        where,
        _sum: { co2Kg: true },
        _count: { id: true },
      }),
      (prisma as any).ksp_carbon_tracking.groupBy({
        by: ["vehicleType"],
        where,
        _sum: { co2Kg: true },
        _count: { id: true },
      }),
      (prisma as any).ksp_carbon_tracking.aggregate({
        where,
        _sum: { treeOffsetCost: true },
        _count: { id: true },
        where: { ...where, offsetStatus: "completed" },
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalCo2Kg: totalCarbon._sum.co2Kg || 0,
        totalShipments: totalCarbon._count.id || 0,
        avgCo2PerShipment: totalCarbon._count.id > 0
          ? Math.round((totalCarbon._sum.co2Kg || 0) / totalCarbon._count.id * 100) / 100
          : 0,
        totalOffsetCost: offsetStats._sum.treeOffsetCost || 0,
        shipmentsOffset: offsetStats._count.id || 0,
      },
      byVehicle,
      period,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch carbon data" },
      { status: 500 }
    );
  }
}
