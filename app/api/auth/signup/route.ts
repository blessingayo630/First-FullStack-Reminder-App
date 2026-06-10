import { NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phoneNumber, password } = body ?? {};

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Supabase expects metadata as an object
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber || null,
        },
      },
    });

    console.log('SIGNUP DATA:', data);
    console.log('SIGNUP ERROR:', error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If email confirmations are enabled, user may not be fully authenticated yet.
    // Still return success.
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



