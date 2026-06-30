import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { listDisputes } from "@/lib/manufacturers/disputes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || undefined;
    const status = searchParams.get("status") || undefined;

    const disputes = await listDisputes(orderId, status);
    return successResponse(disputes);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
