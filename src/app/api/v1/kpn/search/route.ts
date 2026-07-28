import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-helpers";
import { searchProfessionals } from "@/lib/kpn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await searchProfessionals({
      category: searchParams.get("category") || undefined,
      location: searchParams.get("location") || undefined,
      tier: searchParams.get("tier") || undefined,
      minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
      query: searchParams.get("query") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
