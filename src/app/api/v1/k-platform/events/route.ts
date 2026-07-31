import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const params = new URL(req.url).searchParams;
  const orgId = await resolveOrg(user!.id, params.get("org_id"));
  const eventType = params.get("event_type");
  const status = params.get("status");
  const events = await prisma.kpEvent.findMany({
    where: {
      ...(orgId ? { orgId } : {}),
      ...(eventType ? { eventType } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const counts = {
    total: await prisma.kpEvent.count(orgId ? { where: { orgId } } : {}),
    delivered: events.filter((e) => e.status === "delivered").length,
    failed: events.filter((e) => e.status === "failed").length,
  };
  return successResponse({ events, counts });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.eventType) return errorResponse("eventType is required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  const { emitEvent } = await import("@/lib/k-platform");
  const event = await emitEvent(orgId, body.eventType, body.payload ?? {}, body.source ?? "manual");
  return successResponse(event, 201);
}
