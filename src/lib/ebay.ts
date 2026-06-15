// eBay Vendor Connection — OAuth per-vendor dropshipping source
// Each vendor connects their own eBay seller account via OAuth
// Environment: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_REDIRECT_URI

export interface EbayProduct {
  itemId: string
  title: string
  image: string
  price: number
  currency: string
  condition: string
  shippingCost: number
  estimatedDelivery: string
  sellerName: string
  itemUrl: string
}

const EBAY_API_BASE = 'https://api.ebay.com'

function getClientId(): string {
  return process.env.EBAY_CLIENT_ID || ''
}

function getClientSecret(): string {
  return process.env.EBAY_CLIENT_SECRET || ''
}

function getRedirectUri(): string {
  return process.env.EBAY_REDIRECT_URI || 'http://localhost:3000/api/v1/dropshipping/ebay/callback'
}

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    state,
  })
  return `https://auth.ebay.com/oauth2/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const basicAuth = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')
  const res = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
    }),
  })
  if (!res.ok) throw new Error(`eBay token exchange failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const basicAuth = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')
  const res = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`eBay token refresh failed: ${res.status}`)
  const data = await res.json()
  return { accessToken: data.access_token, expiresIn: data.expires_in }
}

export async function searchEbayProducts(
  accessToken: string,
  query: string,
  category?: string
): Promise<EbayProduct[]> {
  try {
    const params = new URLSearchParams({ q: query, limit: '20' })
    if (category) params.set('category_ids', category)

    const res = await fetch(`${EBAY_API_BASE}/buy/browse/v1/item_summary/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      console.error('[eBay] search failed:', res.status)
      return []
    }
    const data = await res.json()
    const items: any[] = data.itemSummaries || []
    return items.map((item: any) => ({
      itemId: item.itemId || '',
      title: item.title || '',
      image: item.image?.imageUrl || item.thumbnail?.imageUrl || '',
      price: Number(item.price?.value || item.estimatedAvailabilities?.[0]?.price?.value || 0),
      currency: item.price?.currency || 'USD',
      condition: item.condition || 'New',
      shippingCost: Number(item.shippingOptions?.[0]?.shippingCost?.value || 0),
      estimatedDelivery: item.shippingOptions?.[0]?.estimatedDelivery || '',
      sellerName: item.seller?.username || '',
      itemUrl: item.itemWebUrl || '',
    }))
  } catch (err) {
    console.error('[eBay] search error:', err)
    return []
  }
}

export async function getEbayItemDetails(accessToken: string, itemId: string): Promise<EbayProduct | null> {
  try {
    const res = await fetch(`${EBAY_API_BASE}/buy/browse/v1/item/${itemId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const item = await res.json()
    return {
      itemId: item.itemId || itemId,
      title: item.title || '',
      image: item.image?.imageUrl || '',
      price: Number(item.price?.value || 0),
      currency: item.price?.currency || 'USD',
      condition: item.condition || 'New',
      shippingCost: Number(item.shippingOptions?.[0]?.shippingCost?.value || 0),
      estimatedDelivery: item.shippingOptions?.[0]?.estimatedDelivery || '',
      sellerName: item.seller?.username || '',
      itemUrl: item.itemWebUrl || '',
    }
  } catch {
    return null
  }
}
