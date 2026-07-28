import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const ret = await (prisma as any).dispute.findUnique({
      where: { id: params.id },
      include: { order: { select: { orderNumber: true, status: true, createdAt: true } } },
    });

    if (!ret) return errorResponse("Return not found", 404);
    if (ret.customerId !== user!.id) return errorResponse("Access denied", 403);

    const statusHistory = [
      { status: "pending", label: "Return Requested", date: ret.openedAt },
    ];

    if (ret.status !== "pending") {
      statusHistory.push({ status: "approved", label: "Return Approved", date: ret.updatedAt || ret.openedAt });
    }
    if (["resolved", "closed", "completed"].includes(ret.status)) {
      statusHistory.push({ status: "resolved", label: "Return Resolved", date: ret.resolvedAt || ret.updatedAt });
    }

    return successResponse({ ...ret, statusHistory });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const ret = await (prisma as any).dispute.findUnique({
      where: { id: params.id },
    });

    if (!ret) return errorResponse("Return not found", 404);
    if (ret.customerId !== user!.id) return errorResponse("Access denied", 403);
    if (ret.status !== "pending") return errorResponse("Can only cancel a pending return request", 422);

    const updated = await (prisma as any).dispute.update({
      where: { id: params.id },
      data: { status: "cancelled", resolvedAt: new Date().toISOString() },
    });

    return successResponse(updated);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}