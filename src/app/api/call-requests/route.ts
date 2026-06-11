import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, getAuthUser, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

const callRequestSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional(),
  preferred_time: z.string().optional(),
  message: z.string().max(2000).optional(),
  product_id: z.string().uuid().optional(),
  storefront_id: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = callRequestSchema.parse(body)

    const db = createAdminClient()

    const { data: callRequest, error } = await db
      .from('call_requests')
      .insert({
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email ?? null,
        preferred_time: parsed.preferred_time ?? null,
        message: parsed.message ?? null,
        product_id: parsed.product_id ?? null,
        storefront_id: parsed.storefront_id ?? null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) return errorResponse(error.message, 400)

    console.log(`[CallRequests] New request from ${parsed.name} (${parsed.phone})`)

    return successResponse(callRequest, 201)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse('Validation failed', 422, err.errors)
    }
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request)
  if (authErr) return authErr

  const isAdmin = profile?.role && ['super-admin', 'store-manager', 'customer-support'].includes(profile.role)
  if (!isAdmin) {
    return errorResponse('Admin access required', 403)
  }

  try {
    const db = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const productId = searchParams.get('product_id')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const offset = (page - 1) * limit

    let query = db
      .from('call_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (productId) query = query.eq('product_id', productId)

    query = query.range(offset, offset + limit - 1)

    const { data: requests, error, count } = await query

    if (error) return errorResponse('Failed to fetch call requests', 500)

    return successResponse({
      requests: requests ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
