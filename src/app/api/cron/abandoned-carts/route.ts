export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { checkAbandonedCarts } from '@/lib/cart-recovery'

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

    const result = await checkAbandonedCarts()

    return NextResponse.json({
      success: true,
      emailsSent: result.emailsSent,
      total: Object.values(result.emailsSent).reduce((a, b) => a + b, 0),
    })
  } catch (error) {
    console.error('[AbandonedCarts CRON] Failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
