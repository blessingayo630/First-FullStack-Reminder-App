process.env.TZ = 'Africa/Lagos';

import { NextResponse } from 'next/server';
import { supabaseService as supabaseService } from '@/lib/supabase';
import { sendSMSReminder, sendSMSAfricaTalking } from '@/lib/sms';
import { sendReminderEmail } from '@/lib/email';
import admin from 'firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = supabaseService;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

function computeNextDueDate({
  dueDateISO,
  repeatMode,
  customWeekdays,
}: {
  dueDateISO: string;
  repeatMode: 'once' | 'daily' | 'mon_fri' | 'custom' | null;
  customWeekdays: number[] | null;
}): string | null {
  if (!repeatMode || repeatMode === 'once') return null;

  // Scheduling must not drift across day boundaries.
  // We interpret `dueDateISO` in Africa/Lagos local time, compute the next
  // occurrence date (and keep the same time-of-day), then return ISO.
  const due = new Date(dueDateISO);
  if (Number.isNaN(due.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(due);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  if ([year, month, day, hour, minute, second].some((v) => Number.isNaN(v))) return null;

  // Create a UTC timestamp representing the same wall-clock time in Lagos.
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // UI uses 1=Mon..7=Sun
  const isMatchCustomUI = (uiDay: number) => (customWeekdays ?? []).includes(uiDay);

  const getLagosUIWeekday = (candidateUTC: Date): number | null => {
    const lagosParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'short',
    }).formatToParts(candidateUTC);

    const weekdayShort = lagosParts.find((p) => p.type === 'weekday')?.value;
    const mapShortToUI: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };

    return weekdayShort ? mapShortToUI[weekdayShort] ?? null : null;
  };

  const shouldTake = (candidateUTC: Date) => {
    const ui = getLagosUIWeekday(candidateUTC);
    if (!ui) return false;

    if (repeatMode === 'daily') return true;
    if (repeatMode === 'mon_fri') return ui >= 1 && ui <= 5;
    if (repeatMode === 'custom') return isMatchCustomUI(ui);
    return false;
  };

  // Find next matching day starting from +1 day
  for (let i = 1; i <= 3660; i++) {
    const next = new Date(start);
    next.setUTCDate(next.getUTCDate() + i);

    if (shouldTake(next)) return next.toISOString();
  }

  return null;
}

export async function GET() {
  try {
    console.log('🕐 Cron job started...');

    const now = new Date();

    const { data: items, error } = await supabase
      .from('reminder_items')
      .select(`
        *,
        reminders (
          id,
          title,
          user_email,
          phone_number,
          is_enabled,
          fcm_token
        )
      `)
      .eq('is_sent', false)
      .or('is_enabled.eq.true,is_enabled.is.null');

    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }

    let sent = 0;

    for (const item of items || []) {
      console.log(`🔔 Processing item ${item.id}`);

      const reminder = item.reminders;

      if (!reminder) {
        console.log(`⏭️ No parent reminder found for item ${item.id}`);
        continue;
      }

      if (!reminder.is_enabled) {
        console.log(`⏭️ Parent reminder disabled for item ${item.id}`);
        continue;
      }

      const dueDate = new Date(item.due_date);
      const reminderTime = new Date(dueDate);

      // Compute reminderTime = due_date - remind_before*(unit)
      // (Keep this consistent with how you already fire reminders today.)
      switch (item.remind_unit) {
        case 'minutes':
          reminderTime.setUTCMinutes(reminderTime.getUTCMinutes() - (item.remind_before ?? 0));
          break;
        case 'hours':
          reminderTime.setUTCHours(reminderTime.getUTCHours() - (item.remind_before ?? 0));
          break;
        case 'days':
          reminderTime.setUTCDate(reminderTime.getUTCDate() - (item.remind_before ?? 0));
          break;
        default:
          break;
      }

      if (now.getTime() < reminderTime.getTime()) {
        console.log('⏭️ Not time yet (debug)', {
          item_id: item.id,
          due_date_raw: item.due_date,
          reminderTime_utc: isNaN(reminderTime.getTime()) ? null : reminderTime.toISOString(),
          now_utc: now.toISOString(),
          remind_before: item.remind_before,
          remind_unit: item.remind_unit,
        });
        continue;
      }

      // LOCK to prevent duplicates
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

      let emailSent = false;
      let smsSent = false;
      let pushSent = false;

      // EMAIL
      try {
        emailSent = await sendReminderEmail({
          id: reminder.id,
          title: reminder.title,
          description: item.description,
          due_date: item.due_date,
          remind_before: item.remind_before ?? 1,
          remind_unit: item.remind_unit ?? 'days',
          user_email: reminder.user_email,
        });

        if (!emailSent) {
          await supabase.from('reminder_items').update({ is_sent: false }).eq('id', item.id);
        }
      } catch (err) {
        console.error(`❌ Email error item ${item.id}`, err);
        await supabase.from('reminder_items').update({ is_sent: false }).eq('id', item.id);
      }

      // SMS (optional)
      if (reminder.phone_number) {
        try {
          let smsResult = false;

          if (process.env.AFRICAS_TALKING_API_KEY) {
            smsResult = await sendSMSAfricaTalking(reminder, reminder.phone_number);
          } else {
            smsResult = await sendSMSReminder(reminder, reminder.phone_number);
          }

          smsSent = smsResult;
        } catch (err) {
          console.error(`❌ SMS error item ${item.id}`, err);
        }
      } else {
        smsSent = true;
      }

      // PUSH (your note says you don't use it, but keep the existing behavior)
      if (reminder.fcm_token) {
        try {
          await admin.messaging().send({
            notification: {
              title: `🔔 ${reminder.title}`,
              body: reminder.description || 'Reminder Alert',
            },
            token: reminder.fcm_token,
            webpush: {
              fcmOptions: {
                link: process.env.NEXT_PUBLIC_APP_URL,
              },
            },
          });
          pushSent = true;
        } catch (err) {
          console.error(`❌ Push error item ${item.id}`, err);
        }
      }

      if (emailSent || smsSent || pushSent) {
        // Reschedule repeating reminders
        if (item.repeat_mode && item.repeat_mode !== 'once') {
          const nextDueDateISO = computeNextDueDate({
            dueDateISO: item.due_date,
            repeatMode: item.repeat_mode,
            customWeekdays: item.custom_weekdays,
          });

          if (nextDueDateISO) {
            await supabase
              .from('reminder_items')
              .update({ due_date: nextDueDateISO, is_sent: false })
              .eq('id', item.id);

            console.log(`🔁 Rescheduled item ${item.id} from ${item.due_date} -> ${nextDueDateISO}`);
          } else {
            await supabase.from('reminder_items').update({ is_sent: true }).eq('id', item.id);
          }
        }

        sent++;
      } else {
        await supabase.from('reminder_items').update({ is_sent: false }).eq('id', item.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${items?.length || 0} reminder items`,
      sent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

