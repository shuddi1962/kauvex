import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { rotateApiKey } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const existing = await prisma.kpApiKey.findFirst({ where: { id: params.id, userId: user!.id } });
  if (!existing) return errorResponse("API key not found", 404);

  if (body.action === "revoke") {
    const key = await prisma.kpApiKey.update({ where: { id: params.id }, data: { revoked: true } });
    return successResponse(key);
  }
  if (body.action === "rotate") {
    const key = await rotateApiKey(user!.id, params.id);
    return successResponse(key);
  }
  const key = await prisma.kpApiKey.update({ where: { id: params.id }, data: { name: body.name ?? existing.name } });
  return successResponse(key);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const existing = await prisma.kpApiKey.findFirst({ where: { id: params.id, userId: user!.id } });
  if (!existing) return errorResponse("API key not found", 404);
  await prisma.kpApiKey.delete({ where: { id: params.id } });
  return successResponse({ deleted: true });
}
