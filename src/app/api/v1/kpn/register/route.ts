import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { registerProfessional } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  accountType: z.enum(["individual", "company"]),
  companyName: z.string().max(200).optional(),
  cacNumber: z.string().max(50).optional(),
  primaryCategory: z.string().min(1).max(100),
  secondaryCategories: z.array(z.string().max(100)).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  coverageArea: z.any().optional(),
  hourlyRate: z.number().min(0).optional(),
  currencyCode: z.string().max(10).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  address: z.any().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, registerSchema);
  if (valErr) return valErr;

  try {
    const existing = await import("@/lib/kpn").then(m => m.getProfessional(user!.id));
    if (existing) return errorResponse("You are already registered as a professional", 409);

    const professional = await registerProfessional({
      ...body!,
      userId: user!.id,
    });
    return successResponse(professional, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
