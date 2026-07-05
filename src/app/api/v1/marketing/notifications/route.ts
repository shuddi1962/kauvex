import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.marketingNotification.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ notifications })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { notificationId, action } = body

  if (!notificationId) return NextResponse.json({ error: 'notificationId required' }, { status: 400 })

  const updateData: Record<string, any> = {}
  if (action === 'read') updateData.readAt = new Date()
  if (action === 'click') updateData.clickedAt = new Date()
  if (action === 'convert') updateData.convertedAt = new Date()

  if (action === 'read') updateData.status = 'read'
  else if (action === 'click') updateData.status = 'clicked'
  else if (action === 'convert') updateData.status = 'converted'

  await prisma.marketingNotification.update({
    where: { id: notificationId },
    data: updateData,
  })

  return NextResponse.json({ success: true })
}
