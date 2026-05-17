import { Resend } from 'resend';

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  user_email: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(reminder: Reminder) {
  try {
    if (!reminder.user_email) {
      console.error('❌ No recipient email address found for reminder:', reminder.id);
      return false;
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing!');
      return false;
    }

    console.log(`📧 Preparing email for: ${reminder.user_email}`);

    const dueDate = new Date(reminder.due_date).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

    const { error } = await resend.emails.send({
      from: 'Reminder App <onboarding@resend.dev>',
      to: [reminder.user_email],
      subject: `🔔 REMINDER: ${reminder.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Montserrat', sans-serif; background-color: #070912; color: #e9eefc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 30px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.045)); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; box-shadow: 0 0 28px rgba(255, 176, 32, 0.12); }
            h2 { color: #ffb020; font-weight: 700; font-size: 24px; margin-top: 0; }
            .content { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; border: 1px solid rgba(255, 176, 32, 0.2); margin: 20px 0; }
            .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 10px; }
            .desc { color: rgba(233, 238, 252, 0.7); margin-bottom: 20px; line-height: 1.6; }
            .footer { color: rgba(233, 238, 252, 0.4); font-size: 12px; text-align: center; margin-top: 30px; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .badge-due { background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; }
            .badge-remind { background: rgba(255, 176, 32, 0.12); border: 1px solid rgba(255, 176, 32, 0.3); color: #ffb020; margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>⏰ Reminder Alert</h2>
            
            <div class="content">
              <div class="title">${reminder.title}</div>
              ${reminder.description ? `<div class="desc">${reminder.description}</div>` : ''}
              
              <div style="margin-top: 20px;">
                <span class="badge badge-due">📅 Due: ${dueDate}</span>
                <span class="badge badge-remind">⏰ ${reminder.remind_before} ${reminder.remind_unit} before</span>
              </div>
            </div>

            <div class="footer">
              This is an automated reminder from your Reminder App.<br>
              © 2026 Reminder App. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        REMINDER: ${reminder.title}

        ${reminder.description ? `${reminder.description}\n\n` : ''}
        Due Date: ${dueDate}
        Reminder: ${reminder.remind_before} ${reminder.remind_unit} before due date
      `,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }

    console.log(`✅ Email sent to ${reminder.user_email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

