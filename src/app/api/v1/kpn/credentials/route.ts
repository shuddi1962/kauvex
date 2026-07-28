import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getCredentials, addCredential, getProfessional } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addCredentialSchema = z.object({
  credentialType: z.string().min(1).max(100),
  issuingBody: z.string().max(200).optional(),
  certificateNumber: z.string().max(100).optional(),
  documentUrl: z.string().url().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const professional = await getProfessional(user!.id);
    if (!professional) return errorResponse("Professional profile not found", 404);

    const credentials = await getCredentials(professional.id);
    return successResponse(credentials);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, addCredentialSchema);
  if (valErr) return valErr;

  try {
    const professional = await getProfessional(user!.id);
    if (!professional) return errorResponse("Professional profile not found", 404);

    const credential = await addCredential({
      ...body!,
      professionalId: professional.id,
    });
    return successResponse(credential, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
