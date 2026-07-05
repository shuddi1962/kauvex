import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dailyCheckIn, getCheckInStatus } from '@/lib/gamification/daily-checkin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = await getCheckInStatus(user.id)
  return NextResponse.json(status)
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await dailyCheckIn(user.id)
  return NextResponse.json(result)
}
