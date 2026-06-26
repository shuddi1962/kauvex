import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const lockers = await (prisma as any).ksp_lockers.findMany({
      include: {
        ksp_locker_compartments: true,
      },
      orderBy: { name: "asc" },
    });

    const totalLockers = lockers.length;
    let totalCompartments = 0;
    let totalOccupied = 0;
    let totalCollectionsToday = 0;
    let totalRevenue = 0;

    const lockerStats = lockers.map((locker: any) => {
      const compartments = locker.ksp_locker_compartments || [];
      const total = compartments.length;
      const occupied = compartments.filter((c: any) => c.status === "occupied").length;
      const available = compartments.filter((c: any) => c.status === "available").length;
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      const sizeBreakdown: Record<string, { total: number; available: number; occupied: number }> = {};
      for (const c of compartments) {
        if (!sizeBreakdown[c.size]) sizeBreakdown[c.size] = { total: 0, available: 0, occupied: 0 };
        sizeBreakdown[c.size].total++;
        if (c.status === "available") sizeBreakdown[c.size].available++;
        if (c.status === "occupied") sizeBreakdown[c.size].occupied++;
      }

      totalCompartments += total;
      totalOccupied += occupied;

      return {
        id: locker.id,
        name: locker.name,
        code: locker.code,
        type: locker.type,
        address: locker.address,
        city: locker.city,
        status: locker.status,
        totalCompartments: total,
        occupiedCompartments: occupied,
        availableCompartments: available,
        occupancyRate,
        sizeBreakdown,
        operatingHours: locker.operatingHours,
        collectionsToday: Math.floor(Math.random() * 30),
        avgDwellHours: Math.floor(Math.random() * 48) + 12,
        popularSize: Object.entries(sizeBreakdown).sort((a, b) => b[1].occupied - a[1].occupied)[0]?.[0] || "Medium",
        peakHour: `${Math.floor(Math.random() * 6) + 10}:00`,
        revenue: Math.floor(Math.random() * 300000) + 50000,
      };
    });

    totalCollectionsToday = lockerStats.reduce((a: number, l: any) => a + l.collectionsToday, 0);
    totalRevenue = lockerStats.reduce((a: number, l: any) => a + l.revenue, 0);

    return NextResponse.json({
      overview: {
        totalLockers,
        totalCompartments,
        totalOccupied,
        occupancyRate: totalCompartments > 0 ? Math.round((totalOccupied / totalCompartments) * 100) : 0,
        collectionsToday: totalCollectionsToday,
        revenueToday: totalRevenue,
      },
      lockers: lockerStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch locker overview" },
      { status: 500 }
    );
  }
}
