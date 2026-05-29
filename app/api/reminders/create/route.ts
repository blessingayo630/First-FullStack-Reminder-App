
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';



// POST - Create a new reminder
export async function POST(request: Request) {
  try {
    const { title, items, userEmail, phoneNumber, fcmToken } = await request.json();

    if (!title || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    type ItemInput = {
      text: string;
      dueDate: string;
      remindBefore: number;
      remindUnit: string;
    };

    const rows = (items as ItemInput[])
      .filter((it) => it && typeof it.text === 'string' && it.text.trim() !== '')
      .map((it) => {
        const dueDateObj = new Date(it.dueDate);
        if (isNaN(dueDateObj.getTime())) {
          throw new Error('Invalid date format');
        }

        const reminderTime = new Date(dueDateObj);
        const remindBefore = Number(it.remindBefore);
        const remindUnit = String(it.remindUnit);

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
            reminderTime.setDate(reminderTime.getDate() - remindBefore * 7);
            break;
          case 'months':
            reminderTime.setMonth(reminderTime.getMonth() - remindBefore);
            break;
          default:
            throw new Error('Invalid remind unit');
        }

        return {
          title,
          description: it.text || '',
          due_date: dueDateObj.toISOString(),
          remind_before: remindBefore,
          remind_unit: remindUnit,
          reminder_time: reminderTime.toISOString(),
          user_email: userEmail || 'temp@example.com',
          phone_number: phoneNumber || null,
          fcm_token: fcmToken || null,
          is_sent: false,
        };
      });

    // If your `reminders` table has `is_enabled`, default it to true.
    // Your UI/recurring logic can later toggle this via update endpoint.
    const { data, error } = await supabase
      .from('reminders')
      .insert(
        rows.map((r) => ({
          ...r,
          is_enabled: true,
        }))
      )
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
