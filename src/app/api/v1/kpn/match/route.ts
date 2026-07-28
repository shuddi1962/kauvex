import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { matchProfessionals } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const matchSchema = z.object({
  serviceType: z.string().min(1).max(100),
  productId: z.string().optional(),
  location: z.any().optional(),
  scheduledDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, matchSchema);
  if (valErr) return valErr;

  try {
    const professionals = await matchProfessionals(body!);
    return successResponse(professionals);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
