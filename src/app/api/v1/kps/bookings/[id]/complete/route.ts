import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { completeBooking } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const completeSchema = z.object({
  customerSignatureUrl: z.string().url().optional(),
  completionReportUrl: z.string().url().optional(),
  installationCertificateUrl: z.string().url().optional(),
  completionTime: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, completeSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const booking = await completeBooking(id, {
      ...body!,
      completionTime: body!.completionTime ? new Date(body!.completionTime) : undefined,
    });
    return successResponse(booking);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
