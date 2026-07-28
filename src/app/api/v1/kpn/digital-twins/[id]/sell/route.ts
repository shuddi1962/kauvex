import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { sellDigitalTwin, getDigitalTwin } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const sellSchema = z.object({
  askingPrice: z.number().min(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, sellSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const twin = await getDigitalTwin(id);
    if (!twin) return errorResponse("Digital twin not found", 404);
    if (twin.ownerId !== user!.id) return errorResponse("Unauthorized", 403);

    const result = await sellDigitalTwin(id, body!.askingPrice);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
