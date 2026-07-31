import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getBusinessQuestions } from "@/lib/kai/business-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 50);
  const questions = await getBusinessQuestions(user!.id, Math.min(limit, 200));
  return successResponse({ questions });
}
