import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { getFloatSummary, getFloatHistory } from "@/lib/pay/float";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30");

  try {
    const [summary, history] = await Promise.all([
      getFloatSummary(),
      getFloatHistory(days),
    ]);
    return successResponse({ summary, history });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
