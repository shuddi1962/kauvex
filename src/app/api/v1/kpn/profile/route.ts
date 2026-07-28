import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getProfessional, updateProfessional } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  companyName: z.string().max(200).optional(),
  cacNumber: z.string().max(50).optional(),
  primaryCategory: z.string().max(100).optional(),
  secondaryCategories: z.array(z.string().max(100)).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  coverageArea: z.any().optional(),
  hourlyRate: z.number().min(0).optional(),
  currencyCode: z.string().max(10).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  address: z.any().optional(),
  isAcceptingJobs: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const professional = await getProfessional(user!.id);
    if (!professional) return errorResponse("Professional profile not found", 404);
    return successResponse(professional);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateProfileSchema);
  if (valErr) return valErr;

  try {
    const professional = await getProfessional(user!.id);
    if (!professional) return errorResponse("Professional profile not found", 404);

    const updated = await updateProfessional(professional.id, body!);
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
