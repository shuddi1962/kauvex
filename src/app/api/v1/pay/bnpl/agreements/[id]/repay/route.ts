import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { earlyRepayAgreement } from "@/lib/pay/bnpl";
import { z } from "zod";

export const dynamic = "force-dynamic";

const repaySchema = z.object({
  option: z.enum(["next_installment", "full_balance"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, repaySchema);
  if (valErr) return valErr;

  try {
    const result = await earlyRepayAgreement(params.id, body!.option);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
