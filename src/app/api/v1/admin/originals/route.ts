import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const where = status ? { status } : {};

    const originals = await prisma.kauvexOriginal.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } },
        manufacturer: { select: { id: true, companyName: true, slug: true, countryCode: true, verificationTier: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const [candidates, active, discontinued] = await Promise.all([
      prisma.kauvexOriginal.count({ where: { status: "candidate" } }),
      prisma.kauvexOriginal.count({ where: { status: "active" } }),
      prisma.kauvexOriginal.count({ where: { status: "discontinued" } }),
    ]);

    const activeProducts = await prisma.kauvexOriginal.findMany({
      where: { status: "active" },
      select: { marginPercent: true, monthlySales: true, retailPrice: true },
    });

    const totalRevenue = activeProducts.reduce((sum, p) => sum + (Number(p.retailPrice) * (p.monthlySales ?? 0)), 0);
    const avgMargin = activeProducts.length > 0
      ? activeProducts.reduce((sum, p) => sum + Number(p.marginPercent), 0) / activeProducts.length
      : 0;

    return NextResponse.json({
      data: originals,
      stats: { candidates, active, discontinued, totalRevenue, avgMargin },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch originals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, manufacturerId, originalCost, retailPrice, monthlySales } = body;

    if (!productId || !manufacturerId || !originalCost || !retailPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const marginPercent = ((retailPrice - originalCost) / retailPrice) * 100;

    const original = await prisma.kauvexOriginal.create({
      data: {
        productId,
        manufacturerId,
        originalCost,
        retailPrice,
        marginPercent: Math.round(marginPercent * 100) / 100,
        monthlySales: monthlySales ?? 0,
        status: "candidate",
      },
    });

    return NextResponse.json({ data: original }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create original" }, { status: 500 });
  }
}
