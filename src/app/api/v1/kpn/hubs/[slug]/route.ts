import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getIndustryHub } from "@/lib/kpn";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hub = await getIndustryHub(slug);
    if (!hub) return errorResponse("Hub not found", 404);
    return successResponse(hub);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
