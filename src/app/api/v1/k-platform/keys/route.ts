import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { createApiKey } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = new URL(req.url).searchParams.get("org_id");
  const keys = await prisma.kpApiKey.findMany({
    where: { userId: user!.id, ...(orgId ? { orgId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return successResponse({ keys });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.name) return errorResponse("Name is required", 400);

  const orgId = body.orgId ?? (await resolveOrg(user!.id, null));
  const key = await createApiKey(user!.id, orgId, body.name, body.scopes ?? [], body.expiresAt ? new Date(body.expiresAt) : undefined);
  return successResponse(key, 201);
}
