import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { assignProfessional } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const assignSchema = z.object({
  professionalId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, assignSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const booking = await assignProfessional(id, body!.professionalId);
    return successResponse(booking);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
