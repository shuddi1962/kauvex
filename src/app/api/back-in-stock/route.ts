import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, getAuthUser, requireVendor } from '@/lib/api-helpers'
import { z } from 'zod'

const notificationSchema = z.object({
  email: z.string().email(),
  product_id: z.string().uuid(),
  variant_id: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBodyWithSchema(request, notificationSchema)
  if (valErr) return valErr

  try {
    const db = createAdminClient()

    const { data: product } = await db
      .from('products')
      .select('id, name, status')
      .eq('id', body!.product_id)
      .single()

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    const { error: insertError } = await db
      .from('back_in_stock_requests')
      .insert({
        email: body!.email,
        product_id: body!.product_id,
        variant_id: body!.variant_id ?? null,
        notified: false,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return successResponse({ message: 'Already subscribed for notification' })
      }
      return errorResponse(insertError.message, 400)
    }

    console.log(`[BackInStock] ${body!.email} subscribed to ${product.name} (${body!.product_id})`)

    return successResponse({ message: 'Notification request submitted' }, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  const { user, profile, vendor, error: authErr } = await requireVendor(request)
  if (authErr) return authErr

  try {
    const db = createAdminClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const notified = searchParams.get('notified')

    const { data: products } = await db
      .from('products')
      .select('id')
      .eq('vendor_id', vendor!.id)

    const productIds = (products ?? []).map((p: any) => p.id)
    if (productIds.length === 0) {
      return successResponse([])
    }

    let query = db
      .from('back_in_stock_requests')
      .select('*, product:product_id(id, name, slug, images)')
      .in('product_id', productIds)
      .order('created_at', { ascending: false })

    if (productId) query = query.eq('product_id', productId)
    if (notified === 'true') query = query.eq('notified', true)
    if (notified === 'false') query = query.eq('notified', false)

    const { data: requests, error } = await query

    if (error) return errorResponse('Failed to fetch requests', 500)

    return successResponse(requests ?? [])
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

async function validateBodyWithSchema<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> | null; error: NextResponse | null }> {
  try {
    const body = await request.json()
    const parsed = schema.parse(body)
    return { data: parsed, error: null }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { data: null, error: errorResponse('Validation failed', 422, err.errors) }
    }
    return { data: null, error: errorResponse('Invalid JSON body', 400) }
  }
}
