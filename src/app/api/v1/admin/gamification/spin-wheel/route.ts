import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const configId = searchParams.get('configId')

  if (configId) {
    const config = await prisma.spinWheelConfig.findUnique({
      where: { id: configId },
      include: { prizes: { orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json(config)
  }

  const configs = await prisma.spinWheelConfig.findMany({
    orderBy: { createdAt: 'desc' },
    include: { prizes: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json({ configs })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'save-config') {
    const config = await prisma.spinWheelConfig.upsert({
      where: { id: body.id || 'new' },
      update: {
        name: body.name,
        spinsPerDay: body.spinsPerDay,
        costInPoints: body.costInPoints,
        isActive: body.isActive,
      },
      create: {
        name: body.name,
        spinsPerDay: body.spinsPerDay ?? 3,
        costInPoints: body.costInPoints ?? 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ config })
  }

  if (action === 'save-prize') {
    const prize = await prisma.spinWheelPrize.upsert({
      where: { id: body.id || 'new' },
      update: {
        configId: body.configId,
        label: body.label,
        type: body.type,
        value: body.value,
        points: body.points ?? 0,
        discountPercent: body.discountPercent ?? null,
        weight: body.weight ?? 1,
        color: body.color ?? '#FF6B00',
        productId: body.productId ?? null,
        productName: body.productName ?? null,
        isActive: body.isActive ?? true,
      },
      create: {
        configId: body.configId,
        label: body.label,
        type: body.type,
        value: body.value,
        points: body.points ?? 0,
        discountPercent: body.discountPercent ?? null,
        weight: body.weight ?? 1,
        color: body.color ?? '#FF6B00',
        productId: body.productId ?? null,
        productName: body.productName ?? null,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ prize })
  }

  if (action === 'delete-prize') {
    await prisma.spinWheelPrize.delete({ where: { id: body.prizeId } })
    return NextResponse.json({ success: true })
  }

  if (action === 'delete-config') {
    await prisma.spinWheelConfig.delete({ where: { id: body.configId } })
    return NextResponse.json({ success: true })
  }

  if (action === 'spins-history') {
    const spins = await prisma.spinWheelSpin.findMany({
      orderBy: { spunAt: 'desc' },
      take: 100,
      include: { prize: true },
    })
    return NextResponse.json({ spins })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
