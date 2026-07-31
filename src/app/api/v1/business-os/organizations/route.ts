import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { createOrganization, getUserOrganizations } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  try {
    const orgs = await getUserOrganizations(user!.id);
    return successResponse(orgs);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  try {
    const org = await createOrganization(user!.id, body);
    return successResponse(org, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
