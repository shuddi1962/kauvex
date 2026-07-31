import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { answerBusinessQuestion } from "@/lib/kai/business-intelligence";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.question) return errorResponse("question is required", 400);

  try {
    const result = await answerBusinessQuestion(user!.id, body.question, body.orgId);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
