import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const [dealsByStage, quotesByStatus, ordersByStatus, invoicesByStatus, salesByMonth] = await Promise.all([
      prisma.bosDeal.groupBy({ by: ["stage"], where: { orgId }, _count: { _all: true }, _sum: { amount: true } }),
      prisma.bosQuotation.groupBy({ by: ["status"], where: { orgId }, _count: { _all: true }, _sum: { total: true } }),
      prisma.bosSalesOrder.groupBy({ by: ["status"], where: { orgId }, _count: { _all: true }, _sum: { total: true } }),
      prisma.bosInvoice.groupBy({ by: ["status", "direction"], where: { orgId }, _count: { _all: true }, _sum: { total: true } }),
      prisma.bosSalesOrder.findMany({ where: { orgId, status: { notIn: ["cancelled"] } }, select: { orderDate: true, total: true }, orderBy: { orderDate: "asc" } }),
    ]);
    return successResponse({ dealsByStage, quotesByStatus, ordersByStatus, invoicesByStatus, salesByMonth });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
