import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const tier = searchParams.get("tier");

    const where: any = { isActive: true };
    if (countryCode) where.countryCode = countryCode;
    if (tier) where.tier = tier;

    const cards = await (prisma as any).glxRateCard.findMany({
      where,
      orderBy: [{ countryCode: "asc" }, { tier: "asc" }, { baseRate: "asc" }],
    });
    return NextResponse.json({ data: cards });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rate cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const card = await (prisma as any).glxRateCard.create({ data: body });
    return NextResponse.json({ data: card });
  } catch {
    return NextResponse.json({ error: "Failed to save rate card" }, { status: 500 });
  }
}
