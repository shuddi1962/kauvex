import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { completeMaintenance } from "@/lib/kpn";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const result = await completeMaintenance(id);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
