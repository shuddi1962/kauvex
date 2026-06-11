import { insforge } from '@/lib/insforge'
import { createAdminClient } from '@/lib/supabase/admin'

export interface VendorOffer {
  id: string
  shared_product_id: string
  vendor_id: string
  price: number
  currency: string
  inventory: number
  fulfillment_type: string
  condition: string
  shipping_days: number
  is_buy_box_winner: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BuyBoxWinner {
  id: string
  shared_product_id: string
  vendor_offer_id: string
  win_score: number
  last_calculated: string
}

export interface SharedCatalogProduct {
  id: string
  master_product_id: string
  title: string
  description: string | null
  brand: string | null
  category_id: string | null
  images: string[]
  attributes: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VendorOfferWithScore extends VendorOffer {
  buy_box_score: number
  vendor_rating: number
  vendor_shop_name: string
}

interface ScoreComponents {
  price: number
  fulfillment: number
  delivery_speed: number
  seller_rating: number
  inventory: number
  total: number
}

function getDeliverySpeedScore(days: number): number {
  return Math.max(0, 100 - (days - 1) * 10)
}

function getFulfillmentScore(type: string): number {
  return type.toUpperCase() === 'FBK' ? 100 : 60
}

function getInventoryScore(count: number): number {
  return Math.min(100, count)
}

interface CalculateScoresParams {
  offers: VendorOfferWithScore[]
}

function calculateScores(params: CalculateScoresParams): VendorOfferWithScore[] {
  const { offers } = params
  if (offers.length === 0) return []

  const prices = offers.map(o => o.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  return offers.map(offer => {
    const priceScore = (1 - (offer.price - minPrice) / priceRange) * 100
    const fulfillment = getFulfillmentScore(offer.fulfillment_type)
    const deliverySpeed = getDeliverySpeedScore(offer.shipping_days)
    const sellerRating = (offer.vendor_rating / 5) * 100
    const inventory = getInventoryScore(offer.inventory)

    const total =
      priceScore * 0.30 +
      fulfillment * 0.25 +
      deliverySpeed * 0.20 +
      sellerRating * 0.15 +
      inventory * 0.10

    return {
      ...offer,
      buy_box_score: Math.round(total * 100) / 100,
    }
  })
}

async function fetchVendorDetails(vendorIds: string[]): Promise<Map<string, { rating: number; shop_name: string }>> {
  if (vendorIds.length === 0) return new Map()

  const { data, error } = await insforge.database
    .from('vendors')
    .select('id, rating, shop_name')
    .in('id', vendorIds)

  if (error || !data) return new Map()

  const map = new Map<string, { rating: number; shop_name: string }>()
  for (const v of data) {
    map.set(v.id, { rating: Number(v.rating) || 0, shop_name: v.shop_name })
  }
  return map
}

export async function determineBuyBoxWinner(
  sharedProductId: string
): Promise<{ winner: VendorOfferWithScore | null; allScored: VendorOfferWithScore[] }> {
  const { data: offers, error } = await insforge.database
    .from('vendor_offers')
    .select('*')
    .eq('shared_product_id', sharedProductId)
    .eq('is_active', true)

  if (error) throw new Error(`Failed to fetch offers: ${error.message}`)
  if (!offers || offers.length === 0) {
    return { winner: null, allScored: [] }
  }

  const rawOffers: VendorOffer[] = offers as unknown as VendorOffer[]
  const vendorIdSet = new Set<string>()
  for (const o of rawOffers) vendorIdSet.add(o.vendor_id)
  const vendorIds = Array.from(vendorIdSet)
  const vendorMap = await fetchVendorDetails(vendorIds)

  const offersWithVendor: VendorOfferWithScore[] = rawOffers.map(o => {
    const v = vendorMap.get(o.vendor_id) || { rating: 0, shop_name: 'Unknown' }
    return {
      ...o,
      price: Number(o.price),
      inventory: Number(o.inventory),
      shipping_days: Number(o.shipping_days),
      buy_box_score: 0,
      vendor_rating: v.rating,
      vendor_shop_name: v.shop_name,
    }
  })

  const scored = calculateScores({ offers: offersWithVendor })
  scored.sort((a, b) => b.buy_box_score - a.buy_box_score)

  const winner = scored[0] || null
  const adminDb = createAdminClient()

  const offerIds = scored.map(o => o.id)
  const winnerId = winner?.id || ''

  await adminDb
    .from('vendor_offers')
    .update({ is_buy_box_winner: false, updated_at: new Date().toISOString() })
    .in('id', offerIds)

  if (winner) {
    await adminDb
      .from('vendor_offers')
      .update({ is_buy_box_winner: true, updated_at: new Date().toISOString() })
      .eq('id', winner.id)

    const { data: existing } = await adminDb
      .from('buy_box_winners')
      .select('id')
      .eq('shared_product_id', sharedProductId)
      .maybeSingle()

    if (existing) {
      await adminDb
        .from('buy_box_winners')
        .update({
          vendor_offer_id: winner.id,
          win_score: winner.buy_box_score,
          last_calculated: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await adminDb
        .from('buy_box_winners')
        .insert({
          shared_product_id: sharedProductId,
          vendor_offer_id: winner.id,
          win_score: winner.buy_box_score,
          last_calculated: new Date().toISOString(),
        })
    }
  }

  return { winner, allScored: scored }
}

export async function recalculateAllBuyBoxes(): Promise<{
  total: number
  updated: number
  skipped: number
  errors: number
}> {
  const { data: products, error } = await insforge.database
    .from('shared_catalog_products')
    .select('id')
    .eq('is_active', true)

  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  if (!products) return { total: 0, updated: 0, skipped: 0, errors: 0 }

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const product of products) {
    try {
      const { winner } = await determineBuyBoxWinner(product.id)
      if (winner) updated++
      else skipped++
    } catch {
      errors++
    }
  }

  return { total: products.length, updated, skipped, errors }
}
