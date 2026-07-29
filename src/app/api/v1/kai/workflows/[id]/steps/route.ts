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
      include: { business: true },
    });
    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const steps = await prisma.kaiWorkflowStep.findMany({
      where: { workflowId: id },
      orderBy: { stepOrder: "asc" },
    });

    return successResponse(steps);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const workflow = await prisma.kaiWorkflow.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    const body = await request.json();
    const { stepOrder, stepType, stepConfig, nextOnSuccess, nextOnFailure } = body;

    if (stepOrder === undefined || !stepType) {
      return errorResponse("stepOrder and stepType are required", 400);
    }

    const existing = await prisma.kaiWorkflowStep.findFirst({
      where: { workflowId: id, stepOrder },
    });
    if (existing) {
      return errorResponse(`A step with order ${stepOrder} already exists`, 409);
    }

    const step = await prisma.kaiWorkflowStep.create({
      data: {
        workflowId: id,
        stepOrder,
        stepType,
        stepConfig: stepConfig ?? {},
        nextOnSuccess: nextOnSuccess ?? null,
        nextOnFailure: nextOnFailure ?? null,
      },
    });

    return successResponse(step, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
