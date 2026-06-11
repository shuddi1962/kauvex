import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, requireVendor } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request)
  if (authErr) return authErr

  try {
    const db = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const offset = (page - 1) * limit

    let query = db
      .from('vendor_payouts')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendor!.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    query = query.range(offset, offset + limit - 1)

    const { data: payouts, error, count } = await query

    if (error) return errorResponse('Failed to fetch payout history', 500)

    return successResponse({
      payouts: payouts ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await (await import('@/lib/api-helpers')).getAuthUser(request)
  if (authErr) return authErr

  const isAdmin = profile?.role && ['super-admin', 'store-manager', 'accountant'].includes(profile.role)
  if (!isAdmin) {
    return errorResponse('Admin access required', 403)
  }

  try {
    const db = createAdminClient()

    const { data: vendors } = await db
      .from('vendors')
      .select('id, shop_name, total_revenue, commission')

    if (!vendors || vendors.length === 0) {
      return successResponse({ payouts: [], message: 'No vendors found' })
    }

    const payoutsCreated: Record<string, unknown>[] = []
    const errors: string[] = []

    for (const vendor of vendors) {
      const commissionRate = vendor.commission ?? 10
      const commissionAmount = (vendor.total_revenue ?? 0) * (commissionRate / 100)
      const netAmount = (vendor.total_revenue ?? 0) - commissionAmount

      if (netAmount <= 0) continue

      const { data: recentPayout } = await db
        .from('vendor_payouts')
        .select('id')
        .eq('vendor_id', vendor.id)
        .in('status', ['pending', 'processing'])
        .maybeSingle()

      if (recentPayout) continue

      const { data: payout, error } = await db
        .from('vendor_payouts')
        .insert({
          vendor_id: vendor.id,
          amount: netAmount,
          commission_deducted: commissionAmount,
          status: 'pending',
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString(),
        })
        .select('*')
        .single()

      if (error) {
        errors.push(`Vendor ${vendor.shop_name}: ${error.message}`)
      } else {
        payoutsCreated.push(payout!)
      }
    }

    return successResponse({
      payouts: payoutsCreated,
      errors: errors.length > 0 ? errors : undefined,
      totalCreated: payoutsCreated.length,
      totalErrors: errors.length,
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
