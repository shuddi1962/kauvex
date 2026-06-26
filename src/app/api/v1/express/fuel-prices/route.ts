import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "NG";
    const state = searchParams.get("state");
    const fuelType = searchParams.get("fuelType") || "petrol";

    const where: any = { country, fuelType };
    if (state) where.state = state;

    const prices = await (prisma as any).ksp_fuel_prices.findMany({
      where,
      orderBy: { effectiveDate: "desc" },
      take: 30,
    });

    if (prices.length === 0) {
      return NextResponse.json({
        prices: [],
        message: "No fuel prices found for this region",
      });
    }

    const latest = prices[0];
    const historical = prices.slice(1, 8);

    const trend = historical.length >= 2
      ? latest.pricePerLiter > historical[0].pricePerLiter
        ? "rising"
        : latest.pricePerLiter < historical[0].pricePerLiter
          ? "falling"
          : "stable"
      : "insufficient_data";

    return NextResponse.json({
      current: latest,
      trend,
      historical,
      summary: {
        country,
        state,
        fuelType,
        currentPrice: latest.pricePerLiter,
        currency: latest.currency || "NGN",
        lastUpdated: latest.effectiveDate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch fuel prices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, state, fuelType, pricePerLiter, currency, source, effectiveDate } = body;

    if (!country || !fuelType || !pricePerLiter) {
      return NextResponse.json(
        { error: "country, fuelType, and pricePerLiter are required" },
        { status: 400 }
      );
    }

    const price = await (prisma as any).ksp_fuel_prices.create({
      data: {
        country,
        state: state || null,
        fuelType,
        pricePerLiter,
        currency: currency || "NGN",
        source: source || "manual",
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      },
    });

    return NextResponse.json({ price }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create fuel price" },
      { status: 500 }
    );
  }
}
