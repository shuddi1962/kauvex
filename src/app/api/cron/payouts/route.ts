import { NextResponse } from "next/server"
import { processScheduledPayouts } from "@/lib/payments/payouts"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Invalid CRON_SECRET" },
        { status: 403 }
      )
    }

    const results = await processScheduledPayouts()

    const succeeded = results.filter((r) => r.batchId)
    const failed = results.filter((r) => r.error)

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
      errors: failed.length > 0 ? failed.map((r) => ({ vendorId: r.vendorId, error: r.error })) : undefined,
      results,
    })
  } catch (error) {
    console.error("[Payouts CRON] Failed:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
