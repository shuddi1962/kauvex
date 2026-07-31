import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { deployEmployee } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const rows = await prisma.kaiEcoEmployee.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  const agents = await prisma.kaiEcoAgent.findMany({ where: { isActive: true }, select: { code: true, name: true, icon: true, color: true } });
  return successResponse({ rows, agents, orgId });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.name || !body.role || !body.agentCode) return errorResponse("name, role and agentCode are required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const employee = await deployEmployee(orgId, body, user!.id);
    return successResponse(employee, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
