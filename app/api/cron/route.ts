
// // ✅ ADD THIS AS THE VERY FIRST LINE - Force timezone to Africa/Lagos
// process.env.TZ = 'Africa/Lagos';
  
// // app/api/cron/route.ts
// import { NextResponse } from 'next/server';
// import { Resend } from 'resend';
// import { supabaseService } from '@/lib/supabase';
// import { sendSMSReminder } from '@/lib/sms';

// // **** THE FIX: Force the Node.js Runtime ****
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// const supabase = supabaseService;
// const resend = new Resend(process.env.RESEND_API_KEY);
// if (!process.env.RESEND_API_KEY) {
//   console.error('❌ RESEND_API_KEY is missing!');
// }
    

// export async function GET(request: Request) {
//   try {
//     console.log('🕐 Cron job: Checking for due reminders...');

//     // Use ISO string for consistent comparison with stored dates
//     const nowISO = new Date().toISOString();

//     const { data: reminders, error } = await supabase
//       .from('reminders')
//       .select('*')
//       .lte('reminder_time', nowISO)
//       .eq('is_sent', false);

//     if (error) {
//       console.error('Supabase query error:', error);
//       throw error;
//     }

//     let sent = 0;
//     for (const reminder of reminders || []) {
//       console.log(`📧 Attempting to send notifications for reminder ${reminder.id}`);
      
//       let emailSent = false;
//       let smsSent = false;

//       // 1. Send email using Resend
//       try {
//         const { data, error: emailError } = await resend.emails.send({
//           from: 'Reminder App <onboarding@resend.dev>',
//           to: [reminder.user_email],
//           subject: `🔔 REMINDER: ${reminder.title}`,
//           html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//               <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
//               <style>
//                 body { font-family: 'Montserrat', sans-serif; background-color: #070912; color: #e9eefc; margin: 0; padding: 0; }
//                 .container { max-width: 600px; margin: 20px auto; padding: 30px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.045)); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; box-shadow: 0 0 28px rgba(255, 176, 32, 0.12); }
//                 h2 { color: #ffb020; font-weight: 700; font-size: 24px; margin-top: 0; }
//                 .content { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; border: 1px solid rgba(255, 176, 32, 0.2); margin: 20px 0; }
//                 .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 10px; }
//                 .desc { color: rgba(233, 238, 252, 0.7); margin-bottom: 20px; line-height: 1.6; }
//                 .footer { color: rgba(233, 238, 252, 0.4); font-size: 12px; text-align: center; margin-top: 30px; }
//                 .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
//                 .badge-due { background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; }
//                 .badge-remind { background: rgba(255, 176, 32, 0.12); border: 1px solid rgba(255, 176, 32, 0.3); color: #ffb020; margin-left: 10px; }
//               </style>
//             </head>
//             <body>
//               <div class="container">
//                 <h2>⏰ Reminder Alert</h2>
                
//                 <div class="content">
//                   <div class="title">${reminder.title}</div>
//                   ${reminder.description ? `<div class="desc">${reminder.description}</div>` : ''}
                  
//                   <div style="margin-top: 20px;">
//                     <span class="badge badge-due">📅 Due (Lagos): ${new Date(reminder.due_date).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}</span>
//                     <span class="badge badge-remind">⏰ ${reminder.remind_before} ${reminder.remind_unit} before</span>
//                   </div>
//                 </div>

//                 <div class="footer">
//                   This is an automated reminder from your Reminder App.<br>
//                   © 2026 Reminder App. All rights reserved.
//                 </div>
//               </div>
//             </body>
//             </html>
//           `,
//         });
        
//         if (!emailError) {
//           emailSent = true;
//           console.log(`✅ Email sent for reminder ${reminder.id}`);
//         } else {
//           console.error(`❌ Resend Error for reminder ${reminder.id}:`, JSON.stringify(emailError));
//         }
//       } catch (err) {
//         console.error(`❌ Email throw error for ${reminder.id}:`, err);
//       }

//       // 2. Send SMS if phone number exists
//       if (reminder.phone_number) {
//         try {
//           console.log(`📱 Attempting to send SMS to ${reminder.phone_number}`);
//           const smsResult = await sendSMSReminder(reminder, reminder.phone_number);
//           if (smsResult) {
//             smsSent = true;
//             console.log(`✅ SMS sent for reminder ${reminder.id}`);
//           }
//         } catch (err) {
//           console.error(`❌ SMS throw error for ${reminder.id}:`, err);
//         }
//       } else {
//         smsSent = true; // Mark as "sent" if no phone provided, so we can mark the reminder as processed
//       }

//       // Mark as sent if at least one succeeded (or no phone needed)
//       if (emailSent || (reminder.phone_number && smsSent)) {
//         const { error: updateError } = await supabase
//           .from('reminders')
//           .update({ is_sent: true })
//           .eq('id', reminder.id);
        
//         if (updateError) {
//           console.error(`❌ Failed to update is_sent for reminder ${reminder.id}:`, updateError);
//         } else {
//           sent++;
//           console.log(`✅ Reminder ${reminder.id} marked as fully processed`);
//         }
//       }
//     }

//     return NextResponse.json({
//       message: `Processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error('Cron job error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// ✅ FORCE LAGOS TIMEZONE
process.env.TZ = 'Africa/Lagos';

// app/api/cron/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';
import { sendSMSReminder } from '@/lib/sms';
import { sendReminderEmail } from '@/lib/email';
import admin from 'firebase-admin';


// ✅ FORCE NODE RUNTIME
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = supabaseService;

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is missing!');
}

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

export async function GET(request: Request) {
  try {
    console.log('🕐 Cron job started...');

    const nowISO = new Date().toISOString();

    // =========================
    // FETCH REMINDERS
    // =========================
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('reminder_time', nowISO)
      .eq('is_sent', false);

    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }

    let sent = 0;

    // =========================
    // LOOP REMINDERS
    // =========================
    for (const reminder of reminders || []) {
      console.log(
        `🔔 Processing reminder ${reminder.id}`
      );

      let emailSent = false;
      let smsSent = false;
      let pushSent = false;

      // =========================
      // 0. OPTIMISTIC LOCK: Mark as sent BEFORE sending to prevent race conditions
      // This prevents duplicate sends if cron runs multiple times
      // =========================
      const { data: lockData, error: lockError } = await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminder.id)
        .eq('is_sent', false)
        .select()
        .single();

      if (lockError || !lockData) {
        console.log(`⏭️ Reminder ${reminder.id} already being processed, skipping`);
        continue;
      }

      // =========================
      // 1. SEND EMAIL (use shared template)
      // =========================
      try {
        emailSent = await sendReminderEmail(reminder);

        if (emailSent) {
          console.log(`✅ Email sent for reminder ${reminder.id}`);
        } else {
          console.error(`❌ Email failed for reminder ${reminder.id}`);
          // Revert the lock since email failed
          await supabase
            .from('reminders')
            .update({ is_sent: false })
            .eq('id', reminder.id);
        }
      } catch (err) {
        console.error(`❌ Email throw error for ${reminder.id}`, err);
        // Revert the lock since email failed
        await supabase
          .from('reminders')
          .update({ is_sent: false })
          .eq('id', reminder.id);
      }


      // =========================
      // 2. SEND SMS
      // =========================
      if (reminder.phone_number) {
        try {
          console.log(
            `📱 Sending SMS to ${reminder.phone_number}`
          );

          const smsResult =
            await sendSMSReminder(
              reminder,
              reminder.phone_number
            );

          if (smsResult) {
            smsSent = true;

            console.log(
              `✅ SMS sent for reminder ${reminder.id}`
            );
          }
        } catch (err) {
          console.error(
            `❌ SMS error for ${reminder.id}`,
            err
          );
        }
      } else {
        smsSent = true;
      }

      // =========================
      // 3. SEND PUSH NOTIFICATION (using Firebase Admin SDK - HTTP v1 API)
      // =========================
      if (reminder.fcm_token) {
        try {
          console.log(`📲 Sending push notification...`);

          const message = {
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
          };

          const result = await admin.messaging().send(message);

          console.log(`✅ Push notification sent: ${result}`);
          pushSent = true;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`❌ Push notification error for ${reminder.id}:`, errorMessage);
          // Don't treat as fatal - continue processing
        }
      }

      // =========================
      // 4. TRACK SUCCESS
      // =========================
      if (emailSent || smsSent || pushSent) {
        sent++;
        console.log(`✅ Reminder ${reminder.id} fully processed`);
      }
    }

    // =========================
    // FINAL RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

      message: `Processed ${
        reminders?.length || 0
      } reminders`,

      sent,

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}