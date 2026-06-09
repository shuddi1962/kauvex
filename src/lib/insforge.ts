import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Supabase client (new preferred export)
export const supabase = supabaseClient

// Compatibility shim: Insforge SDK used `insforge.database.from('table')`
// Supabase uses `supabase.from('table')` directly.
// This shim makes `insforge.database.from(...)` delegate to `supabase.from(...)`.
const dbProxy = new Proxy({} as Record<string, any>, {
  get(_, tableName: string) {
    if (tableName === 'then' || tableName === 'catch' || tableName === 'finally') return undefined
    return (supabaseClient as any)[tableName]
  },
})

// Legacy export name for backward compatibility during migration
export const insforge = new Proxy({} as any, {
  get(target, prop: string) {
    // `insforge.database.from('table')` → delegates to `supabase.from('table')`
    if (prop === 'database') {
      return {
        from: (table: string) => supabaseClient.from(table as any),
      }
    }
    // `insforge.auth.*` → delegates to `supabase.auth.*`
    if (prop === 'auth') return supabaseClient.auth
    // `insforge.storage.*` → delegates to `supabase.storage.*`
    if (prop === 'storage') return supabaseClient.storage
    // `insforge.realtime.*` → delegates to `supabase.realtime.*`
    if (prop === 'realtime') return supabaseClient.realtime
    // `insforge.channel()` → delegates to `supabase.channel()`
    if (prop === 'channel') return supabaseClient.channel.bind(supabaseClient)
    // `insforge.rpc()` → delegates to `supabase.rpc()`
    if (prop === 'rpc') return supabaseClient.rpc.bind(supabaseClient)
    // `insforge.from('table')` → delegates to `supabase.from('table')`
    if (['from', 'select', 'insert', 'update', 'delete', 'upsert'].includes(prop)) {
      return (supabaseClient as any)[prop].bind(supabaseClient)
    }
    return (supabaseClient as any)[prop]
  },
})
