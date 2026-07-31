import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg, decideApproval } from "@/lib/business-os";
import { createPatchHandler, createDeleteHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const PATCH = createPatchHandler(prisma.bosApproval);
export const DELETE = createDeleteHandler(prisma.bosApproval);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  try {
    const updated = await decideApproval(params.id, user!.id, body.decision, body.comment);
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
