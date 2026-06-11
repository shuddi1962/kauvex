import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers'
import { z } from 'zod'
import crypto from 'crypto'

const createDownloadSchema = z.object({
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  order_item_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request)
  if (authErr) return authErr

  const { data: body, error: valErr } = await validateBody(request, createDownloadSchema)
  if (valErr) return valErr

  try {
    const db = createAdminClient()

    const { data: order } = await db
      .from('orders')
      .select('id, customer_id, status, payment_status')
      .eq('id', body!.order_id)
      .single()

    if (!order) return errorResponse('Order not found', 404)
    if (order.customer_id !== user!.id) return errorResponse('Not your order', 403)
    if (order.payment_status !== 'paid') return errorResponse('Order not paid', 400)

    const { data: product } = await db
      .from('products')
      .select('id, name, type, images')
      .eq('id', body!.product_id)
      .single()

    if (!product) return errorResponse('Product not found', 404)
    if (product.type !== 'digital') return errorResponse('Not a digital product', 400)

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: existingDownload } = await db
      .from('digital_downloads')
      .select('id')
      .eq('order_id', body!.order_id)
      .eq('product_id', body!.product_id)
      .maybeSingle()

    if (existingDownload) {
      return successResponse({ message: 'Download already exists for this product' })
    }

    const { data: download, error } = await db
      .from('digital_downloads')
      .insert({
        order_id: body!.order_id,
        order_item_id: body!.order_item_id,
        product_id: body!.product_id,
        customer_id: user!.id,
        token,
        expires_at: expiresAt,
        download_count: 0,
        max_downloads: 5,
        status: 'active',
      })
      .select('*')
      .single()

    if (error) return errorResponse(error.message, 400)

    return successResponse(download, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const orderId = searchParams.get('order_id')

    if (token) {
      return handleTokenVerification(token)
    }

    const { user, error: authErr } = await getAuthUser(request)
    if (authErr) return authErr

    const db = createAdminClient()
    let query = db
      .from('digital_downloads')
      .select('*, product:product_id(id, name, images)')
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false })

    if (orderId) query = query.eq('order_id', orderId)

    const { data: downloads, error } = await query

    if (error) return errorResponse('Failed to fetch downloads', 500)

    return successResponse(downloads ?? [])
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

async function handleTokenVerification(token: string) {
  const db = createAdminClient()

  const { data: download, error } = await db
    .from('digital_downloads')
    .select('*, product:product_id(id, name, images, long_description)')
    .eq('token', token)
    .single()

  if (error || !download) {
    return errorResponse('Invalid or expired download link', 404)
  }

  if (download.status !== 'active') {
    return errorResponse('Download has been deactivated', 410)
  }

  if (new Date(download.expires_at) < new Date()) {
    return errorResponse('Download link has expired', 410)
  }

  if (download.download_count >= download.max_downloads) {
    return errorResponse('Maximum download count reached', 429)
  }

  const images = Array.isArray(download.product?.images)
    ? download.product.images
    : typeof download.product?.images === 'string'
      ? JSON.parse(download.product.images)
      : []

  const fileUrl = images[0] ?? null

  await db
    .from('digital_downloads')
    .update({
      download_count: (download.download_count ?? 0) + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq('id', download.id)

  return successResponse({
    id: download.id,
    product_name: download.product?.name,
    product_id: download.product?.id,
    file_url: fileUrl,
    download_count: download.download_count + 1,
    max_downloads: download.max_downloads,
    expires_at: download.expires_at,
  })
}

async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> | null; error: NextResponse | null }> {
  try {
    const body = await request.json()
    const parsed = schema.parse(body)
    return { data: parsed, error: null }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { data: null, error: errorResponse('Validation failed', 422, err.issues) }
    }
    return { data: null, error: errorResponse('Invalid JSON body', 400) }
  }
}
