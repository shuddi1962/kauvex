import { NextResponse } from 'next/server'
import { recalculateAllBuyBoxes } from '@/lib/buybox'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Invalid CRON_SECRET' },
        { status: 403 }
      )
    }

    const result = await recalculateAllBuyBoxes()

    return NextResponse.json({
      success: true,
      message: `Buy box calculation complete. ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors out of ${result.total} products.`,
      ...result,
    })
  } catch (error) {
    console.error('Buy box CRON failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
