import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-helpers";
import { getCategoryAffinities } from "@/lib/personalization/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authErr } = await getAuthUser(request);
    if (authErr) return authErr;

    const affinities = await getCategoryAffinities(user!.id);

    return NextResponse.json({ data: affinities });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
