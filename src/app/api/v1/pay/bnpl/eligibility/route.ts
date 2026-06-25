import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { checkBnplEligibility, getCustomerEligibility } from "@/lib/pay/credit-score";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const eligibility = await getCustomerEligibility(user!.id);
    return successResponse(eligibility);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const url = new URL(request.url);
  const orderAmount = parseFloat(url.searchParams.get("amount") || "0");
  if (!orderAmount || orderAmount <= 0) return errorResponse("Invalid order amount", 400);

  try {
    const result = await checkBnplEligibility(user!.id, orderAmount);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
