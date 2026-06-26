import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, coordinates, radius, metadata } = body;

    if (!name || !type || !coordinates) {
      return NextResponse.json(
        { error: "name, type, and coordinates are required" },
        { status: 400 }
      );
    }

    const validTypes = ["delivery_restriction", "high_demand", "surge_zone", "no_parking", "restricted_area"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const geofence = await (prisma as any).ksp_geofences.create({
      data: {
        name,
        type,
        coordinates,
        radius: radius || 1000,
        metadata: metadata || {},
        status: "active",
      },
    });

    return NextResponse.json({ geofence }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create geofence" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const type = searchParams.get("type");
    const status = searchParams.get("status") || "active";

    const where: any = { status };
    if (type) where.type = type;

    if (lat !== 0 && lng !== 0) {
      const geofences = await (prisma as any).$queryRaw`
        SELECT *,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) as distance
        FROM ksp_geofences
        WHERE status = ${status}
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          radius + 1000
        )
        ORDER BY distance
      `;
      return NextResponse.json({ geofences });
    }

    const geofences = await (prisma as any).ksp_geofences.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ geofences });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch geofences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, name, coordinates, radius, metadata } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await (prisma as any).ksp_geofences.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Geofence not found" }, { status: 404 });
    }

    const geofence = await (prisma as any).ksp_geofences.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        name: name ?? existing.name,
        coordinates: coordinates ?? existing.coordinates,
        radius: radius ?? existing.radius,
        metadata: metadata ?? existing.metadata,
      },
    });

    return NextResponse.json({ geofence });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update geofence" },
      { status: 500 }
    );
  }
}
