import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createCampaign, sendCampaignToSegment, getSegmentCustomers } from '@/lib/marketing/notification-engine'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaigns = await prisma.marketingCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ campaigns })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  if (action === 'create') {
    const campaign = await createCampaign({
      ...body.data,
      createdBy: user.id,
    })
    return NextResponse.json({ campaign })
  }

  if (action === 'send') {
    const { campaignId, targetSegment, customerIds } = body
    const segment = customerIds || (targetSegment ? await getSegmentCustomers(targetSegment) : [])
    const sent = await sendCampaignToSegment(campaignId, segment)
    return NextResponse.json({ sent })
  }

  if (action === 'update') {
    const updated = await prisma.marketingCampaign.update({
      where: { id: body.campaignId },
      data: body.data,
    })
    return NextResponse.json({ campaign: updated })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
