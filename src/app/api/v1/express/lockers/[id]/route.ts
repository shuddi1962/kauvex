import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const locker = await (prisma as any).ksp_lockers.findUnique({
      where: { id },
      include: {
        ksp_locker_compartments: {
          orderBy: { size: "asc" },
        },
      },
    });

    if (!locker) {
      return NextResponse.json(
        { error: "Locker not found" },
        { status: 404 }
      );
    }

    const totalCompartments = locker.ksp_locker_compartments.length;
    const availableCompartments = locker.ksp_locker_compartments.filter(
      (c: any) => c.status === "available"
    ).length;

    return NextResponse.json({
      locker: {
        ...locker,
        summary: {
          totalCompartments,
          availableCompartments,
          utilization: totalCompartments > 0
            ? ((totalCompartments - availableCompartments) / totalCompartments * 100).toFixed(1)
            : "0",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch locker" },
      { status: 500 }
    );
  }
}
