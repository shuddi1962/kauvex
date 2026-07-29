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
      include: { business: true },
    });

    if (!agent) return errorResponse("Agent not found", 404);
    if (agent.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const permissions = await prisma.kaiAgentPermission.findMany({
      where: { agentId: id },
    });

    return successResponse(permissions);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const agent = await prisma.kaiAgent.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!agent) {
      return errorResponse("Agent not found", 404);
    }

    if (agent.business.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await request.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return errorResponse("permissions must be an array", 400);
    }

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

    const updated = await prisma.kaiAgentPermission.findMany({
      where: { agentId: id },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
