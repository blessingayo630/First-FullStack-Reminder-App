

// // const supabaseClient = supabase;

// // // PUT - Update an existing reminder
// // export async function PUT(request: Request) {
// //   try {
// //     const { id, title, description, dueDate, remindBefore, remindUnit, userEmail } = await request.json();

// //     if (!id) {
// //       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
// //     }

// //     if (!title || !dueDate || !remindBefore || !remindUnit) {
// //       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
// //     }

// //     const dueDateTime = new Date(dueDate);
// //     const reminderTime = new Date(dueDate);
    
// //     switch (remindUnit) {
// //       case 'minutes': 
// //         reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore); 
// //         break;
// //       case 'hours':
// //         reminderTime.setHours(reminderTime.getHours() - remindBefore);
// //         break;
// //       case 'days': 
// //         reminderTime.setDate(reminderTime.getDate() - remindBefore); 
// //         break;
// //       case 'weeks': 
// //         reminderTime.setDate(reminderTime.getDate() - (remindBefore * 7)); 
// //         break;
// //       case 'months': 
// //         reminderTime.setMonth(reminderTime.getMonth() - remindBefore); 
// //         break;
// //     }

// //     const updateData = {
// //       title,
// //       description: description || '',
// //       due_date: dueDateTime.toISOString(),
// //       remind_before: remindBefore,
// //       remind_unit: remindUnit,
// //       reminder_time: reminderTime.toISOString(),
// //       user_email: userEmail || 'temp@example.com',
// //     };

// //     const { data, error } = await supabase
// //       .from('reminders')
// //       .update(updateData)
// //       .eq('id', id)
// //       .select()
// //       .single();

// //     if (error) {
// //       console.error('Supabase error:', error);
// //       return NextResponse.json({ error: error.message }, { status: 500 });
// //     }

// //     return NextResponse.json(data, { status: 200 });
// //   } catch (error) {
// //     console.error('Server error:', error);
// //     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// // PUT - Update an existing reminder
// export async function PUT(request: Request) {
//   try {
//     const { id, title, description, dueDate, remindBefore, remindUnit, userEmail } = await request.json();

//     if (!id) {
//       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     }

//     if (!title || !dueDate || !remindBefore || !remindUnit) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // ✅ Treat the input as UTC to preserve the "wall clock" time
//     // This ensures that if the user enters 10:55, it is stored as 10:55 UTC
//     const utcDueDate = new Date(dueDate.includes('Z') ? dueDate : dueDate.replace(' ', 'T') + 'Z');
    
//     // Check if the date is valid
//     if (isNaN(utcDueDate.getTime())) {
//       return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//     }
    
//     // Calculate reminder time based on the due date
//     const reminderTime = new Date(utcDueDate);
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
//       due_date: utcDueDate.toISOString(),
//       remind_before: remindBefore,
//       remind_unit: remindUnit,
//       reminder_time: reminderTime.toISOString(),
//       user_email: userEmail || 'temp@example.com',
//     };

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

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - Update an existing reminder
export async function PUT(request: Request) {
  try {
    const { id, title, description, dueDate, remindBefore, remindUnit, userEmail } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (!title || !dueDate || !remindBefore || !remindUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ Treat the input as LOCAL time (not UTC)
    const localDueDate = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(localDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    // Calculate reminder time based on the due date (in local time)
    const reminderTime = new Date(localDueDate);
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

    const updateData = {
      title,
      description: description || '',
      due_date: localDueDate.toISOString(), // Convert local to UTC for storage
      remind_before: remindBefore,
      remind_unit: remindUnit,
      reminder_time: reminderTime.toISOString(), // Convert local to UTC for storage
      user_email: userEmail || 'temp@example.com',
    };

    const { data, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}