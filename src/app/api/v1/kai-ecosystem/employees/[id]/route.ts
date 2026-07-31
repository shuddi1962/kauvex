import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { setEmployeeStatus } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  try {
    const updated = await setEmployeeStatus(params.id, user!.id, body.status ?? "active");
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
