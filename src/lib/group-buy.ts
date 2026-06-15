import { prisma } from '@/lib/db'

export async function createGroupBuy(data: {
  productId: string
  variantId?: string
  regularPrice: number
  groupPrice: number
  targetCount: number
  expiresInHours: number
  createdBy: string
}) {
  const expiresAt = new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000)
  return prisma.groupBuy.create({
    data: {
      productId: data.productId,
      variantId: data.variantId,
      regularPrice: data.regularPrice,
      groupPrice: data.groupPrice,
      targetCount: data.targetCount,
      currentCount: 1,
      expiresAt,
      status: 'active',
      createdBy: data.createdBy,
      participants: {
        create: { userId: data.createdBy }
      }
    },
    include: { participants: true }
  })
}

export async function joinGroupBuy(groupBuyId: string, userId: string) {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
    include: { participants: true }
  })
  if (!groupBuy) throw new Error('Group buy not found')
  if (groupBuy.status !== 'active') throw new Error('Group buy is no longer active')
  if (groupBuy.expiresAt && new Date() > groupBuy.expiresAt) {
    await prisma.groupBuy.update({ where: { id: groupBuyId }, data: { status: 'expired' } })
    throw new Error('Group buy has expired')
  }
  if (groupBuy.participants.some(p => p.userId === userId)) {
    throw new Error('Already joined this group buy')
  }

  const participant = await prisma.groupBuyParticipant.create({
    data: { groupBuyId, userId }
  })

  const newCount = (groupBuy.currentCount ?? 1) + 1
  const targetCount = groupBuy.targetCount ?? 5
  const reachedTarget = newCount >= targetCount

  await prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: {
      currentCount: newCount,
      ...(reachedTarget ? { status: 'reached' } : {})
    }
  })

  return { participant, reachedTarget, currentCount: newCount, targetCount }
}

export async function getActiveGroupBuys() {
  return prisma.groupBuy.findMany({
    where: { status: 'active', expiresAt: { gte: new Date() } },
    include: { _count: { select: { participants: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getGroupBuyById(id: string) {
  return prisma.groupBuy.findUnique({
    where: { id },
    include: { participants: true }
  })
}

export async function getUserGroupBuys(userId: string) {
  return prisma.groupBuy.findMany({
    where: { participants: { some: { userId } } },
    include: { _count: { select: { participants: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function expireStaleGroupBuys() {
  const now = new Date()
  const expired = await prisma.groupBuy.updateMany({
    where: { status: 'active', expiresAt: { lte: now } },
    data: { status: 'expired' }
  })
  return { expired: expired.count }
}
