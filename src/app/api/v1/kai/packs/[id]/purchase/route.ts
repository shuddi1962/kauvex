import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) {
      return errorResponse("Business not found. Create a business first.", 404);
    }

    const pack = await prisma.kaiIndustryPack.findUnique({
      where: { id },
    });
    if (!pack || !pack.isActive) {
      return errorResponse("Pack not found or inactive", 404);
    }

    const skillIds = pack.skills as string[];
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return errorResponse("This pack has no skills to install", 400);
    }

    const agents = await prisma.kaiAgent.findMany({
      where: { businessId: business.id, isActive: true },
      select: { id: true },
    });

    if (agents.length === 0) {
      return errorResponse("No AI agents found. Create an agent first.", 400);
    }

    let installedCount = 0;

    for (const skillId of skillIds) {
      for (const agent of agents) {
        const existing = await prisma.kaiSkillInstall.findUnique({
          where: { skillId_agentId: { skillId, agentId: agent.id } },
        });

        if (!existing) {
          await prisma.kaiSkillInstall.create({
            data: {
              skillId,
              agentId: agent.id,
              businessId: business.id,
              isActive: true,
            },
          });
          await prisma.kaiSkill.update({
            where: { id: skillId },
            data: { installCount: { increment: 1 } },
          });
          installedCount++;
        }
      }
    }

    return successResponse({
      packId: id,
      packName: pack.name,
      skillsInstalled: installedCount,
      totalSkills: skillIds.length,
      agents: agents.length,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}