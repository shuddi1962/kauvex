import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getFinancingOptions } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const financingSchema = z.object({
  amount: z.number().min(0),
  termMonths: z.number().int().min(1).max(120),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get("amount") || "0");
    const termMonths = parseInt(searchParams.get("termMonths") || "12");

    if (amount <= 0) return errorResponse("amount is required", 400);

    const options = getFinancingOptions(amount, termMonths);
    return successResponse(options);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
