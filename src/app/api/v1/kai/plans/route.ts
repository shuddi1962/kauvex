import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const plans = await prisma.kaiPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(plans);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
