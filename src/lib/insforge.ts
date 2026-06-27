import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel dashboard.'
    )
  }
  _client = createBrowserClient(url, key)
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})

function createAuthShim() {
  return new Proxy({} as any, {
    get(_, prop: string) {
      const auth = getClient().auth
      if (prop === 'getCurrentUser') {
        return async () => {
          const result = await auth.getUser()
          return { data: result.data, error: result.error }
        }
      }
      if (prop === 'signUp') {
        return async (params: { email: string; password: string; name?: string }) => {
          const result = await auth.signUp({
            email: params.email,
            password: params.password,
            options: params.name ? { data: { name: params.name } } : undefined,
          })
          return {
            data: {
              ...result.data,
              requireEmailVerification: !result.data?.user?.email_confirmed_at,
            },
            error: result.error,
          }
        }
      }
      if (prop === 'signInWithOAuth') {
        return async (params: { provider: string; redirectTo?: string }) => {
          return auth.signInWithOAuth({
            provider: params.provider as any,
            options: params.redirectTo ? { redirectTo: params.redirectTo } : undefined,
          })
        }
      }
      if (prop === 'verifyEmail') {
        return async (params: { email: string; otp: string }) => {
          return auth.verifyOtp({
            email: params.email,
            token: params.otp,
            type: 'email',
          })
        }
      }
      if (prop === 'resendVerificationEmail') {
        return async (params: { email: string }) => {
          return auth.resend({ type: 'signup', email: params.email })
        }
      }
      if (prop === 'sendResetPasswordEmail') {
        return async (params: { email: string }) => {
          return auth.resetPasswordForEmail(params.email)
        }
      }
      if (prop === 'setProfile') {
        return async () => {
          return { data: null, error: null }
        }
      }
      const val = (auth as any)[prop]
      return typeof val === 'function' ? val.bind(auth) : val
    },
  })
}

export const insforge = new Proxy({} as any, {
  get(_, prop: string) {
    if (prop === 'database') {
      return {
        from: (table: string) => getClient().from(table as any),
      }
    }
    if (prop === 'auth') return createAuthShim()
    if (prop === 'storage') return getClient().storage
    if (prop === 'realtime') return getClient().realtime
    if (prop === 'channel') return getClient().channel.bind(getClient())
    if (prop === 'rpc') return getClient().rpc.bind(getClient())
    if (['from', 'select', 'insert', 'update', 'delete', 'upsert'].includes(prop)) {
      return (getClient() as any)[prop].bind(getClient())
    }
    return (getClient() as any)[prop]
  },
})
