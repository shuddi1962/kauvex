import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const addProductSchema = z.object({
  product_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = addProductSchema.parse(body)

    const db = createAdminClient()

    const { data: product } = await db
      .from('products')
      .select('id, name, slug, regular_price, sale_price, images, rating, review_count, vendor_id')
      .eq('id', parsed.product_id)
      .eq('status', 'published')
      .single()

    if (!product) {
      return errorResponse('Product not found or not published', 404)
    }

    const comparison = getComparisonFromCookies(request)

    const existingIndex = comparison.findIndex((p: any) => p.id === parsed.product_id)
    if (existingIndex >= 0) {
      return successResponse({ products: comparison })
    }

    if (comparison.length >= 4) {
      return errorResponse('Maximum 4 products allowed in comparison', 400)
    }

    comparison.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price ?? product.regular_price,
      original_price: product.regular_price,
      images: Array.isArray(product.images) ? product.images : [],
      rating: product.rating,
      review_count: product.review_count,
      vendor_id: product.vendor_id,
    })

    const response = successResponse({ products: comparison })
    response.headers.set(
      'Set-Cookie',
      `kauvex_comparison=${encodeURIComponent(JSON.stringify(comparison))}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
    )

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse('Invalid product_id', 400)
    }
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const comparison = getComparisonFromCookies(request)

    if (comparison.length === 0) {
      return successResponse({ products: [] })
    }

    return successResponse({ products: comparison })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    let comparison = getComparisonFromCookies(request)

    if (productId) {
      comparison = comparison.filter((p: any) => p.id !== productId)
    } else {
      comparison = []
    }

    const response = successResponse({ products: comparison, cleared: !productId })
    response.headers.set(
      'Set-Cookie',
      `kauvex_comparison=${encodeURIComponent(JSON.stringify(comparison))}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
    )

    return response
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

function getComparisonFromCookies(request: NextRequest): Record<string, unknown>[] {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/kauvex_comparison=([^;]+)/)

  if (!match) return []

  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return []
  }
}
