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

export async function GET(req: Request) {
  try {
    // IMPORTANT: keep reminders scoped to the logged-in user.
    // This route uses service role, so we must filter by user email.
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        reminder_items (*)
      `)
      .eq("user_email", email)
      .order("created_at", { ascending: false });


    if (error) throw error;

    // Homepage should NOT show once-sub-reminders that have already been delivered via email.
    // Non-repeating reminders page is the UI for delivered-once items.
    const filtered = (data ?? [])
      .map((r: any) => {
        const items = (r.reminder_items ?? []).filter(
          (it: any) => !((it?.repeat_mode ?? 'once') === 'once' && it?.is_sent === true)
        );
        return { ...r, reminder_items: items };
      })
      .filter((r: any) => (r.reminder_items?.length ?? 0) > 0);

    return NextResponse.json(filtered);
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
