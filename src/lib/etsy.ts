// Etsy Vendor Connection — OAuth per-vendor dropshipping source
// Each vendor connects their own Etsy shop via OAuth
// Environment: ETSY_CLIENT_ID, ETSY_CLIENT_SECRET, ETSY_REDIRECT_URI

export interface EtsyListing {
  listingId: string
  title: string
  description: string
  image: string
  price: number
  currency: string
  quantity: number
  tags: string[]
  category: string
  url: string
}

const ETSY_API_BASE = 'https://api.etsy.com/v3'

function getClientId(): string {
  return process.env.ETSY_CLIENT_ID || ''
}

function getClientSecret(): string {
  return process.env.ETSY_CLIENT_SECRET || ''
}

function getRedirectUri(): string {
  return process.env.ETSY_REDIRECT_URI || 'http://localhost:3000/api/v1/dropshipping/etsy/callback'
}

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: 'listings_r transactions_r',
    state,
  })
  return `https://www.etsy.com/oauth/connect?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const res = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: getRedirectUri(),
    }),
  })
  if (!res.ok) throw new Error(`Etsy token exchange failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export async function searchEtsyListings(
  accessToken: string,
  query: string,
  category?: string
): Promise<EtsyListing[]> {
  try {
    const params = new URLSearchParams({ q: query, limit: '20' })
    if (category) params.set('category', category)

    const res = await fetch(`${ETSY_API_BASE}/application/listings/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'x-api-key': getClientId() },
    })
    if (!res.ok) {
      console.error('[Etsy] search failed:', res.status)
      return []
    }
    const data = await res.json()
    const items: any[] = data.results || []
    return items.map((item: any) => ({
      listingId: String(item.listing_id || ''),
      title: item.title || '',
      description: item.description || '',
      image: item.images?.[0]?.url_570xN || item.url_570xN || '',
      price: Number(item.price?.amount || item.price || 0),
      currency: item.price?.currency_code || item.currency_code || 'USD',
      quantity: item.quantity || 0,
      tags: item.tags || [],
      category: item.category_path?.join(' > ') || '',
      url: item.url || '',
    }))
  } catch (err) {
    console.error('[Etsy] search error:', err)
    return []
  }
}

export async function getEtsyListingDetails(accessToken: string, listingId: string): Promise<EtsyListing | null> {
  try {
    const res = await fetch(`${ETSY_API_BASE}/application/listings/${listingId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'x-api-key': getClientId() },
    })
    if (!res.ok) return null
    const data = await res.json()
    const item = data.results?.[0] || data
    return {
      listingId: String(item.listing_id || listingId),
      title: item.title || '',
      description: item.description || '',
      image: item.images?.[0]?.url_570xN || '',
      price: Number(item.price?.amount || item.price || 0),
      currency: item.price?.currency_code || 'USD',
      quantity: item.quantity || 0,
      tags: item.tags || [],
      category: item.category_path?.join(' > ') || '',
      url: item.url || '',
    }
  } catch {
    return null
  }
}
