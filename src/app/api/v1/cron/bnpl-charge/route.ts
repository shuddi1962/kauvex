import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { processBnplAutoCharge, sendBnplReminders } from "@/lib/pay/bnpl";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const [chargeResult, reminderCount] = await Promise.all([
      processBnplAutoCharge(),
      sendBnplReminders(),
    ]);

    return successResponse({
      bnplCharge: chargeResult,
      remindersSent: reminderCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
