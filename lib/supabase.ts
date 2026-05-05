import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, these might be missing. 
    // Return a dummy client or handle it if this is called during build.
    // For client-side components, they should only call this at runtime.
    throw new Error('Supabase public environment variables are missing');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

/* Deprecated top-level supabase export removed to prevent build-time client creation. Use getSupabase() instead. */
