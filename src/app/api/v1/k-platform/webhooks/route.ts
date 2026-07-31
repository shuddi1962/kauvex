import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { createWebhook } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return successResponse({ webhooks: [] });
  const webhooks = await prisma.kpWebhook.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  return successResponse({ webhooks });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.name || !body.url) return errorResponse("Name and URL are required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

  const webhook = await createWebhook(orgId, {
    name: body.name,
    eventTypes: body.eventTypes ?? ["*"],
    url: body.url,
    createdBy: user!.id,
  });
  return successResponse(webhook, 201);
}
