import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { spin, getSpinStatus } from '@/lib/gamification/spin-wheel'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = await getSpinStatus(user.id)
  return NextResponse.json(status)
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await spin(user.id)
  return NextResponse.json(result)
}
