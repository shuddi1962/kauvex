import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getInsuranceQuotes } from "@/lib/kpn";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get("assetType");
    const value = parseFloat(searchParams.get("value") || "0");

    if (!assetType) return errorResponse("assetType is required", 400);
    if (value <= 0) return errorResponse("value is required and must be positive", 400);

    const quotes = getInsuranceQuotes(assetType, value);
    return successResponse(quotes);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
