import { NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase';

// Intentionally removed: this project does not use a custom reset-password endpoint.
// Supabase email/password reset should be configured via Supabase auth settings and
// handled through the built-in reset flow.

export async function POST() {
  return NextResponse.json({ error: 'Reset-password endpoint disabled.' }, { status: 410 });
}



