import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { installModule, uninstallModule, getModulesCatalog } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  return successResponse(await getModulesCatalog(orgId));
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

  try {
    const result = body.action === "uninstall"
      ? await uninstallModule(orgId, body.moduleId)
      : await installModule(orgId, body.moduleId, user!.id, body.config);
    return successResponse(result, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
