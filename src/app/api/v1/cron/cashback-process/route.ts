import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { processMaturedCashback } from "@/lib/pay/cashback";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const credited = await processMaturedCashback();
    return successResponse({
      cashbackCredited: credited,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
