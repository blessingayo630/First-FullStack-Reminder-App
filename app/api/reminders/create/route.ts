// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// const supabaseClient = supabase;

// // POST - Create a new reminder
// export async function POST(request: Request) {
//   try {
//     const { title, description, dueDate, remindBefore, remindUnit, userEmail, phoneNumber } = await request.json();

//     if (!title || !dueDate || !remindBefore || !remindUnit) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     const dueDateTime = new Date(dueDate);
//     const reminderTime = new Date(dueDate);
    
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

//     const { data, error } = await supabase
//       .from('reminders')
//       .insert([
//         {
//           title,
//           description: description || '',
//           due_date: dueDateTime.toISOString(),
//           remind_before: remindBefore,
//           remind_unit: remindUnit,
//           reminder_time: reminderTime.toISOString(),
//           user_email: userEmail || 'temp@example.com',
//           phone_number: phoneNumber || null,
//           is_sent: false
//         }
//       ])
//       .select();

//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data[0], { status: 201 });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const supabaseClient = supabase;

// POST - Create a new reminder
export async function POST(request: Request) {
  try {
    const { title, description, dueDate, remindBefore, remindUnit, userEmail, phoneNumber } = await request.json();

    if (!title || !dueDate || !remindBefore || !remindUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ FIX: Parse the local datetime string correctly
    // The input "2025-06-15T01:05" is treated as LOCAL time
    const localDueDate = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(localDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    // Convert local time to UTC for storage WITHOUT shifting
    // Get the timezone offset in minutes (e.g., +60 for UTC+1 = -60 offset)
    const timezoneOffset = localDueDate.getTimezoneOffset();
    
    // Create UTC date by subtracting the offset
    // This preserves the exact wall-clock time the user selected
    const utcDueDate = new Date(localDueDate.getTime() - (timezoneOffset * 60 * 1000));
    
    // Calculate reminder time based on the UTC due date
    const reminderTime = new Date(utcDueDate);
    switch (remindUnit) {
      case 'minutes': 
        reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore); 
        break;
      case 'hours':
        reminderTime.setHours(reminderTime.getHours() - remindBefore);
        break;
      case 'days': 
        reminderTime.setDate(reminderTime.getDate() - remindBefore); 
        break;
      case 'weeks': 
        reminderTime.setDate(reminderTime.getDate() - (remindBefore * 7)); 
        break;
      case 'months': 
        reminderTime.setMonth(reminderTime.getMonth() - remindBefore); 
        break;
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          title,
          description: description || '',
          due_date: utcDueDate.toISOString(), // ✅ Store as UTC
          remind_before: remindBefore,
          remind_unit: remindUnit,
          reminder_time: reminderTime.toISOString(), // ✅ Store as UTC
          user_email: userEmail || 'temp@example.com',
          phone_number: phoneNumber || null,
          is_sent: false
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}