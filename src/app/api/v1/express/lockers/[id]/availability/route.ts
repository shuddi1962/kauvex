import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get("size");

    const where: any = { lockerId: id, status: "available" };
    if (size) where.size = size;

    const compartments = await (prisma as any).ksp_locker_compartments.findMany({
      where,
      orderBy: { size: "asc" },
    });

    const summary = {
      small: { total: 0, available: 0 },
      medium: { total: 0, available: 0 },
      large: { total: 0, available: 0 },
      xlarge: { total: 0, available: 0 },
    };

    const allCompartments = await (prisma as any).ksp_locker_compartments.findMany({
      where: { lockerId: id },
    });

    for (const c of allCompartments) {
      const s = c.size || "medium";
      if (summary[s as keyof typeof summary]) {
        summary[s as keyof typeof summary].total++;
        if (c.status === "available") {
          summary[s as keyof typeof summary].available++;
        }
      }
    }

    return NextResponse.json({ compartments, summary });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
