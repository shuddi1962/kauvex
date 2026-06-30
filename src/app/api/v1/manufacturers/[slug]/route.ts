import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getManufacturerBySlug } from "@/lib/manufacturers/registration";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const manufacturer = await getManufacturerBySlug(slug);
    if (!manufacturer) return errorResponse("Manufacturer not found", 404);
    return successResponse(manufacturer);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
