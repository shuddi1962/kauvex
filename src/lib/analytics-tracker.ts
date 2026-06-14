import prisma from '@/lib/db'

export interface TrackEventMetadata {
  sessionId: string
  customerId?: string
  storefrontId?: string
  vendorId?: string
  productId?: string
  orderId?: string
  campaignId?: string
  referrer?: string
  userAgent?: string
  countryCode?: string
  deviceType?: string
  revenue?: number
  [key: string]: unknown
}

async function upsertDailyMetric(params: {
  date: Date
  storefrontId?: string | null
  vendorId?: string | null
  metricType: string
  value: number
  count: number
}) {
  const dayStart = new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate())
  const storefrontId = params.storefrontId ?? ""
  const vendorId = params.vendorId ?? ""

  await prisma.dailyMetric.upsert({
    where: {
      date_storefrontId_vendorId_metricType: {
        date: dayStart,
        storefrontId,
        vendorId,
        metricType: params.metricType,
      },
    },
    update: {
      value: { increment: params.value },
      count: { increment: params.count },
    },
    create: {
      date: dayStart,
      storefrontId,
      vendorId,
      metricType: params.metricType,
      value: params.value,
      count: params.count,
    },
  })
}

export async function trackEvent(eventType: string, metadata: TrackEventMetadata) {
  const now = new Date()

  const event = await prisma.analyticsEvent.create({
    data: {
      eventType,
      sessionId: metadata.sessionId,
      customerId: metadata.customerId ?? null,
      storefrontId: metadata.storefrontId ?? null,
      vendorId: metadata.vendorId ?? null,
      productId: metadata.productId ?? null,
      orderId: metadata.orderId ?? null,
      campaignId: metadata.campaignId ?? null,
      referrer: metadata.referrer ?? null,
      userAgent: metadata.userAgent ?? null,
      countryCode: metadata.countryCode ?? null,
      deviceType: metadata.deviceType ?? null,
      metadata: metadata as any,
      revenue: metadata.revenue ?? null,
      createdAt: now,
    },
  })

  const metricUpdates: { metricType: string; value: number; count: number }[] = [
    { metricType: eventType, value: 0, count: 1 },
  ]

  if (metadata.revenue !== undefined && metadata.revenue > 0) {
    metricUpdates.push({ metricType: 'revenue', value: metadata.revenue, count: 1 })
  }

  if (eventType === 'purchase') {
    metricUpdates.push({ metricType: 'order_count', value: 0, count: 1 })
  }

  await Promise.all(
    metricUpdates.map((m) =>
      upsertDailyMetric({
        date: now,
        storefrontId: metadata.storefrontId,
        vendorId: metadata.vendorId,
        metricType: m.metricType,
        value: m.value,
        count: m.count,
      }),
    ),
  )

  return event
}

export async function trackPageView(
  path: string,
  storefrontId: string,
  customerId?: string,
) {
  return trackEvent('page_view', {
    sessionId: path,
    storefrontId,
    customerId,
    metadata: { path },
  } as TrackEventMetadata)
}

export async function trackProductView(
  productId: string,
  customerId?: string,
  storefrontId?: string,
) {
  return trackEvent('product_view', {
    sessionId: `product-${productId}`,
    productId,
    customerId,
    storefrontId,
  })
}

export async function trackAddToCart(
  productId: string,
  customerId?: string,
  storefrontId?: string,
) {
  return trackEvent('add_to_cart', {
    sessionId: `cart-${productId}-${Date.now()}`,
    productId,
    customerId,
    storefrontId,
  })
}

export async function trackPurchase(
  orderId: string,
  customerId: string,
  revenue: number,
  storefrontId: string,
) {
  return trackEvent('purchase', {
    sessionId: `order-${orderId}`,
    orderId,
    customerId,
    storefrontId,
    revenue,
  })
}

export interface DailyMetricPoint {
  date: string
  value: number
  count: number
}

export async function getDailyMetrics(
  metricType: string,
  storefrontId?: string,
  days: number = 30,
): Promise<DailyMetricPoint[]> {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - days * 86400000)

  const where: Record<string, unknown> = {
    metricType,
    date: { gte: startDate, lte: endDate },
  }
  if (storefrontId) where.storefrontId = storefrontId

  const metrics = await prisma.dailyMetric.findMany({
    where: where as any,
    orderBy: { date: 'asc' },
    select: { date: true, value: true, count: true },
  })

  const dateMap = new Map<string, { value: number; count: number }>()
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * 86400000)
    const key = d.toISOString().split('T')[0]
    dateMap.set(key, { value: 0, count: 0 })
  }

  for (const m of metrics) {
    const key = new Date(m.date).toISOString().split('T')[0]
    if (dateMap.has(key)) {
      dateMap.set(key, { value: Number(m.value), count: m.count })
    }
  }

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    value: data.value,
    count: data.count,
  }))
}
