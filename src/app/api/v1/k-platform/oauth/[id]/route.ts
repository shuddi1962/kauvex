import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const existing = await prisma.kpOauthApp.findFirst({ where: { id: params.id, developerId: user!.id } });
  if (!existing) return errorResponse("OAuth app not found", 404);

  const app = await prisma.kpOauthApp.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.redirectUris !== undefined ? { redirectUris: body.redirectUris } : {}),
      ...(body.scopes !== undefined ? { scopes: body.scopes } : {}),
      ...(body.status ? { status: body.status } : {}),
    },
  });
  return successResponse(app);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const existing = await prisma.kpOauthApp.findFirst({ where: { id: params.id, developerId: user!.id } });
  if (!existing) return errorResponse("OAuth app not found", 404);
  await prisma.kpOauthApp.delete({ where: { id: params.id } });
  return successResponse({ deleted: true });
}
