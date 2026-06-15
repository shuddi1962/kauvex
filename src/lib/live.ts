import { prisma } from '@/lib/db'

export async function createLiveStream(data: {
  creatorId: string
  vendorId: string
  title: string
  description?: string
  scheduledAt?: Date
  products?: string[]
}) {
  return prisma.liveStream.create({
    data: {
      creatorId: data.creatorId,
      vendorId: data.vendorId,
      title: data.title,
      description: data.description,
      scheduledAt: data.scheduledAt,
      status: data.scheduledAt ? 'scheduled' : 'live',
      startedAt: data.scheduledAt ? undefined : new Date(),
    }
  })
}

export async function getActiveLiveStreams() {
  return prisma.liveStream.findMany({
    where: { status: 'live' },
    include: { products: true },
    orderBy: { startedAt: 'desc' }
  })
}

export async function getUpcomingLiveStreams() {
  return prisma.liveStream.findMany({
    where: { status: 'scheduled', scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: 'asc' }
  })
}

export async function getVendorLiveStreams(vendorId: string) {
  return prisma.liveStream.findMany({
    where: { vendorId },
    include: { products: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getLiveStreamById(id: string) {
  return prisma.liveStream.findUnique({
    where: { id },
    include: { products: true }
  })
}

export async function pinProductToStream(streamId: string, productId: string) {
  return prisma.liveStreamProduct.create({
    data: { streamId, productId }
  })
}

export async function addLiveComment(streamId: string, userId: string, message: string) {
  return prisma.liveComment.create({
    data: { streamId, userId, message }
  })
}

export async function sendLiveGift(streamId: string, senderId: string, giftType: string, giftValue: number) {
  return prisma.liveGift.create({
    data: { streamId, senderId, giftType, giftValue }
  })
}

export async function endLiveStream(id: string) {
  const stream = await prisma.liveStream.findUnique({ where: { id } })
  if (!stream) throw new Error('Stream not found')

  await prisma.liveAnalytics.create({
    data: {
      streamId: id,
      peakViewers: stream.viewerCount || 0,
      totalViewers: stream.viewerCount || 0,
      totalOrders: 0,
      totalRevenue: 0,
      startedAt: stream.startedAt,
      endedAt: new Date()
    }
  })

  return prisma.liveStream.update({
    where: { id },
    data: { status: 'ended', endedAt: new Date() }
  })
}

export async function updateLiveViewerCount(streamId: string, count: number) {
  return prisma.liveStream.update({
    where: { id: streamId },
    data: { viewerCount: count }
  })
}

export async function getLiveAnalytics(streamId: string) {
  return prisma.liveAnalytics.findFirst({ where: { streamId } })
}
