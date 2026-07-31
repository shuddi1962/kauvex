import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { orchestrate } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const request = String(body.request || "").trim();
  if (!request) return errorResponse("Request is required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

  try {
    const run = await orchestrate(user!.id, orgId, request);
    return successResponse(run, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const runs = await prisma.kaiEcoRun.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 30 });
  return successResponse({ rows: runs, orgId });
}
