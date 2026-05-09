// import { NextResponse } from 'next/server';
// import { sendReminderEmail } from '@/lib/email';
// import { supabaseService } from '@/lib/supabase';

// const supabase = supabaseService;

// export async function GET(request: Request) {
//   try {
//     console.log('🕐 Scheduler: Checking for due reminders...');
    
//     const { data: reminders, error } = await supabase
//       .from('reminders')
//       .select('*')
//       .lte('reminder_time', new Date().toISOString())
//       .eq('is_sent', false);

//     if (error) {
//       throw error;
//     }

//     let sent = 0;
//     for (const reminder of reminders || []) {
//       const emailSent = await sendReminderEmail(reminder);
//       if (emailSent) {
//         await supabase
//           .from('reminders')
//           .update({ is_sent: true })
//           .eq('id', reminder.id);
//         sent++;
//       }
//     }

//     return NextResponse.json({ 
//       message: `Scheduler processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Scheduler error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import { sendReminderEmail } from '@/lib/email';
// import { supabaseService } from '@/lib/supabase';

// const supabase = supabaseService;

// export async function GET(request: Request) {
//   try {
//     console.log('🕐 Scheduler: Checking for due reminders...');
    
//     // Get current UTC time in your database format (YYYY-MM-DD HH:MM:SS)
//     const now = new Date();
//     const currentUTCString = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    
//     console.log('Current UTC (formatted):', currentUTCString);
    
//     const { data: reminders, error } = await supabase
//       .from('reminders')
//       .select('*')
//       .lte('reminder_time', currentUTCString)
//       .eq('is_sent', false);

//     if (error) {
//       throw error;
//     }

//     console.log(`Found ${reminders?.length || 0} due reminders`);

//     let sent = 0;
//     for (const reminder of reminders || []) {
//       console.log(`Processing reminder: ${reminder.title}`);
//       const emailSent = await sendReminderEmail(reminder);
//       if (emailSent) {
//         await supabase
//           .from('reminders')
//           .update({ is_sent: true })
//           .eq('id', reminder.id);
//         sent++;
//         console.log(`✅ Email sent for reminder ${reminder.id}`);
//       }
//     }

//     return NextResponse.json({ 
//       message: `Scheduler processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
//       currentUTC: currentUTCString,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Scheduler error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { sendReminderEmail } from '@/lib/email';
// import { supabaseService } from '@/lib/supabase';

// const supabase = supabaseService;

// export async function GET(request: Request) {
//   try {
//     console.log('🕐 Scheduler: Checking for due reminders...');
    
//     // ✅ USE THE SAME FORMAT AS YOUR WORKING /API/CRON
//     const now = new Date();
//     const currentUTCString = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    
//     console.log('Current UTC (formatted):', currentUTCString);
    
//     const { data: reminders, error } = await supabase
//       .from('reminders')
//       .select('*')
//       .lte('reminder_time', currentUTCString)  // ✅ Now using correct format
//       .eq('is_sent', false);

//     if (error) {
//       console.error('Supabase error:', error);
//       throw error;
//     }

//     console.log(`Found ${reminders?.length || 0} due reminders`);

//     let sent = 0;
//     for (const reminder of reminders || []) {
//       console.log(`Processing reminder ${reminder.id}: ${reminder.title}`);
//       const emailSent = await sendReminderEmail(reminder);
//       if (emailSent) {
//         await supabase
//           .from('reminders')
//           .update({ is_sent: true })
//           .eq('id', reminder.id);
//         sent++;
//         console.log(`✅ Email sent for reminder ${reminder.id}`);
//       } else {
//         console.log(`❌ Failed to send email for reminder ${reminder.id}`);
//       }
//     }

//     return NextResponse.json({ 
//       message: `Scheduler processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
//       currentUTC: currentUTCString,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Scheduler error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { sendReminderEmail } from '@/lib/email';
import { supabaseService } from '@/lib/supabase';

const supabase = supabaseService;

export async function GET(request: Request) {
  try {
    console.log('🕐 Scheduler: Checking for due reminders...');
    
    const now = new Date();
    const currentUTCString = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    
    console.log('Current UTC (formatted):', currentUTCString);
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('reminder_time', currentUTCString)
      .eq('is_sent', false);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${reminders?.length || 0} due reminders`);

    if (reminders && reminders.length > 0) {
      console.log('Reminder details:', JSON.stringify(reminders[0], null, 2));
    }

    let sent = 0;
    for (const reminder of reminders || []) {
      console.log(`Processing reminder ${reminder.id}: ${reminder.title}`);
      console.log(`Email recipient: ${reminder.user_email}`);
      
      try {
        const emailSent = await sendReminderEmail(reminder);
        console.log(`Email send result: ${emailSent}`);
        
        if (emailSent) {
          const { error: updateError } = await supabase
            .from('reminders')
            .update({ is_sent: true })
            .eq('id', reminder.id);
          
          if (updateError) {
            console.error(`Update error for reminder ${reminder.id}:`, updateError);
          } else {
            sent++;
            console.log(`✅ Email sent for reminder ${reminder.id}`);
          }
        } else {
          console.log(`❌ Failed to send email for reminder ${reminder.id}`);
        }
      } catch (emailError) {
        console.error(`Exception sending email for reminder ${reminder.id}:`, emailError);
      }
    }

    return NextResponse.json({ 
      message: `Scheduler processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
      currentUTC: currentUTCString,
      timestamp: new Date().toISOString(),
      remindersFound: reminders?.length || 0,
      emailsSent: sent
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}