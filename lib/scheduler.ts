// import { createClient } from '@supabase/supabase-js';
// import { sendReminderEmail } from './email';
// import cron from 'node-cron';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for background jobs
// );

// interface Reminder {
//   id: number;
//   title: string;
//   description: string;
//   due_date: string;
//   remind_before: number;
//   remind_unit: string;
//   reminder_time: string;
//   user_email: string;
//   is_sent: boolean;
// }

// async function checkAndSendReminders() {
//   console.log('🕐 Checking for due reminders...', new Date().toISOString());
  
//   try {
//     // Find reminders that are due and not yet sent
//     const { data: reminders, error } = await supabase
//       .from('reminders')
//       .select('*')
//       .lte('reminder_time', new Date().toISOString())
//       .eq('is_sent', false);

//     if (error) {
//       console.error('Error fetching reminders:', error);
//       return;
//     }

//     if (!reminders || reminders.length === 0) {
//       console.log('No due reminders found.');
//       return;
//     }

//     console.log(`Found ${reminders.length} due reminder(s). Sending emails...`);

//     // Send emails for each due reminder
//     for (const reminder of reminders) {
//       console.log(`Sending reminder for: ${reminder.title} to ${reminder.user_email}`);
      
//       const emailSent = await sendReminderEmail(reminder);
      
//       if (emailSent) {
//         // Mark reminder as sent
//         const { error: updateError } = await supabase
//           .from('reminders')
//           .update({ is_sent: true })
//           .eq('id', reminder.id);
        
//         if (updateError) {
//           console.error(`Failed to update reminder ${reminder.id}:`, updateError);
//         } else {
//           console.log(`✅ Reminder ${reminder.id} marked as sent`);
//         }
//       }
//     }
    
//     console.log('Email check completed.');
//   } catch (error) {
//     console.error('Error in checkAndSendReminders:', error);
//   }
// }

// // Initialize the scheduler
// export function startScheduler() {
//   // Run every minute (for testing - change to '*/10 * * * *' for every 10 minutes in production)
//   cron.schedule('* * * * *', () => {
//     checkAndSendReminders();
//   });
  
//   console.log('✅ Email notification scheduler started (running every minute)');
  
//   // Also run immediately on startup
//   checkAndSendReminders();
// }

// // For testing: manually trigger a check
// export async function manualCheck() {
//   await checkAndSendReminders();
// }

import { createClient } from '@supabase/supabase-js';
import { sendSMSReminder } from './sms';
import { sendReminderEmail } from './email';
import { supabase } from './supabase';
// import { sendReminderEmail } from './email';
// import { sendSMSReminder } from './sms';
// import cron from 'node-cron';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  reminder_time: string;
  user_email: string;
  phone_number?: string; // Optional: if you add phone number field
  is_sent: boolean;
}

async function checkAndSendReminders() {
  console.log('🕐 Checking for due reminders...', new Date().toISOString());
  
  try {
    // Find reminders that are due and not yet sent
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('reminder_time', new Date().toISOString())
      .eq('is_sent', false);

    if (error) {
      console.error('Error fetching reminders:', error);
      return;
    }

    if (!reminders || reminders.length === 0) {
      console.log('No due reminders found.');
      return;
    }

    console.log(`📨 Found ${reminders.length} due reminder(s). Sending notifications...`);

    // Send notifications for each due reminder
    for (const reminder of reminders) {
      console.log(`\n📌 Processing: "${reminder.title}" for ${reminder.user_email}`);
      
      let emailSent = false;
      let smsSent = false;
      
      // Send Email
      console.log(`📧 Sending email to ${reminder.user_email}...`);
      emailSent = await sendReminderEmail(reminder);
      
      // Send SMS if phone number is available
      if (reminder.phone_number) {
        console.log(`📱 Sending SMS to ${reminder.phone_number}...`);
        smsSent = await sendSMSReminder(reminder, reminder.phone_number);
      } else {
        console.log(`📱 No phone number provided for SMS`);
        smsSent = true; // Skip if no phone number
      }
      
      // Mark as sent if at least one notification succeeded
      if (emailSent && smsSent) {
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ 
            is_sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
        
        if (updateError) {
          console.error(`Failed to update reminder ${reminder.id}:`, updateError);
        } else {
          console.log(`✅ Reminder ${reminder.id} marked as sent`);
        }
      } else if (emailSent) {
        console.log(`⚠️ Only email was sent for reminder ${reminder.id}`);
      } else if (smsSent) {
        console.log(`⚠️ Only SMS was sent for reminder ${reminder.id}`);
      } else {
        console.log(`❌ Failed to send any notifications for reminder ${reminder.id}`);
      }
    }
    
    console.log('\n✅ Notification check completed.\n');
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

// Initialize the scheduler
export async function manualCheck() {
  await checkAndSendReminders();
}

// Note: Scheduler functionality is now handled server-side via /api/scheduler or /api/cron
// Use Vercel Cron Jobs or external cron service to call these endpoints regularly

