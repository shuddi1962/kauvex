import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { createOauthApp } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const developerId = new URL(req.url).searchParams.get("developer_id") ?? user!.id;
  const apps = await prisma.kpOauthApp.findMany({ where: { developerId }, orderBy: { createdAt: "desc" } });
  return successResponse({ apps });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.name) return errorResponse("Name is required", 400);

  const app = await createOauthApp(user!.id, {
    name: body.name,
    description: body.description,
    redirectUris: body.redirectUris ?? [],
    scopes: body.scopes ?? [],
  });
  return successResponse(app, 201);
}
