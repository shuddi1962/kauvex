import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { verifyCredential } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, verifySchema);
  if (valErr) return valErr;

  try {
    const credential = await verifyCredential(
      (await params).id,
      user!.id,
      body!.status
    );
    return successResponse(credential);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
