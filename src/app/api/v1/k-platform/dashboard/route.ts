import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { getPlatformDashboard } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  const data = await getPlatformDashboard(orgId, user!.id);
  return successResponse(data);
}
