import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { getKaiDashboard } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const data = await getKaiDashboard(orgId);
  return successResponse({ ...data, orgId });
}
