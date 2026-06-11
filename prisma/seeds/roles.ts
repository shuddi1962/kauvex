import { createClient } from '@supabase/supabase-js'
import { seedRolesAndPermissions } from '../../src/lib/permissions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  )
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main(): Promise<void> {
  console.log('[Seed] Starting role and permission seeding...')

  const result = await seedRolesAndPermissions({
    from: (table: string) => adminClient.from(table),
  })

  if (result.success) {
    console.log('[Seed] Roles and permissions seeded successfully.')
    process.exit(0)
  } else {
    console.error(`[Seed] Failed to seed roles and permissions: ${result.error}`)
    process.exit(1)
  }
}

main()
