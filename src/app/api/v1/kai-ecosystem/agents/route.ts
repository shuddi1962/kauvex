import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { installAgent, uninstallAgent } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));

  const agents = await prisma.kaiEcoAgent.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  let installed: Record<string, boolean> = {};
  if (orgId) {
    const installs = await prisma.kaiEcoInstall.findMany({ where: { orgId, isActive: true }, select: { agentCode: true } });
    installed = Object.fromEntries(installs.map((i) => [i.agentCode, true]));
  }
  return successResponse({ agents, installed, orgId });
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
      ? await uninstallAgent(orgId, body.agentCode, user!.id)
      : await installAgent(orgId, body.agentCode, user!.id);
    return successResponse(result, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
