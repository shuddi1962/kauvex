import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { installPack } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  const packs = await prisma.kaiEcoAppPack.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  let installed: Record<string, boolean> = {};
  if (orgId) {
    const installs = await prisma.kaiEcoInstall.findMany({ where: { orgId, isActive: true }, select: { agentCode: true } });
    installed = Object.fromEntries(installs.map((i) => [i.agentCode, true]));
  }
  return successResponse({ packs, installed, orgId });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.slug) return errorResponse("slug is required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const pack = await installPack(orgId, body.slug, user!.id);
    return successResponse(pack, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
