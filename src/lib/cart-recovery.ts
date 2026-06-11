import { insforge } from './insforge'

export interface AbandonedCart {
  id: string
  customer_id: string
  customer_email: string
  customer_name: string
  items: Record<string, unknown>[]
  subtotal: number
  currency: string
  storefront_id: string
  recovery_stage: number
  recovered: boolean
  recovered_order_id: string | null
  created_at: string
  updated_at: string
}

const RECOVERY_STAGES = [
  { hours: 1, subject: 'You left something behind', template: 'stage1' },
  { hours: 6, subject: 'Your items are waiting', template: 'stage2' },
  { hours: 24, subject: 'Your cart expires soon', template: 'stage3' },
]

function getRecoveryStageLabel(stage: number): string {
  return RECOVERY_STAGES[stage]?.subject ?? 'Recovery email'
}

export async function checkAbandonedCarts(): Promise<{ emailsSent: Record<string, number> }> {
  const db = insforge.database
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const emailsSent: Record<string, number> = { stage1: 0, stage2: 0, stage3: 0 }

  const { data: carts, error } = await db
    .from('abandoned_carts')
    .select('*')
    .eq('recovered', false)
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: true })

  if (error) {
    console.error('[CartRecovery] Failed to fetch abandoned carts:', error.message)
    return { emailsSent }
  }

  for (const cart of carts ?? []) {
    const stageIndex = cart.recovery_stage ?? 0
    const stage = RECOVERY_STAGES[stageIndex]
    if (!stage) continue

    const cartAge = Date.now() - new Date(cart.updated_at).getTime()
    const stageHours = stage.hours * 60 * 60 * 1000

    if (cartAge >= stageHours) {
      await sendRecoveryEmail(cart as unknown as AbandonedCart, stageIndex)
      emailsSent[`stage${stageIndex + 1}`]++

      const nextStage = stageIndex + 1
      await db
        .from('abandoned_carts')
        .update({
          recovery_stage: nextStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cart.id)
    }
  }

  return { emailsSent }
}

export async function sendRecoveryEmail(
  cart: AbandonedCart,
  stage: number
): Promise<void> {
  const stageLabel = getRecoveryStageLabel(stage)
  const itemCount = cart.items?.length ?? 0
  const cartLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kauvex.com'}/cart?recovery=${cart.id}`

  console.log(`[CartRecovery] ───────────────────────────────────`)
  console.log(`[CartRecovery] TO:      ${cart.customer_email} (${cart.customer_name})`)
  console.log(`[CartRecovery] STAGE:   ${stage + 1} — ${stageLabel}`)
  console.log(`[CartRecovery] ITEMS:   ${itemCount} item(s)`)
  console.log(`[CartRecovery] TOTAL:   ${cart.currency ?? 'USD'} ${cart.subtotal.toFixed(2)}`)
  console.log(`[CartRecovery] LINK:    ${cartLink}`)
  console.log(`[CartRecovery] CART ID: ${cart.id}`)
  console.log(`[CartRecovery] ───────────────────────────────────`)

  if (process.env.NODE_ENV === 'development') {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY ?? 'mock'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'KAUVEX <noreply@kauvex.com>',
          to: cart.customer_email,
          subject: stageLabel,
          html: buildEmailHtml(cart, stage, cartLink),
        }),
      })
    } catch {
      console.log(`[CartRecovery] Email sending skipped (no RESEND_API_KEY configured)`)
    }
  }
}

function buildEmailHtml(cart: AbandonedCart, stage: number, cartLink: string): string {
  const stageMessages = [
    `<h2>Hey ${cart.customer_name}, you forgot something!</h2>
     <p>Your cart is still waiting. Come back and complete your order before items sell out.</p>`,
    `<h2>${cart.customer_name}, your items are still warm!</h2>
     <p>We've saved your cart just in case. Don't miss out on these great finds.</p>`,
    `<h2>Last chance, ${cart.customer_name}!</h2>
     <p>Your cart will expire soon. Complete your order now to secure these items.</p>`,
  ]

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Inter, Arial, sans-serif; background: #f4f4f4; padding: 40px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0A1628; font-size: 28px;">KAUVEX</h1>
        </div>
        ${stageMessages[stage] ?? stageMessages[0]}
        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #666;">${cart.items?.length ?? 0} item(s) — ${cart.currency ?? 'USD'} ${cart.subtotal.toFixed(2)}</p>
        </div>
        <a href="${cartLink}"
           style="display: block; background: #FF6B00; color: #fff; text-align: center;
                  padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Return to Cart
        </a>
      </div>
    </body>
    </html>
  `
}

export async function recoverCart(
  cartId: string,
  orderId: string
): Promise<boolean> {
  const db = insforge.database

  const { error } = await db
    .from('abandoned_carts')
    .update({
      recovered: true,
      recovered_order_id: orderId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cartId)

  if (error) {
    console.error('[CartRecovery] Failed to mark cart as recovered:', error.message)
    return false
  }

  console.log(`[CartRecovery] Cart ${cartId} recovered via order ${orderId}`)
  return true
}
