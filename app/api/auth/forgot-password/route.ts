import { NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body ?? {};

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Redirect URL isn't always used depending on Supabase settings.
      // Frontend pages handle UI.
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/reset-password`,
    });

    if (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'Request failed';
      return NextResponse.json({ error: message || 'Request failed' }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    let message = 'Request failed';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      message = String((err as { message?: unknown }).message ?? message);
    } else if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

