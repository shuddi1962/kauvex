import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { processVendorBillingCycle, processAllBillingCycles, creditOrderEarnings } from "@/lib/billing/billing-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
  if (!isAdmin) return errorResponse("Admin access required", 403);

  try {
    const body = await request.json().catch(() => ({}));
    const { vendorId, orderId } = body;

    if (orderId) {
      const result = await creditOrderEarnings(orderId);
      return successResponse(result as unknown as Record<string, unknown>);
    }

    if (vendorId) {
      const result = await processVendorBillingCycle(vendorId);
      return successResponse(result as unknown as Record<string, unknown>);
    }

    const result = await processAllBillingCycles();
    return successResponse({
      totalVendors: result.total,
      succeeded: result.succeeded,
      failed: result.failed,
      results: result.results,
    } as unknown as Record<string, unknown>);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
