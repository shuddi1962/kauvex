import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAchievements, getUnlockedCount } from '@/lib/gamification/achievements'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [achievements, unlockedCount] = await Promise.all([
    getAchievements(user.id),
    getUnlockedCount(user.id),
  ])

  return NextResponse.json({ achievements, unlockedCount, totalCount: achievements.length })
}
