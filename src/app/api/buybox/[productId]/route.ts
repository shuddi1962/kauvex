import { NextResponse } from 'next/server'
import { insforge } from '@/lib/insforge'

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const [winnerResult, offersResult] = await Promise.all([
      insforge.database
        .from('buy_box_winners')
        .select('*, vendor_offers!inner(*)')
        .eq('shared_product_id', productId)
        .maybeSingle(),
      insforge.database
        .from('vendor_offers')
        .select('*')
        .eq('shared_product_id', productId)
        .eq('is_active', true),
    ])

    if (winnerResult.error) {
      return NextResponse.json(
        { error: winnerResult.error.message },
        { status: 500 }
      )
    }

    if (offersResult.error) {
      return NextResponse.json(
        { error: offersResult.error.message },
        { status: 500 }
      )
    }

    const offers = offersResult.data || []

    interface WinnerOutput {
      id: string
      vendor_id: string
      price: number
      currency: string
      fulfillment_type: string
      shipping_days: number
      inventory: number
      score: number
      last_calculated: string
      seller_name?: string
      rating?: number
    }

    interface OtherSeller {
      id: string
      vendor_id: string
      price: number
      currency: string
      fulfillment_type: string
      shipping_days: number
      inventory: number
      condition: string
      seller_name?: string
      rating?: number
    }

    let winner: WinnerOutput | null = null
    const otherSellers: OtherSeller[] = []

    if (winnerResult.data) {
      const winnerOffer = winnerResult.data.vendor_offers as Record<string, unknown>
      winner = {
        id: winnerOffer.id as string,
        vendor_id: winnerOffer.vendor_id as string,
        price: Number(winnerOffer.price),
        currency: winnerOffer.currency as string,
        fulfillment_type: winnerOffer.fulfillment_type as string,
        shipping_days: Number(winnerOffer.shipping_days),
        inventory: Number(winnerOffer.inventory),
        score: winnerResult.data.win_score as number,
        last_calculated: winnerResult.data.last_calculated as string,
      }
    }

    for (const offer of offers) {
      if (winner && offer.id === winner.id) continue
      otherSellers.push({
        id: offer.id,
        vendor_id: offer.vendor_id,
        price: Number(offer.price),
        currency: offer.currency,
        fulfillment_type: offer.fulfillment_type,
        shipping_days: Number(offer.shipping_days),
        inventory: Number(offer.inventory),
        condition: offer.condition,
      })
    }

    if (winner) {
      const { data: vendorData } = await insforge.database
        .from('vendors')
        .select('shop_name, rating')
        .eq('id', winner.vendor_id)
        .maybeSingle()

      if (vendorData) {
        winner.seller_name = vendorData.shop_name
        winner.rating = Number(vendorData.rating)
      }
    }

    if (otherSellers.length > 0) {
      const vendorIdSet = new Set<string>()
      for (const s of otherSellers) vendorIdSet.add(s.vendor_id)
      const vendorIds = Array.from(vendorIdSet)
      const { data: vendorData } = await insforge.database
        .from('vendors')
        .select('id, shop_name, rating')
        .in('id', vendorIds)

      const vendorMap = new Map<string, { shop_name: string; rating: number }>()
      if (vendorData) {
        for (const v of vendorData) {
          vendorMap.set(v.id, { shop_name: v.shop_name, rating: Number(v.rating) })
        }
      }

      for (const seller of otherSellers) {
        const v = vendorMap.get(seller.vendor_id)
        if (v) {
          seller.seller_name = v.shop_name
          seller.rating = v.rating
        }
      }
    }

    return NextResponse.json({
      product_id: productId,
      winner,
      other_sellers: otherSellers,
      total_offers: offers.length,
    })
  } catch (error) {
    console.error('Buy box fetch failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
