const STOREFRONT_MAP: Record<string, { path: string; currency: string }> = {
  NG: { path: '/ng', currency: 'NGN' },
  GB: { path: '/uk', currency: 'GBP' },
  CA: { path: '/ca', currency: 'CAD' },
  AU: { path: '/au', currency: 'AUD' },
  AE: { path: '/ae', currency: 'AED' },
  US: { path: '', currency: 'USD' },
}

export interface OneLinkConfig {
  defaultStorefront: string
  storefrontMap: Record<string, { domain: string; currency: string }>
}

export function getStorefrontForCountry(countryCode: string): { path: string; currency: string } {
  return STOREFRONT_MAP[countryCode.toUpperCase()] || STOREFRONT_MAP.US
}

export function resolveOneLinkRedirect(
  countryCode: string,
  productSlug: string,
  trackingId: string
): string {
  const storefront = getStorefrontForCountry(countryCode)
  const base = storefront.path
    ? `kauvex.com${storefront.path}/shop/${productSlug}`
    : `kauvex.com/shop/${productSlug}`
  return `${base}?ref=${trackingId}`
}
