import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { testWebhook } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  const webhook = await prisma.kpWebhook.findFirst({ where: { id: params.id, ...(orgId ? { orgId } : {}) } });
  if (!webhook) return errorResponse("Webhook not found", 404);
  return successResponse(webhook);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const orgId = await resolveOrg(user!.id, body.orgId);
  const existing = await prisma.kpWebhook.findFirst({ where: { id: params.id, ...(orgId ? { orgId } : {}) } });
  if (!existing) return errorResponse("Webhook not found", 404);

  const webhook = await prisma.kpWebhook.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.eventTypes !== undefined ? { eventTypes: body.eventTypes } : {}),
      ...(body.url ? { url: body.url } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });
  return successResponse(webhook);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  const existing = await prisma.kpWebhook.findFirst({ where: { id: params.id, ...(orgId ? { orgId } : {}) } });
  if (!existing) return errorResponse("Webhook not found", 404);
  await prisma.kpWebhook.delete({ where: { id: params.id } });
  return successResponse({ deleted: true });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  const webhook = await prisma.kpWebhook.findFirst({ where: { id: params.id, ...(orgId ? { orgId } : {}) } });
  if (!webhook) return errorResponse("Webhook not found", 404);
  const result = await testWebhook(webhook);
  return successResponse(result);
}
