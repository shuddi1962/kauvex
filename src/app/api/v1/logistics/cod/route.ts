import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pending = await (prisma as any).glxCodCollection.findMany({
      where: { status: "collected" },
      orderBy: { collectedAt: "asc" },
    });
    return NextResponse.json({ data: { pendingRemittances: pending } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch COD data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, amount, currencyCode, partnerId, orderId } = body;
    const collection = await (prisma as any).glxCodCollection.create({
      data: {
        jobId,
        partnerId: partnerId || null,
        orderId: orderId || null,
        amount,
        currencyCode,
        status: "pending",
      },
    });
    return NextResponse.json({ data: collection });
  } catch {
    return NextResponse.json({ error: "Failed to create COD collection" }, { status: 500 });
  }
}
