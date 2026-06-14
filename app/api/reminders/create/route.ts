/* eslint-disable @typescript-eslint/no-explicit-any */
    
// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';



// // POST - Create a new reminder
// export async function POST(request: Request) {
//   try {
//     const { title, items, userEmail, phoneNumber, fcmToken } = await request.json();

//     if (!title || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     type ItemInput = {
//       text: string;
//       dueDate: string;
//       remindBefore: number;
//       remindUnit: string;
//     };

//     const rows = (items as ItemInput[])
//       .filter((it) => it && typeof it.text === 'string' && it.text.trim() !== '')
//       .map((it) => {
//         const dueDateObj = new Date(it.dueDate);
//         if (isNaN(dueDateObj.getTime())) {
//           throw new Error('Invalid date format');
//         }

//         const reminderTime = new Date(dueDateObj);
//         const remindBefore = Number(it.remindBefore);
//         const remindUnit = String(it.remindUnit);

//         switch (remindUnit) {
//           case 'minutes':
//             reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore);
//             break;
//           case 'hours':
//             reminderTime.setHours(reminderTime.getHours() - remindBefore);
//             break;
//           case 'days':
//             reminderTime.setDate(reminderTime.getDate() - remindBefore);
//             break;
//           case 'weeks':
//             reminderTime.setDate(reminderTime.getDate() - remindBefore * 7);
//             break;
//           case 'months':
//             reminderTime.setMonth(reminderTime.getMonth() - remindBefore);
//             break;
//           default:
//             throw new Error('Invalid remind unit');
//         }

//         return {      
//           title,
//           description: it.text || '',
//           due_date: dueDateObj.toISOString(),
//           remind_before: remindBefore,
//           remind_unit: remindUnit,
//           reminder_time: reminderTime.toISOString(),       
//           user_email: userEmail || 'temp@example.com',
//           phone_number: phoneNumber || null,
//           fcm_token: fcmToken || null,
//           is_sent: false,
//         };
//       });

//     // If your `reminders` table has `is_enabled`, default it to true.
//     // Your UI/recurring logic can later toggle this via update endpoint.
//     const { data, error } = await supabase
//       .from('reminders')
//       .insert(
//         rows.map((r) => ({
//           ...r,
//           is_enabled: true,
//         }))
//       )
//       .select();

//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data, { status: 201 });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// export async function POST(request: Request) {
//   try {
//     const { title, items, userEmail, phoneNumber, fcmToken } =
//       await request.json();

//     if (!title || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // 1. Create parent reminder
//     const { data: reminder, error: reminderError } = await supabase
//       .from('reminders')
//       .insert({
//         title,
//         user_email: userEmail,
//         phone_number: phoneNumber,
//         fcm_token: fcmToken,
//         is_enabled: true,
//       })
//       .select()
//       .single();

//     if (reminderError) {
//       return NextResponse.json({ error: reminderError.message }, { status: 500 });
//     }

//     // 2. Create child items
//     const rows = items.map((it) => {
//       const dueDateObj = new Date(it.dueDate);

//       const reminderTime = new Date(dueDateObj);
//       const remindBefore = Number(it.remindBefore);
//       const remindUnit = it.remindUnit;

//       switch (remindUnit) {
//         case 'minutes':
//           reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore);
//           break;
//         case 'hours':
//           reminderTime.setHours(reminderTime.getHours() - remindBefore);
//           break;
//         case 'days':
//           reminderTime.setDate(reminderTime.getDate() - remindBefore);
//           break;
//         case 'weeks':
//           reminderTime.setDate(reminderTime.getDate() - remindBefore * 7);
//           break;
//         case 'months':
//           reminderTime.setMonth(reminderTime.getMonth() - remindBefore);
//           break;
//       }

//       return {
//         reminder_id: reminder.id,
//         text: it.text,
//         due_date: dueDateObj.toISOString(),
//         reminder_time: reminderTime.toISOString(),
//         remind_before: remindBefore,
//         remind_unit: remindUnit,
//         is_sent: false,
//       };
//     });

//     const { error: itemError } = await supabase
//       .from('reminder_items')
//       .insert(rows);

//     if (itemError) {
//       return NextResponse.json({ error: itemError.message }, { status: 500 });
//     }

//     return NextResponse.json(reminder, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      userEmail,
      phoneNumber,
      isEnabled,
      items, // array of reminder items
    } = body;

    // 1. Create parent reminder
    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert([
        {
          title,
          user_email: userEmail,
          phone_number: phoneNumber || null,
          is_enabled: isEnabled ?? true,
        },
      ])
      .select()
      .single();

    if (reminderError) throw reminderError;

    // 2. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one reminder item is required" },
        { status: 400 }
      );
    }

    // 3. Insert child items
    const formattedItems = items.map((item: any) => ({
      reminder_id: reminder.id,
      description: item.text,
      due_date: item.dueDate,
      remind_before: item.remindBefore ?? 1,
      remind_unit: item.remindUnit ?? "days",
      repeat_mode: item.repeatMode ?? 'once',
      custom_weekdays: item.repeatMode === 'custom' ? item.customWeekdays ?? null : null,
      is_sent: false,
      is_enabled: true,
    }));

    const { error: itemsError } = await supabase
      .from("reminder_items")
      .insert(formattedItems);

    if (itemsError) {
      console.error('Supabase reminder_items insert error:', itemsError);
      return NextResponse.json(
        {
          error: itemsError.message,
          details: itemsError,
          inserted: formattedItems,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reminder });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create reminder" },
      { status: 500 }
    );
  }
}