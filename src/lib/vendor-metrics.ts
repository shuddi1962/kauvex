import { createAdminClient } from './supabase/admin'

interface VendorMetrics {
  totalOrders: number
  cancelledOrders: number
  disputedOrders: number
  negativeReviews: number
  lateShipments: number
  totalMessages: number
  respondedMessages: number
}

async function getVendorOrderIds(vendorId: string): Promise<string[]> {
  const db = createAdminClient()

  const { data: products } = await db
    .from('products')
    .select('id')
    .eq('vendor_id', vendorId)

  const productIds = (products ?? []).map((p: any) => p.id)
  if (productIds.length === 0) return []

  const { data: orderItems } = await db
    .from('order_items')
    .select('order_id')
    .in('product_id', productIds)

  const orderIds = [...new Set((orderItems ?? []).map((oi: any) => oi.order_id))]
  return orderIds
}

export async function calculateOrderDefectRate(vendorId: string): Promise<number> {
  const db = createAdminClient()
  const orderIds = await getVendorOrderIds(vendorId)
  if (orderIds.length === 0) return 0

  const { data: disputes } = await db
    .from('disputes')
    .select('id')
    .eq('vendor_id', vendorId)
    .not('status', 'eq', 'resolved_buyer')

  const disputeCount = (disputes ?? []).length

  const { data: products } = await db
    .from('products')
    .select('id')
    .eq('vendor_id', vendorId)

  const productIds = (products ?? []).map((p: any) => p.id)
  let negativeReviewCount = 0

  if (productIds.length > 0) {
    const { count: negativeCount } = await db
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .in('product_id', productIds)
      .lte('rating', 2)

    negativeReviewCount = negativeCount ?? 0
  }

  const defects = disputeCount + negativeReviewCount
  return Math.min(100, Math.round((defects / orderIds.length) * 10000) / 100)
}

export async function calculateCancellationRate(vendorId: string): Promise<number> {
  const db = createAdminClient()
  const orderIds = await getVendorOrderIds(vendorId)
  if (orderIds.length === 0) return 0

  const { count: cancelledCount } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('id', orderIds)
    .eq('status', 'cancelled')

  return Math.round(((cancelledCount ?? 0) / orderIds.length) * 10000) / 100
}

export async function calculateLateShipmentRate(vendorId: string): Promise<number> {
  const db = createAdminClient()
  const orderIds = await getVendorOrderIds(vendorId)
  if (orderIds.length === 0) return 0

  const { data: orders } = await db
    .from('orders')
    .select('id, created_at, status, tracking_number')
    .in('id', orderIds)
    .not('status', 'eq', 'cancelled')

  if (!orders || orders.length === 0) return 0

  let lateCount = 0
  const processingDays = 2

  for (const order of orders) {
    if (!order.tracking_number) {
      const ageDays = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays > processingDays) {
        lateCount++
      }
    }
  }

  return Math.round((lateCount / orders.length) * 10000) / 100
}

export async function calculateResponseRate(vendorId: string): Promise<number> {
  const db = createAdminClient()

  const { data: messages } = await db
    .from('vendor_messages')
    .select('id, responded_at')
    .eq('vendor_id', vendorId)

  if (!messages || messages.length === 0) return 100

  const total = messages.length
  const responded = messages.filter((m: any) => m.responded_at).length

  return Math.round((responded / total) * 10000) / 100
}

export async function updateAccountHealth(vendorId: string): Promise<void> {
  const db = createAdminClient()

  const [
    defectRate,
    cancellationRate,
    lateShipmentRate,
    responseRate,
  ] = await Promise.all([
    calculateOrderDefectRate(vendorId),
    calculateCancellationRate(vendorId),
    calculateLateShipmentRate(vendorId),
    calculateResponseRate(vendorId),
  ])

  const accountHealth = Math.max(
    0,
    Math.min(
      100,
      100 - defectRate - cancellationRate - lateShipmentRate + responseRate * 0.5
    )
  )

  const { error } = await db
    .from('vendors')
    .update({
      account_health: Math.round(accountHealth * 100) / 100,
      positive_feedback: Math.max(0, 100 - defectRate),
      response_rate: responseRate,
      ship_on_time_rate: Math.max(0, 100 - lateShipmentRate),
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)

  if (error) {
    console.error('[VendorMetrics] Failed to update account health:', error.message)
    return
  }

  console.log(
    `[VendorMetrics] Updated health for ${vendorId}: ` +
    `defect=${defectRate}% cancel=${cancellationRate}% ` +
    `late=${lateShipmentRate}% response=${responseRate}% ` +
    `health=${Math.round(accountHealth)}%`
  )
}
