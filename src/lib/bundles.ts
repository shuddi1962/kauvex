import { createAdminClient } from './supabase/admin'

export interface BundleProduct {
  product_id: string
  quantity: number
  name?: string
  price?: number
}

export interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  products: BundleProduct[]
  total_original_price: number
  bundle_price: number
  status: 'active' | 'inactive'
  storefront_id: string | null
  vendor_id: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export async function calculateBundlePrice(
  bundleId: string
): Promise<{ original: number; bundle: number; discount: number } | null> {
  const db = createAdminClient()

  const { data: bundle, error } = await db
    .from('bundles')
    .select('*')
    .eq('id', bundleId)
    .single()

  if (error || !bundle) {
    console.error('[Bundles] Failed to fetch bundle:', error?.message)
    return null
  }

  const products = (bundle.products ?? []) as BundleProduct[]
  const productIds = products.map((p) => p.product_id)

  const { data: productPrices } = await db
    .from('products')
    .select('id, regular_price, sale_price')
    .in('id', productIds)

  const priceMap = new Map<string, number>()
  for (const p of productPrices ?? []) {
    priceMap.set(p.id, p.sale_price ?? p.regular_price)
  }

  let original = 0
  for (const item of products) {
    const unitPrice = priceMap.get(item.product_id) ?? item.price ?? 0
    original += unitPrice * (item.quantity ?? 1)
  }

  let bundlePrice: number
  if (bundle.discount_type === 'percentage') {
    bundlePrice = original * (1 - bundle.discount_value / 100)
  } else {
    bundlePrice = Math.max(0, original - bundle.discount_value)
  }

  return {
    original: Math.round(original * 100) / 100,
    bundle: Math.round(bundlePrice * 100) / 100,
    discount: Math.round((original - bundlePrice) * 100) / 100,
  }
}

export async function getBundleForProduct(
  productId: string
): Promise<Bundle[]> {
  const db = createAdminClient()
  const now = new Date().toISOString()

  const { data: bundles, error } = await db
    .from('bundles')
    .select('*')
    .eq('status', 'active')
    .filter('products', 'cs', JSON.stringify([{ product_id: productId }]))

  if (error) {
    console.error('[Bundles] Failed to get bundles for product:', error.message)
    return []
  }

  const active = (bundles ?? []).filter((b: any) => {
    const products = (b.products ?? []) as BundleProduct[]
    const hasProduct = products.some((p) => p.product_id === productId)
    const notStarted = b.starts_at && b.starts_at > now
    const expired = b.ends_at && b.ends_at < now
    return hasProduct && !notStarted && !expired
  })

  return active as Bundle[]
}

export async function getActiveBundles(
  storefrontId?: string
): Promise<Bundle[]> {
  const db = createAdminClient()
  const now = new Date().toISOString()

  let query = db
    .from('bundles')
    .select('*')
    .eq('status', 'active')

  if (storefrontId) {
    query = query.eq('storefront_id', storefrontId)
  }

  const { data: bundles, error } = await query

  if (error) {
    console.error('[Bundles] Failed to fetch active bundles:', error.message)
    return []
  }

  return (bundles ?? []).filter((b: any) => {
    const notStarted = b.starts_at && b.starts_at > now
    const expired = b.ends_at && b.ends_at < now
    return !notStarted && !expired
  }) as Bundle[]
}
