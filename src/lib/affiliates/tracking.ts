import { insforge } from '@/lib/insforge'

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function randomSegment(length: number = 4): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length))
  }
  return result
}

export function generateTrackingId(username: string): string {
  const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '')
  return `KAV-${sanitized}-${randomSegment()}`
}

export function buildAffiliateUrl(productSlug: string, trackingId: string): string {
  return `kauvex.com/shop/${productSlug}?ref=${trackingId}`
}

export function buildShortUrl(trackingId: string, shortCode: string): string {
  const username = trackingId.replace(/^KAV-/, '').replace(/-[A-Za-z0-9]+$/, '')
  return `kv.link/${username}/${shortCode}`
}

export function extractTrackingId(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.searchParams.get('ref')
  } catch {
    return null
  }
}

export function setAffiliateCookie(trackingId: string, days: number = 30): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `kv_affiliate_ref=${trackingId}; expires=${expires}; path=/; SameSite=Lax`
}

export function getAffiliateCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)kv_affiliate_ref=([^;]*)/)
  return match ? match[1] : null
}

export async function logClick(params: {
  partnerId: string
  trackingId: string
  productId?: string
  storefrontId?: string
  referrerUrl?: string
  landingUrl: string
  ip: string
  countryCode?: string
  userAgent: string
}): Promise<void> {
  const { error } = await insforge.database
    .from('kv_aff_clicks')
    .insert({
      partner_id: params.partnerId,
      tracking_id: params.trackingId,
      product_id: params.productId || null,
      storefront_id: params.storefrontId || null,
      referrer_url: params.referrerUrl || null,
      landing_url: params.landingUrl,
      ip_hash: hashIp(params.ip),
      country_code: params.countryCode || null,
      user_agent: params.userAgent,
      created_at: new Date().toISOString(),
    })

  if (error) throw new Error(`Failed to log click: ${error.message}`)
}

export function isSelfClick(partnerUserId: string, visitorUserId?: string): boolean {
  if (!visitorUserId) return false
  return partnerUserId === visitorUserId
}

export function isBotUserAgent(userAgent: string): boolean {
  const botPattern = /bot|crawl|spider|scraper|curl|wget|facebookexternalhit|slurp|googlebot|bingbot|baiduspider|yandexbot|twitterbot|whatsapp/i
  return botPattern.test(userAgent)
}

export function hashIp(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}
