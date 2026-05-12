// import { NextResponse } from 'next/server';
// import { sendReminderEmail } from '@/lib/email';
// import { supabaseService } from '@/lib/supabase';

// const supabase = supabaseService;

// export async function GET(request: Request) {
//   // Verify cron secret to prevent unauthorized access.
//   // Vercel Cron jobs typically won’t send custom Authorization headers,
//   // so we only enforce this check when BOTH:
//   // - CRON_SECRET is set
//   // - AND an Authorization header is actually present.
//   const authHeader = request.headers.get('authorization');
//   const cronSecret = process.env.CRON_SECRET;

//   if (process.env.NODE_ENV !== 'development' && cronSecret && authHeader) {
//     if (authHeader !== `Bearer ${cronSecret}`) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//   }
  
  
//   try {
//     console.log('🕐 Cron job: Checking for due reminders...');
    
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
//       message: `Processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Cron job error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// ✅ ADD THIS AS THE VERY FIRST LINE - Force timezone to Africa/Lagos
process.env.TZ = 'Africa/Lagos';

// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';

// **** THE FIX: Force the Node.js Runtime ****
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = supabaseService;
const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is missing!');
}
    

export async function GET(request: Request) {
  try {
    console.log('🕐 Cron job: Checking for due reminders...');

    // Use ISO string for consistent comparison with stored dates
    const nowISO = new Date().toISOString();

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('reminder_time', nowISO)
      .eq('is_sent', false);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    let sent = 0;
    for (const reminder of reminders || []) {
      console.log(`📧 Attempting to send email to ${reminder.user_email} for reminder ${reminder.id}`);
      
      // Send email using Resend
      const { data, error: emailError } = await resend.emails.send({
        from: 'Reminder App <onboarding@resend.dev>',
        to: [reminder.user_email],
        subject: `🔔 REMINDER: ${reminder.title}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>🔔 Reminder: ${reminder.title}</h2>
                ${reminder.description ? `<p>${reminder.description}</p>` : ''}
                <p><strong>Due:</strong> ${new Date(reminder.due_date).toLocaleString()}</p>
               </div>`,
      });

      if (!emailError) {
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ is_sent: true })
          .eq('id', reminder.id);
        
        if (updateError) {
          console.error(`❌ Failed to update is_sent for reminder ${reminder.id}:`, updateError);
        } else {
          sent++;
          console.log(`✅ Email sent and marked as sent for reminder ${reminder.id}`);
        }
      } else {
        console.error(`❌ Resend Error for reminder ${reminder.id}:`, JSON.stringify(emailError));
        // Common Resend error: "To send emails to this recipient, you must first verify a domain..."
        // This happens if sending to an email that isn't the account owner on a free plan.
      }
    }

    return NextResponse.json({
      message: `Processed ${reminders?.length || 0} reminders, sent ${sent} emails`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}         