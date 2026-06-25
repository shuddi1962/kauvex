import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getAgreementWithPayments } from "@/lib/pay/bnpl";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const result = await getAgreementWithPayments(params.id);
    if (!result) return errorResponse("Agreement not found", 404);
    if (result.agreement.customerId !== user!.id) return errorResponse("Access denied", 403);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
