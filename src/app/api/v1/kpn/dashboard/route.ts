import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getProfessionalDashboard } from "@/lib/kpn";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const dashboard = await getProfessionalDashboard(user!.id);
    if (!dashboard) return errorResponse("Professional profile not found", 404);
    return successResponse(dashboard);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
