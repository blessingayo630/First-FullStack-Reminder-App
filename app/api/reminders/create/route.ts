
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const supabaseClient = supabase;

// POST - Create a new reminder
export async function POST(request: Request) {
  try {
    const { title, description, dueDate, remindBefore, remindUnit, userEmail, phoneNumber, fcmToken } = await request.json();

    if (!title || !dueDate || !remindBefore || !remindUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Treat the input as a Date object. 
    // If it's an ISO string (from frontend), it will be parsed correctly as UTC.
    // If it's a local string, it will be parsed as local time.
    const dueDateObj = new Date(dueDate);
    


    // Check if the date is valid
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    console.log('dueDate from frontend:', dueDate);
console.log('dueDateObj parsed:', dueDateObj.toISOString());
    
    // Calculate reminder time based on the due date
    const reminderTime = new Date(dueDateObj);
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

    // Store as UTC ISO strings
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          title,
          description: description || '',
          due_date: dueDateObj.toISOString(), // Store as UTC
          remind_before: remindBefore,
          remind_unit: remindUnit,
          reminder_time: reminderTime.toISOString(), // Store as UTC
          user_email: userEmail || 'temp@example.com',
          phone_number: phoneNumber || null,
          fcm_token: fcmToken || null,
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