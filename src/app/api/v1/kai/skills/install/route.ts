import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return errorResponse("Business not found. Create a business first.", 404);
    }

    const body = await request.json();
    const { skillId, agentId } = body;

    if (!skillId || !agentId) {
      return errorResponse("skillId and agentId are required", 400);
    }

    const skill = await prisma.kaiSkill.findUnique({ where: { id: skillId } });
    if (!skill) {
      return errorResponse("Skill not found", 404);
    }
    if (!skill.isActive) {
      return errorResponse("Skill is not active", 400);
    }

    const agent = await prisma.kaiAgent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return errorResponse("Agent not found", 404);
    }
    if (agent.businessId !== business.id) {
      return errorResponse("Agent does not belong to your business", 403);
    }

    const install = await prisma.kaiSkillInstall.upsert({
      where: { skillId_agentId: { skillId, agentId } },
      update: { isActive: true },
      create: {
        skillId,
        agentId,
        businessId: business.id,
      },
    });

    await prisma.kaiSkill.update({
      where: { id: skillId },
      data: { installCount: { increment: 1 } },
    });

    return successResponse(install, install.isActive ? 200 : 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
