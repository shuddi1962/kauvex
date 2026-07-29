import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
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
        business: true,
        steps: { where: { workflowId: id } },
      },
    });

    if (!workflow) return errorResponse("Workflow not found", 404);
    if (workflow.business.userId !== user!.id) return errorResponse("Unauthorized", 403);

    return successResponse({
      executed: true,
      workflowId: workflow.id,
      workflowName: workflow.name,
      triggerType: workflow.triggerType,
      stepsCount: workflow.steps.length,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
