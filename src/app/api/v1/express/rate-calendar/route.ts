import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "origin and destination are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const historicalRates = await (prisma as any).ksp_rate_calendar.findMany({
      where: {
        origin,
        destination,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    const now = new Date();
    const forecastDays = 30;
    const forecast: { date: string; dayOfWeek: string; predictedRate: number; confidence: number; isWeekend: boolean; recommendation: string }[] = [];

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const baseRate = historicalRates.length > 0
        ? historicalRates.reduce((sum: number, r: any) => sum + r.baseRate, 0) / historicalRates.length
        : 5000;

      const weekendMultiplier = isWeekend ? 1.15 : 1;
      const surgeMultiplier = 1 + Math.random() * 0.2;
      const predictedRate = Math.round(baseRate * weekendMultiplier * surgeMultiplier);

      forecast.push({
        date: date.toISOString().split("T")[0],
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek],
        predictedRate,
        confidence: Math.max(60, 95 - i * 1),
        isWeekend,
        recommendation: i < 3 ? "book_now" : i < 7 ? "good_rate" : "monitor",
      });
    }

    const cheapestDay = forecast.reduce((min: (typeof forecast)[number], day: (typeof forecast)[number]) =>
      day.predictedRate < min.predictedRate ? day : min
    , forecast[0]);

    const cheapestHistorical = historicalRates.length > 0
      ? historicalRates.reduce((min: any, r: any) => r.baseRate < min.baseRate ? r : min, historicalRates[0])
      : null;

    return NextResponse.json({
      origin,
      destination,
      month: `${year}-${String(month).padStart(2, "0")}`,
      historical: historicalRates,
      forecast,
      recommendation: {
        bestDay: cheapestDay.date,
        bestRate: cheapestDay.predictedRate,
        confidence: cheapestDay.confidence,
        tip: `Book for ${cheapestDay.dayOfWeek} (${cheapestDay.date}) for the best rate of ₦${cheapestDay.predictedRate.toLocaleString()}`,
      },
      cheapestHistorical: cheapestHistorical ? {
        date: cheapestHistorical.date,
        rate: cheapestHistorical.baseRate,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch rate calendar" },
      { status: 500 }
    );
  }
}
