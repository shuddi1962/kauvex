import { prisma } from '@/lib/prisma'

export interface SendNotificationParams {
  campaignId: string
  customerId: string
  channel: 'push' | 'email' | 'in_app' | 'sms'
  title: string
  body: string
  imageUrl?: string
  deepLink?: string
}

export async function sendNotification(params: SendNotificationParams): Promise<void> {
  await prisma.marketingNotification.create({
    data: {
      campaignId: params.campaignId,
      customerId: params.customerId,
      channel: params.channel,
      title: params.title,
      body: params.body,
      imageUrl: params.imageUrl,
      deepLink: params.deepLink,
      status: 'sent',
      sentAt: new Date(),
    },
  })
}

export async function createCampaign(data: {
  name: string
  description?: string
  channel: string
  trigger?: string
  triggerEvent?: string
  targetSegment?: string
  title: string
  body: string
  imageUrl?: string
  deepLink?: string
  pointsReward?: number
  scheduledAt?: string
  createdBy?: string
}) {
  const campaign = await prisma.marketingCampaign.create({
    data: {
      name: data.name,
      description: data.description,
      channel: data.channel,
      trigger: data.trigger ?? 'manual',
      triggerEvent: data.triggerEvent,
      targetSegment: data.targetSegment,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      deepLink: data.deepLink,
      pointsReward: data.pointsReward ?? 0,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: data.scheduledAt ? 'scheduled' : 'draft',
      createdBy: data.createdBy,
    },
  })

  return campaign
}

export async function sendCampaignToSegment(campaignId: string, customerIds: string[]): Promise<number> {
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw new Error('Campaign not found')

  let sent = 0
  for (const customerId of customerIds) {
    try {
      await sendNotification({
        campaignId,
        customerId,
        channel: campaign.channel as 'push' | 'email' | 'in_app' | 'sms',
        title: campaign.title,
        body: campaign.body,
        imageUrl: campaign.imageUrl ?? undefined,
        deepLink: campaign.deepLink ?? undefined,
      })
      sent++
    } catch {
      await prisma.marketingNotification.create({
        data: {
          campaignId,
          customerId,
          channel: campaign.channel as 'push' | 'email' | 'in_app' | 'sms',
          title: campaign.title,
          body: campaign.body,
          status: 'failed',
          errorMsg: 'Failed to send',
        },
      })
    }
  }

  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: { sentCount: { increment: sent }, status: 'sent', sentAt: new Date() },
  })

  return sent
}

export async function getSegmentCustomers(segment: string): Promise<string[]> {
  switch (segment) {
    case 'all': {
      const profiles = await prisma.profile.findMany({ where: { role: 'customer' }, select: { id: true } })
      return profiles.map(p => p.id)
    }
    case 'active': {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      const active = await prisma.dailyCheckIn.findMany({
        where: { checkInDate: { gte: thirtyDaysAgo } },
        select: { customerId: true },
        distinct: ['customerId'],
      })
      return active.map(a => a.customerId)
    }
    case 'lapsed': {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000)
      const lapsed = await prisma.dailyCheckIn.findMany({
        where: { checkInDate: { lt: sixtyDaysAgo } },
        select: { customerId: true },
        distinct: ['customerId'],
      })
      return lapsed.map(l => l.customerId)
    }
    case 'high_value': {
      const highValue = await prisma.profile.findMany({
        where: { loyaltyTier: { in: ['gold', 'platinum', 'diamond'] } },
        select: { id: true },
      })
      return highValue.map(h => h.id)
    }
    case 'new': {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      const newUsers = await prisma.profile.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { id: true },
      })
      return newUsers.map(n => n.id)
    }
    default:
      return []
  }
}

export async function getMarketingDashboard() {
  const [campaigns, totalSent, totalOpened, totalClicked] = await Promise.all([
    prisma.marketingCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.marketingNotification.aggregate({ _count: true, where: { status: 'sent' } }),
    prisma.marketingNotification.aggregate({ _count: true, where: { status: { in: ['read', 'clicked', 'converted'] } } }),
    prisma.marketingNotification.aggregate({ _count: true, where: { status: { in: ['clicked', 'converted'] } } }),
  ])

  return {
    campaigns,
    stats: {
      totalCampaigns: campaigns.length,
      totalSent: totalSent._count,
      totalOpened: totalOpened._count,
      totalClicked: totalClicked._count,
    },
  }
}
