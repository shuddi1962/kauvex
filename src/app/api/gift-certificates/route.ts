import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers'
import { z } from 'zod'

const purchaseSchema = z.object({
  amount: z.number().positive(),
  recipient_email: z.string().email().optional(),
  recipient_name: z.string().max(255).optional(),
  message: z.string().max(1000).optional(),
  storefront_id: z.string().uuid().optional(),
})

const checkBalanceSchema = z.object({
  code: z.string().min(1).max(50),
})

function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KVX-'
  for (let i = 0; i < 10; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request)
  if (authErr) return authErr

  try {
    const body = await request.json()
    const parsed = purchaseSchema.parse(body)

    const db = createAdminClient()
    const code = generateGiftCode()

    const { data: certificate, error } = await db
      .from('gift_certificates')
      .insert({
        code,
        original_amount: parsed.amount,
        remaining_balance: parsed.amount,
        purchaser_id: user!.id,
        recipient_email: parsed.recipient_email ?? null,
        recipient_name: parsed.recipient_name ?? null,
        message: parsed.message ?? null,
        storefront_id: parsed.storefront_id ?? null,
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('*')
      .single()

    if (error) return errorResponse(error.message, 400)

    console.log(`[GiftCertificates] Created ${code} for $${parsed.amount}`)

    return successResponse(certificate, 201)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse('Validation failed', 422, err.issues)
    }
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      const { user, error: authErr } = await getAuthUser(request)
      if (authErr) return authErr

      const db = createAdminClient()
      const { data: certificates, error } = await db
        .from('gift_certificates')
        .select('*')
        .eq('purchaser_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) return errorResponse('Failed to fetch certificates', 500)
      return successResponse(certificates ?? [])
    }

    const parsed = checkBalanceSchema.parse({ code })

    const db = createAdminClient()
    const { data: certificate, error } = await db
      .from('gift_certificates')
      .select('*')
      .eq('code', parsed.code)
      .single()

    if (error || !certificate) {
      return errorResponse('Gift certificate not found', 404)
    }

    if (certificate.status !== 'active') {
      return successResponse({
        code: certificate.code,
        status: certificate.status,
        message: 'This gift certificate is no longer active',
      })
    }

    const expired = certificate.expires_at && new Date(certificate.expires_at) < new Date()
    if (expired) {
      return successResponse({
        code: certificate.code,
        status: 'expired',
        remaining_balance: 0,
        message: 'This gift certificate has expired',
      })
    }

    return successResponse({
      code: certificate.code,
      original_amount: certificate.original_amount,
      remaining_balance: certificate.remaining_balance,
      status: certificate.status,
      expires_at: certificate.expires_at,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse('Invalid code format', 400)
    }
    return errorResponse('Internal server error', 500)
  }
}
