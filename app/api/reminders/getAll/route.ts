import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const supabaseClient = supabase;

// GET - Fetch all reminders
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

