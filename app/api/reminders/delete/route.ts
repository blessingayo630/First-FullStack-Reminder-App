/* eslint-disable @typescript-eslint/no-explicit-any */
 // import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';


 
// // DELETE - Remove a reminder
// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ error: 'Missing reminder ID' }, { status: 400 });
//     }

//     const { error } = await supabase
//       .from('reminders')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ message: 'Reminder deleted successfully' }, { status: 200 });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    // Only delete parent (cascade deletes items automatically)
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete reminder" },
      { status: 500 }
    );
  }
}   