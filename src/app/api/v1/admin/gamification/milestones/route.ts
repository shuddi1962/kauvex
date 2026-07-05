import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const milestones = await prisma.referralMilestone.findMany({
    orderBy: { referralsRequired: 'asc' },
  })
  return NextResponse.json({ milestones })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'save') {
    const milestone = await prisma.referralMilestone.upsert({
      where: { id: body.id || 'new' },
      update: {
        referralsRequired: body.referralsRequired,
        label: body.label,
        rewardType: body.rewardType,
        rewardValue: body.rewardValue,
        rewardLabel: body.rewardLabel,
        isActive: body.isActive ?? true,
      },
      create: {
        referralsRequired: body.referralsRequired,
        label: body.label,
        rewardType: body.rewardType,
        rewardValue: body.rewardValue,
        rewardLabel: body.rewardLabel,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ milestone })
  }

  if (action === 'toggle') {
    const milestone = await prisma.referralMilestone.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json({ milestone })
  }

  if (action === 'delete') {
    await prisma.referralMilestone.delete({ where: { id: body.id } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
