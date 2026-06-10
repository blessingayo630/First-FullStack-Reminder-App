import { NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'Login failed';


      return NextResponse.json({ error: message || 'Login failed' }, { status: 400 });
    }



    return NextResponse.json({ success: true, data });


  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }


}

