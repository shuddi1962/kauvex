import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const countries = await (prisma as any).glxCountry.findMany({
      orderBy: { countryName: "asc" },
      include: {
        _count: { select: { carriers: true, rateCards: true, packagingFees: true } },
      },
    });
    return NextResponse.json({ data: countries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const country = await (prisma as any).glxCountry.upsert({
      where: { countryCode: body.countryCode },
      create: body,
      update: body,
    });
    return NextResponse.json({ data: country });
  } catch {
    return NextResponse.json({ error: "Failed to save country" }, { status: 500 });
  }
}
