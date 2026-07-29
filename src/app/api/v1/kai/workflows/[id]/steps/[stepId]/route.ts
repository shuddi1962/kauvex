import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id, stepId } = await params;

    const workflow = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const existing = await prisma.kaiWorkflowStep.findUnique({
      where: { id: stepId },
    });
    if (!existing || existing.workflowId !== id) {
      return errorResponse("Step not found", 404);
    }

    const body = await request.json();
    const { stepOrder, stepType, stepConfig, nextOnSuccess, nextOnFailure } = body;

    if (stepOrder !== undefined && stepOrder !== existing.stepOrder) {
      const conflict = await prisma.kaiWorkflowStep.findFirst({
        where: { workflowId: id, stepOrder, id: { not: stepId } },
      });
      if (conflict) {
        return errorResponse(`A step with order ${stepOrder} already exists`, 409);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (stepOrder !== undefined) updateData.stepOrder = stepOrder;
    if (stepType !== undefined) updateData.stepType = stepType;
    if (stepConfig !== undefined) updateData.stepConfig = stepConfig;
    if (nextOnSuccess !== undefined) updateData.nextOnSuccess = nextOnSuccess;
    if (nextOnFailure !== undefined) updateData.nextOnFailure = nextOnFailure;

    const step = await prisma.kaiWorkflowStep.update({
      where: { id: stepId },
      data: updateData,
    });

    return successResponse(step);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id, stepId } = await params;

    const workflow = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const existing = await prisma.kaiWorkflowStep.findUnique({
      where: { id: stepId },
    });
    if (!existing || existing.workflowId !== id) {
      return errorResponse("Step not found", 404);
    }

    const deletedOrder = existing.stepOrder;

    await prisma.kaiWorkflowStep.delete({ where: { id: stepId } });

    await prisma.kaiWorkflowStep.updateMany({
      where: { workflowId: id, stepOrder: { gt: deletedOrder } },
      data: { stepOrder: { decrement: 1 } },
    });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
