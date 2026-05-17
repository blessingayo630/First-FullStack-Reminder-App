
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

    // Treat the input as a Date object.
    const dueDateObj = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
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

    const updateData = {
      title,
      description: description || '',
      due_date: dueDateObj.toISOString(), // Store as UTC
      remind_before: remindBefore,
      remind_unit: remindUnit,
      reminder_time: reminderTime.toISOString(), // Store as UTC
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