import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getBusinessDashboard, runAutomationRules, resolveOrg } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization. Create an organization first.", 404);
  try {
    const dashboard = await getBusinessDashboard(orgId);
    return successResponse(dashboard);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const triggered = await runAutomationRules(orgId, user!.id);
    return successResponse({ triggered });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
