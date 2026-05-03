import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendReminderEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log('🕐 Scheduler: Checking for due reminders...');
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('reminder_time', new Date().toISOString())
      .eq('is_sent', false);

    if (error) {
      throw error;
    }

    let sent = 0;
    for (const reminder of reminders || []) {
      const emailSent = await sendReminderEmail(reminder);
      if (emailSent) {
        await supabase
          .from('reminders')
          .update({ is_sent: true })
          .eq('id', reminder.id);
        sent++;
      }
    }

    return NextResponse.json({ 
      message: `Scheduler processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
