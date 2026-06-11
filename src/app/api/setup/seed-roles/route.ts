import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { seedRolesAndPermissions } from '@/lib/permissions'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)

  if (!token || token !== process.env.SEED_SECRET) {
    return NextResponse.json(
      { error: 'Invalid or missing SEED_SECRET' },
      { status: 403 }
    )
  }

  const adminDb = createAdminClient()
  const result = await seedRolesAndPermissions({
    from: (table: string) => adminDb.from(table),
  })

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Roles and permissions seeded successfully',
    })
  }

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 500 }
  )
}
