import { prisma } from '@/lib/db'

export async function recordPrice(productId: string, price: number, variantId?: string, currency?: string) {
  return prisma.priceHistory.create({
    data: { productId, variantId, price, currency: currency || 'USD', recordedAt: new Date() }
  })
}

export async function getPriceHistory(productId: string, days: number = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.priceHistory.findMany({
    where: { productId, recordedAt: { gte: since } },
    orderBy: { recordedAt: 'asc' }
  })
}

export async function getPriceStats(productId: string, days: number = 90) {
  const history = await getPriceHistory(productId, days)
  if (history.length === 0) return null
  const prices = history.map(h => Number(h.price))
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    current: prices[prices.length - 1],
    first: prices[0],
    change: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    dataPoints: history.length,
  }
}

export async function createPriceAlert(data: {
  customerId: string
  productId: string
  targetPrice: number
  currentPrice?: number
}) {
  const existing = await prisma.priceAlert.findFirst({
    where: { customerId: data.customerId, productId: data.productId, status: 'active' }
  })
  if (existing) {
    return prisma.priceAlert.update({
      where: { id: existing.id },
      data: { targetPrice: data.targetPrice, currentPrice: data.currentPrice }
    })
  }
  return prisma.priceAlert.create({
    data: { ...data, status: 'active' }
  })
}

export async function getUserPriceAlerts(customerId: string) {
  return prisma.priceAlert.findMany({
    where: { customerId, status: 'active' },
    orderBy: { createdAt: 'desc' }
  })
}

export async function checkPriceAlerts() {
  const alerts = await prisma.priceAlert.findMany({
    where: { status: 'active' }
  })

  const triggered: any[] = []
  for (const alert of alerts) {
    const product = alert.productId ? await prisma.product.findUnique({
      where: { id: alert.productId },
      select: { id: true, name: true, salePrice: true, regularPrice: true }
    }) : null
    const currentPrice = Number(product?.salePrice || product?.regularPrice || 0)
    if (currentPrice <= Number(alert.targetPrice)) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { status: 'triggered', notifiedAt: new Date(), currentPrice }
      })
      triggered.push({ alert, currentPrice })
    }
  }

  return { checked: alerts.length, triggered: triggered.length }
}

export async function cancelPriceAlert(id: string) {
  return prisma.priceAlert.update({ where: { id }, data: { status: 'cancelled' } })
}
