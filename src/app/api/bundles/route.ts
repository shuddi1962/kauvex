import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, requireVendor, validateBody } from '@/lib/api-helpers'
import { z } from 'zod'

const createBundleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  products: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1),
  storefront_id: z.string().uuid().optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const db = createAdminClient()
    const { searchParams } = new URL(request.url)
    const storefrontId = searchParams.get('storefront_id')
    const status = searchParams.get('status') ?? 'active'
    const now = new Date().toISOString()

    let query = db
      .from('bundles')
      .select('*, vendor:vendor_id(id, shop_name, shop_slug)')

    if (storefrontId) {
      query = query.eq('storefront_id', storefrontId)
    }

    if (status === 'active') {
      query = query.eq('status', 'active')
      const { data, error } = await query
      if (error) return errorResponse('Failed to fetch bundles', 500)

      const activeBundles = (data ?? []).filter((b: any) => {
        const notStarted = b.starts_at && b.starts_at > now
        const expired = b.ends_at && b.ends_at < now
        return !notStarted && !expired
      })

      return successResponse(activeBundles)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return errorResponse('Failed to fetch bundles', 500)

    return successResponse(data ?? [])
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, vendor, error: authErr } = await requireVendor(request)
  if (authErr) {
    const admin = await (await import('@/lib/api-helpers')).requireAdmin(request)
    if (admin.error) return authErr
  }

  const { data: body, error: valErr } = await validateBody(request, createBundleSchema)
  if (valErr) return valErr

  try {
    const db = createAdminClient()
    const slug = body!.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

    const { data: bundle, error } = await db
      .from('bundles')
      .insert({
        name: body!.name,
        slug,
        description: body!.description ?? null,
        discount_type: body!.discount_type,
        discount_value: body!.discount_value,
        products: body!.products,
        storefront_id: body!.storefront_id ?? null,
        vendor_id: vendor?.id ?? null,
        starts_at: body!.starts_at ?? null,
        ends_at: body!.ends_at ?? null,
        status: 'active',
      })
      .select('*')
      .single()

    if (error) return errorResponse(error.message, 400)

    return successResponse(bundle, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
