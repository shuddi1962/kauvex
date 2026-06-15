// AliExpress Integration — Shared Source for Vendor Dropshipping
// Uses third-party aggregator API (similar structure to CJDropshipping)
// Environment: ALIEXPRESS_API_KEY, ALIEXPRESS_APP_SECRET

export interface AliexpressProduct {
  aliexpressProductId: string
  name: string
  image: string
  supplierPrice: number
  shippingCost: number
  estimatedDelivery: string
  rating: number
  category: string
}

export interface AliexpressShippingMethod {
  name: string
  cost: number
  estimatedDays: string
}

const ALIEXPRESS_API_BASE = 'https://api.aliexpress.com/v1'
// Note: Replace with actual aggregator endpoint

function getApiKey(): string {
  return process.env.ALIEXPRESS_API_KEY || ''
}

export async function searchProducts(
  query: string,
  category?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ products: AliexpressProduct[]; total: number }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[AliExpress] API key not configured')
    return { products: [], total: 0 }
  }

  try {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      pageSize: String(pageSize),
      apiKey,
    })
    if (category) params.set('categoryId', category)

    const res = await fetch(`${ALIEXPRESS_API_BASE}/product/search?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      console.error('[AliExpress] searchProducts failed:', res.status)
      return { products: [], total: 0 }
    }

    const data = await res.json()
    const items: any[] = data.data?.results || data.data?.products || data.results || []
    const total = data.data?.total || data.total || items.length

    const products: AliexpressProduct[] = items.map((item: any) => ({
      aliexpressProductId: String(item.productId || item.id || ''),
      name: item.title || item.name || '',
      image: item.imageUrl || item.image || item.images?.[0] || '',
      supplierPrice: Number(item.price || item.salePrice || 0),
      shippingCost: Number(item.shippingCost || item.freight || 0),
      estimatedDelivery: item.deliveryTime || item.shippingTime || '10-20 days',
      rating: Number(item.rating || item.starRating || 0),
      category: item.category || item.categoryName || '',
    }))

    return { products, total }
  } catch (err) {
    console.error('[AliExpress] search error:', err)
    return { products: [], total: 0 }
  }
}

export async function getProductDetails(productId: string): Promise<AliexpressProduct | null> {
  try {
    const res = await fetch(
      `${ALIEXPRESS_API_BASE}/product/detail?productId=${productId}&apiKey=${getApiKey()}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const p = data.data || data
    return {
      aliexpressProductId: String(p.productId || p.id || productId),
      name: p.title || p.name || '',
      image: p.imageUrl || p.image || '',
      supplierPrice: Number(p.price || 0),
      shippingCost: Number(p.shippingCost || p.freight || 0),
      estimatedDelivery: p.deliveryTime || '10-20 days',
      rating: Number(p.rating || 0),
      category: p.category || '',
    }
  } catch (err) {
    console.error('[AliExpress] getProductDetails error:', err)
    return null
  }
}

export async function getShippingMethods(productId: string, countryCode: string): Promise<AliexpressShippingMethod[]> {
  try {
    const res = await fetch(
      `${ALIEXPRESS_API_BASE}/product/shipping?productId=${productId}&country=${countryCode}&apiKey=${getApiKey()}`
    )
    if (!res.ok) return []
    const data = await res.json()
    const methods: any[] = data.data?.shippingList || data.shippingMethods || []
    return methods.map((s: any) => ({
      name: s.name || s.serviceName || '',
      cost: Number(s.cost || s.price || 0),
      estimatedDays: s.estimatedDays || s.deliveryTime || '15-25',
    }))
  } catch {
    return []
  }
}
