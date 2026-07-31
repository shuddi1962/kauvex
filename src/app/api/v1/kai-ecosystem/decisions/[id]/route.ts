import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { decideDecision } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const decision = ["approved", "rejected", "dismissed"].includes(body.decision) ? body.decision : "dismissed";
  try {
    const updated = await decideDecision(params.id, user!.id, decision);
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
