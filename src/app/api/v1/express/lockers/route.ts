import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "5000");
    const city = searchParams.get("city");
    const status = searchParams.get("status") || "active";

    const where: any = { status };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (lat !== 0 && lng !== 0) {
      const lockers = await (prisma as any).$queryRaw`
        SELECT *, 
          ST_Distance(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) as distance
        FROM ksp_lockers
        WHERE status = ${status}
        AND ST_Distance(
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) <= ${radius}
        ORDER BY distance
        LIMIT 50
      `;
      return NextResponse.json({ lockers });
    }

    const lockers = await (prisma as any).ksp_lockers.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json({ lockers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch lockers" },
      { status: 500 }
    );
  }
}
