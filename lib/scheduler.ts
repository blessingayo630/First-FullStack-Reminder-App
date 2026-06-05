/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendSMSReminder } from './sms';

import { sendReminderEmail } from './email';
import { supabaseService as supabase } from './supabase';


interface ParentReminder {
  id: number;
  title: string;
  user_email: string;
  phone_number: string | null;
  is_enabled: boolean;
}

interface ReminderItem {
  id: number;
  reminder_id: number;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  is_sent: boolean;
  is_enabled: boolean;
  parent?: ParentReminder | null;
}

function calculateReminderTime(
  dueDateISO: string,
  remindBefore: number,
  remindUnit: string
) {
  const dueDate = new Date(dueDateISO);
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
      reminderTime.setDate(reminderTime.getDate() - remindBefore * 7);
      break;
    case 'months':
      reminderTime.setMonth(reminderTime.getMonth() - remindBefore);
      break;
  }

  return reminderTime;
}

async function checkAndSendReminders() {
  console.log('🕐 Checking for due reminders...', new Date().toISOString());

  try {
    // Fetch enabled reminder items that haven't been sent, and join parent reminder fields.
    const { data: items, error } = await supabase
      .from('reminder_items')
      .select(`
        *,
        reminders (
          id,
          title,
          user_email,
          phone_number,
          is_enabled
        )
      `)
      .eq('is_sent', false)
      .eq('is_enabled', true);

    if (error) {
      console.error('Error fetching reminder items:', error);
      return;
    }

    if (!items || items.length === 0) {
      console.log('No due reminder items found.');
      return;
    }

    const now = new Date();
    console.log(`📨 Found ${items.length} pending reminder item(s). Processing...`);

for (const item of items as ReminderItem[]) {
      const parent = ((item as any).reminders as ParentReminder | null) ?? null;
      if (!parent) {
        console.log(`⏭️ No parent reminder found for item ${item.id}`);
        continue;
      }

      if (!parent.is_enabled) {
        console.log(`⏭️ Parent reminder disabled for item ${item.id}`);
        continue;
      }

      const reminderTime = calculateReminderTime(
        item.due_date,
        item.remind_before,
        item.remind_unit
      );

      // Skip until due.
      if (now < reminderTime) {
        console.log(`⏭️ Not time yet for item ${item.id}`);
        continue;
      }

      // Optimistic lock to avoid duplicates.
      const { data: lockData } = await supabase
        .from('reminder_items')
        .update({ is_sent: true })
        .eq('id', item.id)
        .eq('is_sent', false)
        .select()
        .single();

      if (!lockData) {
        console.log(`⏭️ Item ${item.id} already processed`);
        continue;
      }

      // Build a payload compatible with sendReminderEmail/sendSMSReminder.
      const reminderForNotification = {
        id: parent.id,
        title: parent.title,
        description: item.description || '',
        due_date: item.due_date,
        remind_before: item.remind_before,
        remind_unit: item.remind_unit,
        user_email: parent.user_email,
        phone_number: parent.phone_number || undefined,
      };

      let emailSent = false;
      let smsSent = false;

      // Email
      try {
        console.log(`📧 Sending email to ${reminderForNotification.user_email}...`);
        emailSent = await sendReminderEmail(reminderForNotification as any);
      } catch (err) {
        console.error(`❌ Email error for item ${item.id}`, err);
        await supabase.from('reminder_items').update({ is_sent: false }).eq('id', item.id);
      }

      // SMS
      if (parent.phone_number) {
        try {
          console.log(`📱 Sending SMS to ${parent.phone_number}...`);
          smsSent = await sendSMSReminder(
            reminderForNotification as any,
            parent.phone_number
          );
        } catch (err) {
          console.error(`❌ SMS error for item ${item.id}`, err);
        }
      } else {
        smsSent = true;
        console.log(`📱 No phone number provided for item ${item.id}`);
      }

      if (emailSent || smsSent) {
        console.log(`✅ Item ${item.id} processed successfully`);
      } else {
        console.log(`❌ Failed to send notifications for item ${item.id}`);
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

// Note: Scheduler functionality is now handled server-side via /api/cron
// Use Vercel Cron Jobs or external cron service to call this endpoint regularly

