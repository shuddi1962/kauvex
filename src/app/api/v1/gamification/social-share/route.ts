import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordShare, getShareStats } from '@/lib/gamification/social-share'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await getShareStats(user.id)
  return NextResponse.json(stats)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { shareType, platform, referenceId } = body

  if (!shareType || !platform) {
    return NextResponse.json({ error: 'shareType and platform are required' }, { status: 400 })
  }

  const result = await recordShare(user.id, shareType, platform, referenceId)
  return NextResponse.json(result)
}
