import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, requireAdmin } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request)
  if (authErr) return authErr

  try {
    const db = createAdminClient()

    const { data: vendors } = await db
      .from('vendors')
      .select('id, shop_name, total_revenue, commission')

    if (!vendors || vendors.length === 0) {
      return successResponse({ payouts: [], message: 'No vendors found' })
    }

    const payoutsCreated: Record<string, unknown>[] = []
    const skipped: string[] = []
    const errors: string[] = []

    for (const vendor of vendors) {
      const commissionRate = vendor.commission ?? 10
      const grossRevenue = vendor.total_revenue ?? 0
      const platformFee = grossRevenue * (commissionRate / 100)
      const netAmount = grossRevenue - platformFee

      if (netAmount <= 0) {
        skipped.push(`${vendor.shop_name}: no payable balance`)
        continue
      }

      const { data: existingPayout } = await db
        .from('vendor_payouts')
        .select('id, status')
        .eq('vendor_id', vendor.id)
        .in('status', ['pending', 'processing'])
        .maybeSingle()

      if (existingPayout) {
        skipped.push(`${vendor.shop_name}: pending payout exists (${existingPayout.status})`)
        continue
      }

      const { data: payout, error } = await db
        .from('vendor_payouts')
        .insert({
          vendor_id: vendor.id,
          amount: Math.round(netAmount * 100) / 100,
          commission_deducted: Math.round(platformFee * 100) / 100,
          gross_revenue: Math.round(grossRevenue * 100) / 100,
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
      payoutsCreated: payoutsCreated.length,
      payouts: payoutsCreated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: vendors.length,
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
