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

    const workflow = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepOrder: "asc" } },
        business: true,
      },
    });

    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    return successResponse(workflow);
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

    const existing = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!existing) return errorResponse("Workflow not found", 404);
    if (existing.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const body = await request.json();
    const { name, description, triggerType, triggerConfig, isActive, metadata } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (triggerType !== undefined) updateData.triggerType = triggerType;
    if (triggerConfig !== undefined) updateData.triggerConfig = triggerConfig;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (metadata !== undefined) updateData.metadata = metadata;

    const workflow = await prisma.kaiWorkflow.update({
      where: { id },
      data: updateData,
      include: { steps: { orderBy: { stepOrder: "asc" } } },
    });

    return successResponse(workflow);
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

    const existing = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!existing) return errorResponse("Workflow not found", 404);
    if (existing.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    await prisma.kaiWorkflow.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
