import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { saveMemory, recallMemory } from "@/lib/kai-ecosystem";
import { createPatchHandler, createDeleteHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const url = new URL(req.url);
  const orgId = await resolveOrg(user!.id, url.searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const scope = url.searchParams.get("scope") ?? undefined;
  const rows = await recallMemory(orgId, scope);
  return successResponse({ rows, orgId });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.key || !body.value) return errorResponse("key and value are required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const memory = await saveMemory(orgId, body.key, body.value, {
      scope: body.scope,
      pinned: body.pinned,
      source: body.source,
    });
    return successResponse(memory, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export const PATCH = createPatchHandler(prisma.kaiEcoMemory);
export const DELETE = createDeleteHandler(prisma.kaiEcoMemory);
