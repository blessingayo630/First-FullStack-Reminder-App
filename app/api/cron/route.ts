import { NextResponse } from 'next/server';
import { sendReminderEmail } from '@/lib/email';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = getSupabaseServer();
  // Verify cron secret to prevent unauthorized access (dev bypass)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV !== 'development' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('🕐 Cron job: Checking for due reminders...');
    
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
          .update({ is_sent: true } as any)
          .eq('id', reminder.id);
        sent++;
      }
    }

    return NextResponse.json({ 
      message: `Processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}