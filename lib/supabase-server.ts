import { createClient } from '@supabase/supabase-js'

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseServer = () => {
  if (supabaseServerInstance) return supabaseServerInstance;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase server environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing');
  }

  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseServerInstance;
};

/* Deprecated top-level supabaseServer export removed to prevent build-time client creation. Use getSupabaseServer() instead.
Server-side Supabase client for admin operations (cron, scheduler). Uses private env vars - set these in Vercel dashboard. */
