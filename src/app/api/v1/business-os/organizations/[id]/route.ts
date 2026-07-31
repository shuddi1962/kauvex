import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { ensureOrgAccess } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const membership = await ensureOrgAccess(params.id, user!.id);
  if (!membership) return errorResponse("Unauthorized", 403);
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  try {
    const { id: _id, createdAt: _c, ...update } = body;
    const org = await prisma.bosOrganization.update({ where: { id: params.id }, data: update });
    return successResponse(org);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
