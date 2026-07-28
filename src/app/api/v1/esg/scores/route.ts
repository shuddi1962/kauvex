import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats, getLeaderboard } from "@/lib/esg/scores";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "dashboard";

    if (type === "leaderboard") {
      const limit = parseInt(searchParams.get("limit") || "20");
      const leaderboard = await getLeaderboard(limit);
      return NextResponse.json({ leaderboard });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ESG data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calculateSustainabilityScore } = await import("@/lib/esg/scores");
    const result = await calculateSustainabilityScore(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create score" }, { status: 500 });
  }
}