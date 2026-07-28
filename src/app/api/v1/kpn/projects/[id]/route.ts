import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getProject, updateProject } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProjectSchema = z.object({
  projectName: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  location: z.any().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return errorResponse("Project not found", 404);
    return successResponse(project);
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

  const { data: body, error: valErr } = await validateBody(request, updateProjectSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return errorResponse("Project not found", 404);
    if (project.customerId !== user!.id) return errorResponse("Unauthorized", 403);

    const updated = await updateProject(id, body!);
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
