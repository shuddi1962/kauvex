import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getProfessionalById } from "@/lib/kpn";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const professional = await getProfessionalById(id);
    if (!professional) return errorResponse("Professional not found", 404);
    return successResponse(professional);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
