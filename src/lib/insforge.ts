import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)

export const supabase = supabaseClient

function createAuthShim(auth: typeof supabaseClient.auth) {
  return new Proxy({} as typeof supabaseClient.auth, {
    get(_, prop: string) {
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
        from: (table: string) => supabaseClient.from(table as any),
      }
    }
    if (prop === 'auth') return createAuthShim(supabaseClient.auth)
    if (prop === 'storage') return supabaseClient.storage
    if (prop === 'realtime') return supabaseClient.realtime
    if (prop === 'channel') return supabaseClient.channel.bind(supabaseClient)
    if (prop === 'rpc') return supabaseClient.rpc.bind(supabaseClient)
    if (['from', 'select', 'insert', 'update', 'delete', 'upsert'].includes(prop)) {
      return (supabaseClient as any)[prop].bind(supabaseClient)
    }
    return (supabaseClient as any)[prop]
  },
})
