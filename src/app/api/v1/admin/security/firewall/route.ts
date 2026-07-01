import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { getFirewallStats, getBlockedRequests } from "@/lib/security/firewall";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "100"), 500);

    const [stats, recentBlocked] = await Promise.all([
      getFirewallStats(),
      getBlockedRequests(limit),
    ]);

    return successResponse({
      stats,
      recentBlocked,
      requestedBy: user!.id,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
