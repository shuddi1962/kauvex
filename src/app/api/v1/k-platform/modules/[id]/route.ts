import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { emitEvent } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const module = await prisma.kpModule.findUnique({
    where: { id: params.id },
    include: { reviews: { take: 20, orderBy: { createdAt: "desc" } } },
  });
  if (!module) return errorResponse("Module not found", 404);
  return successResponse(module);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const existing = await prisma.kpModule.findUnique({ where: { id: params.id } });
  if (!existing) return errorResponse("Module not found", 404);
  if (existing.developerId && existing.developerId !== user!.id) return errorResponse("Not the module developer", 403);

  const { name, version, description, status, priceMonthly, icon, color, settings, permissions, dependencies, apiEndpoints, uiComponents, aiCapabilities } = body;
  const module = await prisma.kpModule.update({
    where: { id: params.id },
    data: {
      ...(name ? { name } : {}),
      ...(version ? { version } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status ? { status } : {}),
      ...(priceMonthly !== undefined ? { priceMonthly } : {}),
      ...(icon ? { icon } : {}),
      ...(color ? { color } : {}),
      ...(settings !== undefined ? { settings } : {}),
      ...(permissions !== undefined ? { permissions } : {}),
      ...(dependencies !== undefined ? { dependencies } : {}),
      ...(apiEndpoints !== undefined ? { apiEndpoints } : {}),
      ...(uiComponents !== undefined ? { uiComponents } : {}),
      ...(aiCapabilities !== undefined ? { aiCapabilities } : {}),
    },
  });
  return successResponse(module);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const existing = await prisma.kpModule.findUnique({ where: { id: params.id } });
  if (!existing) return errorResponse("Module not found", 404);
  if (existing.developerId && existing.developerId !== user!.id) return errorResponse("Not the module developer", 403);
  await prisma.kpModule.delete({ where: { id: params.id } });
  await emitEvent(null, "module.deleted", { moduleId: params.id, slug: existing.slug }, "k-platform");
  return successResponse({ deleted: true });
}
