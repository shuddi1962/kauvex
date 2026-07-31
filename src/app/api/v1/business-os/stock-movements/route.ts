import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg, recordStockMovement } from "@/lib/business-os";
import { createListHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosStockMovement, {
  searchFields: ["batchNumber", "notes", "movementType"],
  orderBy: { createdAt: "desc" },
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const orgId = await resolveOrg(user!.id, body.orgId ?? new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const newStock = await recordStockMovement({ ...body, orgId, performedBy: body.performedBy ?? user!.id });
    return successResponse({ newStock }, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
