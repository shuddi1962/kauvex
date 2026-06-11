import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const updateBundleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  products: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient()

    const { data: bundle, error } = await db
      .from('bundles')
      .select('*, vendor:vendor_id(id, shop_name, shop_slug)')
      .eq('id', params.id)
      .single()

    if (error || !bundle) {
      return errorResponse('Bundle not found', 404)
    }

    return successResponse(bundle)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = updateBundleSchema.parse(body)

    const db = createAdminClient()

    const { data: existing } = await db
      .from('bundles')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return errorResponse('Bundle not found', 404)
    }

    const updates: Record<string, unknown> = {}
    if (parsed.name !== undefined) {
      updates.name = parsed.name
      updates.slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
    }
    if (parsed.description !== undefined) updates.description = parsed.description
    if (parsed.discount_type !== undefined) updates.discount_type = parsed.discount_type
    if (parsed.discount_value !== undefined) updates.discount_value = parsed.discount_value
    if (parsed.products !== undefined) updates.products = parsed.products
    if (parsed.status !== undefined) updates.status = parsed.status
    if (parsed.starts_at !== undefined) updates.starts_at = parsed.starts_at
    if (parsed.ends_at !== undefined) updates.ends_at = parsed.ends_at
    updates.updated_at = new Date().toISOString()

    const { data: bundle, error } = await db
      .from('bundles')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) return errorResponse(error.message, 400)

    return successResponse(bundle)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse('Validation failed', 422, err.errors)
    }
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient()

    const { data: existing } = await db
      .from('bundles')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return errorResponse('Bundle not found', 404)
    }

    const { error } = await db
      .from('bundles')
      .delete()
      .eq('id', params.id)

    if (error) return errorResponse(error.message, 400)

    return successResponse({ deleted: true })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
