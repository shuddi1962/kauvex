import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.vendorPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
