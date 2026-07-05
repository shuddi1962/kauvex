import { NextResponse } from 'next/server'
import { seedGamification } from '@/lib/gamification/seed'

export async function POST() {
  try {
    const result = await seedGamification()
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
