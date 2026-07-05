import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rewardReviewPoints } from '@/lib/gamification/review-points'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { productId, hasPhoto } = body

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const points = await rewardReviewPoints(user.id, productId, !!hasPhoto)
  return NextResponse.json({ pointsEarned: points, message: `+${points} points for your review!` })
}
