import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getDeveloperEarnings } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const developerId = new URL(req.url).searchParams.get("developer_id") ?? user!.id;
  const data = await getDeveloperEarnings(developerId);
  return successResponse(data);
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (body.action === "mark-paid" && body.id) {
    const { prisma } = await import("@/lib/prisma");
    const earning = await prisma.kpEarning.findFirst({ where: { id: body.id, developerId: user!.id } });
    if (!earning) return errorResponse("Earning not found", 404);
    const updated = await prisma.kpEarning.update({ where: { id: body.id }, data: { status: "paid" } });
    return successResponse(updated);
  }
  return errorResponse("Unsupported action", 400);
}
