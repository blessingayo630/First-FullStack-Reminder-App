/* eslint-disable @typescript-eslint/no-explicit-any */
 
// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// // PUT - Update an existing reminder
// export async function PUT(request: Request) {
//   try {
//     const { id, title, description, dueDate, remindBefore, remindUnit, userEmail, fcmToken, isEnabled } = await request.json();

//     // Backward-compatible: if isEnabled isn't provided, keep DB value as-is.
//     // (kept for future use; normalizedIsEnabled intentionally unused today)
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const _normalizedIsEnabled = typeof isEnabled === 'boolean' ? isEnabled : undefined;




//     if (!id) {
//       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     }

//     if (!title || !dueDate || !remindBefore || !remindUnit) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Treat the input as a Date object.
//     const dueDateObj = new Date(dueDate);
    
//     // Check if the date is valid
//     if (isNaN(dueDateObj.getTime())) {
//       return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//     }
    
//     // Calculate reminder time based on the due date
//     const reminderTime = new Date(dueDateObj);
//     switch (remindUnit) {
//       case 'minutes': 
//         reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore); 
//         break;
//       case 'hours':
//         reminderTime.setHours(reminderTime.getHours() - remindBefore);
//         break;
//       case 'days': 
//         reminderTime.setDate(reminderTime.getDate() - remindBefore); 
//         break;
//       case 'weeks': 
//         reminderTime.setDate(reminderTime.getDate() - (remindBefore * 7)); 
//         break;
//       case 'months': 
//         reminderTime.setMonth(reminderTime.getMonth() - remindBefore); 
//         break;
//     }

//     const updateData = {
//       title,
//       description: description || '',
//       due_date: dueDateObj.toISOString(), // Store as UTC
//       remind_before: remindBefore,
//       remind_unit: remindUnit,
//       reminder_time: reminderTime.toISOString(), // Store as UTC
//       user_email: userEmail || 'temp@example.com',
//       fcm_token: fcmToken || null,
//       // If user only toggles the enabled switch, don't force-set to false
//       is_enabled: typeof isEnabled === 'boolean' ? isEnabled : undefined,
//       is_sent: false, // Reset status to Pending when edited
//     };

//     // Remove undefined fields so Supabase doesn't overwrite with null
//     Object.keys(updateData).forEach((k) => {
//       // @ts-expect-error runtime cleanup
//       if (updateData[k] === undefined) delete updateData[k];
//     });


//     const { data, error } = await supabase
//       .from('reminders')
//       .update(updateData)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      userEmail,
      phoneNumber,
      isEnabled,
      description,
      dueDate,
      remindBefore,
      remindUnit,
      fcmToken,
    } = body;

    // 1. Update parent
    const { error: parentError } = await supabase
      .from("reminders")
      .update({
        title,
        user_email: userEmail,
        phone_number: phoneNumber,
        is_enabled: isEnabled,
      })
      .eq("id", id);

    if (parentError) throw parentError;

    // 2. Update ALL items (simple approach)
    const { error: itemError } = await supabase
      .from("reminder_items")
      .update({
        description,
        due_date: dueDate,
        remind_before: remindBefore,
        remind_unit: remindUnit,
      })
      .eq("reminder_id", id);

    if (itemError) throw itemError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update reminder" },
      { status: 500 }
    );
  }
}