/* eslint-disable @typescript-eslint/no-explicit-any */
 // import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';



// // GET - Fetch all reminders
// export async function GET() {
//   try {
//     const { data, error } = await supabase
//       // .from('reminders')
//       // .select('*')
//       // .order('id', { ascending: false });

//     .from('reminders')
//     .select(`
//       *,
//       reminder_items (*)
//     `)
//     .order('created_at', { ascending: false });


//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        reminder_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Failed to fetch reminders",
        details: err,
      },
      { status: 500 }
    );
  }
}

console.log(
  "SERVICE ROLE EXISTS:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);