import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { recordDailyFloat } from "@/lib/pay/float";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const snapshot = await recordDailyFloat();
    return successResponse({
      float: snapshot,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
