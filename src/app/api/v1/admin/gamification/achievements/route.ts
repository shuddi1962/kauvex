import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
  })

  const userCounts = await prisma.userAchievement.groupBy({
    by: ['achievementId'],
    where: { unlockedAt: { not: null } },
    _count: true,
  })
  const unlockedMap = new Map(userCounts.map(u => [u.achievementId, u._count]))

  return NextResponse.json({
    achievements: achievements.map(a => ({
      ...a,
      rewardValue: a.pointsReward,
      unlockedCount: unlockedMap.get(a.id) ?? 0,
    })),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'save') {
    const achievement = await prisma.achievement.upsert({
      where: { id: body.id || 'new' },
      update: {
        name: body.name,
        description: body.description,
        category: body.category,
        threshold: body.threshold,
        pointsReward: body.pointsReward,
        badgeColor: body.badgeColor ?? '#FF6B00',
        icon: body.icon ?? 'trophy',
        isHidden: body.isHidden ?? false,
        isActive: body.isActive ?? true,
      },
      create: {
        code: body.code,
        name: body.name,
        description: body.description,
        category: body.category,
        threshold: body.threshold,
        pointsReward: body.pointsReward,
        badgeColor: body.badgeColor ?? '#FF6B00',
        icon: body.icon ?? 'trophy',
        isHidden: body.isHidden ?? false,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ achievement })
  }

  if (action === 'toggle') {
    const achievement = await prisma.achievement.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json({ achievement })
  }

  if (action === 'delete') {
    await prisma.achievement.delete({ where: { id: body.id } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
