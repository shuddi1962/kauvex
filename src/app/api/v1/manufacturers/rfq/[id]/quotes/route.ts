import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getQuotesForInquiry } from "@/lib/manufacturers/inquiries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const quotes = await getQuotesForInquiry(id);
    return successResponse(quotes);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
