import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { aiAnalyzeProject, aiCalculateMaterials } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const analyzeSchema = z.object({
  projectType: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  specs: z.object({
    dimensions: z.string().optional(),
    floors: z.number().int().optional(),
    sqm: z.number().optional(),
    specification: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, analyzeSchema);
  if (valErr) return valErr;

  try {
    const professionals = aiAnalyzeProject(body!.projectType, body!.description);
    const materials = aiCalculateMaterials(body!.projectType, body!.specs || {});

    return successResponse({
      projectType: body!.projectType,
      recommendedProfessionals: professionals,
      estimatedMaterials: materials,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
