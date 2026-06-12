export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const db = createAdminClient()
    const { searchParams } = new URL(request.url)
    const storefrontId = searchParams.get('storefront_id')

    let query = db
      .from('products')
      .select('*, brand:brand_id(name), category:category_id(name, slug)')
      .eq('status', 'published')

    if (storefrontId) {
      query = query.eq('storefront_id', storefrontId)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[GoogleMerchant] Failed to fetch products:', error.message)
      return new Response('Failed to generate feed', { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kauvex.com'

    const items = (products ?? []).map((product: any) => {
      const images = Array.isArray(product.images)
        ? product.images
        : typeof product.images === 'string'
          ? JSON.parse(product.images)
          : []

      const price = product.sale_price ?? product.regular_price
      const link = `${siteUrl}/product/${product.slug}`
      const imageLink = images[0] ?? `${siteUrl}/placeholder.png`
      const availability = product.type === 'digital' ? 'in stock' : 'in stock'
      const brand = product.brand?.name ?? 'KAUVEX'
      const categoryPath = product.category?.slug ?? ''

      return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.short_description ?? product.long_description ?? '')}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price} USD</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:sku>${escapeXml(product.sku ?? product.id)}</g:sku>
      <g:gtin></g:gtin>
      <g:mpn>${escapeXml(product.sku ?? '')}</g:mpn>
      <g:product_type>${escapeXml(categoryPath)}</g:product_type>
      <g:google_product_category></g:google_product_category>
      ${product.rating ? `<g:product_rating>${product.rating}</g:product_rating>` : ''}
    </item>`
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>KAUVEX - Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>KAUVEX Google Merchant Center Feed</description>
    ${items.join('\n')}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[GoogleMerchant] Feed generation failed:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
