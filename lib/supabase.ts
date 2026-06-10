// import { createClient } from '@supabase/supabase-js'
import {
  createClient,
  type SupabaseClient
} from '@supabase/supabase-js'


function getEnv(name: string): string | undefined {
  return process.env[name]
}

// function assertSupabaseEnv() {
//   const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
//   const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
//   const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

//   if (!supabaseUrl) throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
//   if (!supabaseAnonKey) throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
//   if (!supabaseServiceKey) throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')

//   return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
// }

// let supabaseClient: ReturnType<typeof createClient> | null = null
// let supabaseServiceClient: ReturnType<typeof createClient> | null = null


function getClientEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return { supabaseUrl, supabaseAnonKey }
}

function getServiceEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return { supabaseUrl, supabaseServiceKey }
}


let supabaseClient: SupabaseClient | null = null
let supabaseServiceClient: SupabaseClient | null = null

// export function getSupabase() {
//   if (!supabaseClient) {
//     const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv()
//     supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
//   }
//   return supabaseClient
// }

export function getSupabase() {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getClientEnv()

    supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey
    )
  }

  return supabaseClient
}

// export function getSupabaseService() {
//   if (!supabaseServiceClient) {
//     const { supabaseUrl, supabaseServiceKey } = assertSupabaseEnv()
//     supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey)
//   }
//   return supabaseServiceClient
// }

export function getSupabaseService() {
  if (!supabaseServiceClient) {
    const { supabaseUrl, supabaseServiceKey } = getServiceEnv()

    supabaseServiceClient = createClient(
      supabaseUrl,
      supabaseServiceKey
    )
  }

  return supabaseServiceClient
}


// Backwards compatible named exports (now lazy). If you import before env is set,
// the error will happen only when you call methods.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// type SupabaseProxy = Record<string | symbol, unknown>

// Provide a minimal typed proxy surface to satisfy eslint without changing call sites.
// export const supabase = new Proxy({} as SupabaseProxy, {
//   get(_target, prop: string | symbol) {
//     return (getSupabase() as unknown as SupabaseProxy)[prop]
//   },
// })

// export const supabaseService = new Proxy({} as SupabaseProxy, {
//   get(_target, prop: string | symbol) {
//     return (getSupabaseService() as unknown as SupabaseProxy)[prop]
//   },
// })

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})

export const supabaseService = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseService()[prop as keyof SupabaseClient]
  },
}) 



