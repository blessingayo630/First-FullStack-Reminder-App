import { createClient } from '@supabase/supabase-js'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

