import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { searchUsedEquipment } from "@/lib/kpn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await searchUsedEquipment({
      assetType: searchParams.get("assetType") || undefined,
      query: searchParams.get("query") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
