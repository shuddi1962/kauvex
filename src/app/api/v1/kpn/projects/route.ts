import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createProject, getProjects } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createProjectSchema = z.object({
  projectName: z.string().min(1).max(200),
  projectType: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  location: z.any().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const projects = await getProjects(user!.id);
    return successResponse(projects);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createProjectSchema);
  if (valErr) return valErr;

  try {
    const project = await createProject({
      ...body!,
      customerId: user!.id,
    });
    return successResponse(project, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
