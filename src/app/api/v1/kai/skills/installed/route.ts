import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return successResponse([]);
    }

    const installs = await prisma.kaiSkillInstall.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      include: {
        skill: true,
        agent: { select: { id: true, name: true, role: true } },
      },
      orderBy: { installedAt: "desc" },
    });

    return successResponse(installs);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}