import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST - Create a new reminder
export async function POST(request: Request) {
  try {
    const { title, description, dueDate, remindBefore, remindUnit, userEmail, phoneNumber } = await request.json();

    if (!title || !dueDate || !remindBefore || !remindUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dueDateTime = new Date(dueDate);
    const reminderTime = new Date(dueDate);
    
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
          due_date: dueDateTime.toISOString(),
          remind_before: remindBefore,
          remind_unit: remindUnit,
          reminder_time: reminderTime.toISOString(),
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

