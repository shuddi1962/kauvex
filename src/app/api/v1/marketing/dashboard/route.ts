import { NextResponse } from 'next/server'
import { getMarketingDashboard } from '@/lib/marketing/notification-engine'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dashboard = await getMarketingDashboard()
  return NextResponse.json(dashboard)
}
