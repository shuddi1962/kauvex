import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const install = await prisma.kaiSkillInstall.findUnique({
      where: { id },
      include: { skill: true, business: true },
    });

    if (!install) {
      return errorResponse("Install not found", 404);
    }

    if (install.business.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.kaiSkillInstall.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.kaiSkill.update({
      where: { id: install.skillId },
      data: { installCount: { decrement: 1 } },
    });

    return successResponse({ uninstalled: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
