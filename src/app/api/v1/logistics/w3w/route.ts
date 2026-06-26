import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateW3WAddress } from "@/lib/logistics/what3words";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const entityType = searchParams.get("entityType");

    const where: any = {};
    if (countryCode) where.countryCode = countryCode;
    if (entityType) where.entityType = entityType;

    const locations = await (prisma as any).glxWhat3WordsLocation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ data: locations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch W3W locations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entityType, entityId, what3wordsAddress, latitude, longitude, countryCode } = body;

    if (!validateW3WAddress(what3wordsAddress)) {
      return NextResponse.json({ error: "Invalid What3Words format (expected: word.word.word)" }, { status: 400 });
    }

    const location = await (prisma as any).glxWhat3WordsLocation.upsert({
      where: {
        entityType_entityId: { entityType, entityId },
      },
      create: {
        entityType,
        entityId,
        what3wordsAddress,
        latitude,
        longitude,
        countryCode,
      },
      update: {
        what3wordsAddress,
        latitude,
        longitude,
        countryCode,
      },
    });
    return NextResponse.json({ data: location });
  } catch {
    return NextResponse.json({ error: "Failed to save W3W location" }, { status: 500 });
  }
}
