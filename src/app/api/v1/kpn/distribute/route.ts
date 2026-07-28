import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { distributeJob } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const distributeSchema = z.object({
  bookingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, distributeSchema);
  if (valErr) return valErr;

  try {
    const matches = await distributeJob(body!.bookingId);
    return successResponse(matches);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
