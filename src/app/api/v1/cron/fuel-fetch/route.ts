import { NextRequest, NextResponse } from "next/server";
import { fetchAndUpdateFuelPrices } from "@/lib/fuel/data-service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await fetchAndUpdateFuelPrices();

    return NextResponse.json({
      success: true,
      data: {
        updated: result.updated,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
