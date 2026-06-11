import { insforge } from '@/lib/insforge'
import { createOpenRouterClient } from './openrouter'

export interface Recommendation {
  productId: string
  name: string
  slug: string
  image: string
  price: number
  salePrice?: number
  rating: number
  reviewCount: number
  brand: string
  category: string
  score: number
  reason: string
}

export interface ContentBasedParams {
  productId: string
  limit?: number
}

export async function getContentBasedRecommendations(
  productId: string,
  limit: number = 8
): Promise<Recommendation[]> {
  const { data: product } = await insforge.database
    .from('products')
    .select('id, category_id, brand_id, regular_price, tags')
    .eq('id', productId)
    .single()

  if (!product) return []

  const { data: sameCategory } = await insforge.database
    .from('products')
    .select('id, name, slug, images, regular_price, sale_price, rating, review_count, category:categories(name), brand:brands(name)')
    .eq('category_id', product.category_id)
    .neq('id', productId)
    .eq('status', 'published')
    .limit(limit * 2)
    .order('rating', { ascending: false })

  const categoryItems = (sameCategory || []).slice(0, limit)
  const remaining = limit - categoryItems.length

  let brandItems: any[] = []
  if (remaining > 0 && product.brand_id) {
    const { data: sameBrand } = await insforge.database
      .from('products')
      .select('id, name, slug, images, regular_price, sale_price, rating, review_count, category:categories(name), brand:brands(name)')
      .eq('brand_id', product.brand_id)
      .neq('id', productId)
      .eq('status', 'published')
      .limit(remaining + 2)
      .order('rating', { ascending: false })

    brandItems = (sameBrand || []).filter(
      (b: any) => !categoryItems.find((c: any) => c.id === b.id)
    ).slice(0, remaining)
  }

  const combined = [...categoryItems, ...brandItems] as any[]
  const price = Number(product.regular_price)
  const priceRange = price * 0.3

  const scored = combined
    .map((item: any) => {
      const itemPrice = Number(item.regular_price)
      let score = 0
      const reasons: string[] = []

      if (item.category_id === product.category_id) {
        score += 40
        reasons.push('Same category')
      }
      if (product.brand_id && item.brand_id === product.brand_id) {
        score += 30
        reasons.push('Same brand')
      }
      if (Math.abs(itemPrice - price) <= priceRange) {
        score += 20
        reasons.push('Similar price range')
      }
      score += Math.min(Number(item.rating) || 0, 5) * 5
      if (Number(item.rating) >= 4) {
        reasons.push('Highly rated')
      }

      return {
        productId: item.id,
        name: item.name,
        slug: item.slug,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0]?.url || '' : '',
        price: itemPrice,
        salePrice: item.sale_price ? Number(item.sale_price) : undefined,
        rating: Number(item.rating) || 0,
        reviewCount: Number(item.review_count) || 0,
        brand: item.brand?.name || '',
        category: item.category?.name || '',
        score,
        reason: reasons.slice(0, 2).join(' · '),
      }
    })
    .sort((a: Recommendation, b: Recommendation) => b.score - a.score)
    .slice(0, limit)

  return scored
}

export async function getCollaborativeRecommendations(
  customerId: string,
  limit: number = 8
): Promise<Recommendation[]> {
  const { data: orders } = await insforge.database
    .from('orders')
    .select('id')
    .eq('customer_id', customerId)
    .neq('status', 'cancelled')

  if (!orders || orders.length === 0) return []

  const orderIds = orders.map((o: any) => o.id)

  const { data: orderItems } = await insforge.database
    .from('order_items')
    .select('product_id')
    .in('order_id', orderIds)

  if (!orderItems || orderItems.length === 0) return []

  const purchasedIds = Array.from(new Set(orderItems.map((i: any) => i.product_id)))

  const { data: similarCustomers } = await insforge.database
    .from('orders')
    .select('customer_id')
    .neq('customer_id', customerId)
    .neq('status', 'cancelled')

  if (!similarCustomers || similarCustomers.length === 0) return []

  const similarCustomerIds = Array.from(new Set(similarCustomers.map((o: any) => o.customer_id)))
  const sampledIds = similarCustomerIds.slice(0, 50)

  const { data: similarOrderItems } = await insforge.database
    .from('order_items')
    .select('product_id')
    .in('order_id', (
      await insforge.database
        .from('orders')
        .select('id')
        .in('customer_id', sampledIds)
        .neq('status', 'cancelled')
    ).data?.map((o: any) => o.id) || [])

  if (!similarOrderItems) return []

  const similarProductCounts = new Map<string, number>()
  for (const item of similarOrderItems as any[]) {
    if (!purchasedIds.includes(item.product_id)) {
      similarProductCounts.set(item.product_id, (similarProductCounts.get(item.product_id) || 0) + 1)
    }
  }

  const sortedProductIds = Array.from(similarProductCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sortedProductIds.length === 0) return []

  const { data: products } = await insforge.database
    .from('products')
    .select('id, name, slug, images, regular_price, sale_price, rating, review_count, category:categories(name), brand:brands(name)')
    .in('id', sortedProductIds)
    .eq('status', 'published')

  return (products || []).map((item: any) => ({
    productId: item.id,
    name: item.name,
    slug: item.slug,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0]?.url || '' : '',
    price: Number(item.regular_price),
    salePrice: item.sale_price ? Number(item.sale_price) : undefined,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.review_count) || 0,
    brand: item.brand?.name || '',
    category: item.category?.name || '',
    score: similarProductCounts.get(item.id) || 0,
    reason: 'Other customers also bought',
  }))
}

export async function getRecentlyViewed(
  customerId: string,
  limit: number = 8
): Promise<Recommendation[]> {
  const { data: viewed } = await insforge.database
    .from('product_views')
    .select('product_id, viewed_at')
    .eq('customer_id', customerId)
    .order('viewed_at', { ascending: false })
    .limit(limit)

  if (!viewed || viewed.length === 0) return []

  const productIds = Array.from(new Set(viewed.map((v: any) => v.product_id)))

  const { data: products } = await insforge.database
    .from('products')
    .select('id, name, slug, images, regular_price, sale_price, rating, review_count, category:categories(name), brand:brands(name)')
    .in('id', productIds)
    .eq('status', 'published')

  const productMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]))

  return viewed
    .map((v: any) => {
      const item: any = productMap.get(v.product_id)
      if (!item) return null
      return {
        productId: item.id,
        name: item.name,
        slug: item.slug,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0]?.url || '' : '',
        price: Number(item.regular_price),
        salePrice: item.sale_price ? Number(item.sale_price) : undefined,
        rating: Number(item.rating) || 0,
        reviewCount: Number(item.review_count) || 0,
        brand: item.brand?.name || '',
        category: item.category?.name || '',
        score: 100,
        reason: 'Previously viewed',
      } as Recommendation
    })
    .filter((r: Recommendation | null): r is Recommendation => r !== null)
}

export async function getSmartRecommendations(
  customerId: string | null,
  productId?: string,
  limit: number = 8
): Promise<{ contentBased: Recommendation[]; collaborative: Recommendation[]; recentlyViewed: Recommendation[] }> {
  const [contentBased, collaborative, recentlyViewed] = await Promise.all([
    productId ? getContentBasedRecommendations(productId, limit).catch(() => []) : Promise.resolve([]),
    customerId ? getCollaborativeRecommendations(customerId, limit).catch(() => []) : Promise.resolve([]),
    customerId ? getRecentlyViewed(customerId, limit).catch(() => []) : Promise.resolve([]),
  ])

  return { contentBased, collaborative, recentlyViewed }
}

export async function getSemanticRecommendations(
  productId: string,
  limit: number = 5
): Promise<Recommendation[]> {
  const { data: product } = await insforge.database
    .from('products')
    .select('name, short_description, tags, category:categories(name)')
    .eq('id', productId)
    .single()

  if (!product) return []

  const { data: candidates } = await insforge.database
    .from('products')
    .select('id, name, short_description, tags')
    .neq('id', productId)
    .eq('status', 'published')
    .limit(20)

  if (!candidates || candidates.length === 0) return []

  const productText = `${product.name} ${product.short_description || ''} ${(product.tags || []).join(' ')} ${(product as any).category?.name || ''}`

  const scored = candidates.map((c: any) => {
    const candidateText = `${c.name} ${c.short_description || ''} ${(c.tags || []).join(' ')}`
    const score = computeTextSimilarity(productText.toLowerCase(), candidateText.toLowerCase())
    return { ...c, score }
  })

  scored.sort((a: any, b: any) => b.score - a.score)
  const topIds = scored.slice(0, limit).map((s: any) => s.id)

  const { data: topProducts } = await insforge.database
    .from('products')
    .select('id, name, slug, images, regular_price, sale_price, rating, review_count, category:categories(name), brand:brands(name)')
    .in('id', topIds)
    .eq('status', 'published')

  return (topProducts || []).map((item: any) => ({
    productId: item.id,
    name: item.name,
    slug: item.slug,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0]?.url || '' : '',
    price: Number(item.regular_price),
    salePrice: item.sale_price ? Number(item.sale_price) : undefined,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.review_count) || 0,
    brand: item.brand?.name || '',
    category: item.category?.name || '',
    score: scored.find((s: any) => s.id === item.id)?.score || 0,
    reason: 'Semantically similar',
  }))
}

function computeTextSimilarity(a: string, b: string): number {
  const aWords = a.split(/\W+/).filter(Boolean)
  const bWordSet = new Set(b.split(/\W+/).filter(Boolean))

  if (aWords.length === 0 || bWordSet.size === 0) return 0

  let intersection = 0
  for (const word of aWords) {
    if (bWordSet.has(word)) intersection++
  }

  const union = aWords.length + bWordSet.size - intersection
  return union > 0 ? (intersection / union) * 100 : 0
}
