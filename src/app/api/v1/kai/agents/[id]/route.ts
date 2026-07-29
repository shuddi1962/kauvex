import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const agent = await prisma.kaiAgent.findUnique({
      where: { id },
      include: {
        permissions: true,
        business: true,
      },
    });

    if (!agent) {
      return errorResponse("Agent not found", 404);
    }

    if (agent.business.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    return successResponse(agent);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const existing = await prisma.kaiAgent.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existing) {
      return errorResponse("Agent not found", 404);
    }

    if (existing.business.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await request.json();
    const { name, role, avatar, color, description, systemPrompt, knowledgeScope, model, temperature, isActive, permissions } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (knowledgeScope !== undefined) updateData.knowledgeScope = knowledgeScope;
    if (model !== undefined) updateData.model = model;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (permissions !== undefined) {
      await prisma.kaiAgentPermission.deleteMany({
        where: { agentId: id },
      });

      if (permissions.length > 0) {
        await prisma.kaiAgentPermission.createMany({
          data: permissions.map((p: { resourceType: string; canView?: boolean; canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }) => ({
            agentId: id,
            resourceType: p.resourceType,
            canView: p.canView ?? false,
            canCreate: p.canCreate ?? false,
            canEdit: p.canEdit ?? false,
            canDelete: p.canDelete ?? false,
          })),
        });
      }
    }

    const agent = await prisma.kaiAgent.update({
      where: { id },
      data: updateData,
      include: { permissions: true },
    });

    return successResponse(agent);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const existing = await prisma.kaiAgent.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existing) {
      return errorResponse("Agent not found", 404);
    }

    if (existing.business.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.kaiAgent.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
