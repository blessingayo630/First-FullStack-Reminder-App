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
        <body style="margin:0;padding:0;background-color:#e5e7eb;font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e5e7eb;padding:30px 0;">
        <tr>
        <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">

        <!-- HEADER -->
        <tr>
        <td align="center" style="background-color:#2563eb;padding:40px 20px;">

        <div style="font-size:50px;margin-bottom:10px;">
        🔔
        </div>

        <h1 style="
        margin:0;
        font-size:30px;
        font-weight:bold;
        color:#ffffff;
        font-family:Arial,sans-serif;
        ">
        Reminder Alert
        </h1>

        <p style="
        margin-top:12px;
        font-size:16px;
        line-height:24px;
        color:#dbeafe;
        font-family:Arial,sans-serif;
        ">
        Your scheduled reminder is here.
        </p>

        </td>
        </tr>

        <!-- BODY -->
        <tr>
        <td style="padding:40px 35px;">

        <p style="
        margin:0 0 10px 0;
        font-size:13px;
        font-weight:bold;
        color:#2563eb;
        letter-spacing:1px;
        font-family:Arial,sans-serif;
        ">
        UPCOMING TASK
        </p>

        <h2 style="
        margin:0 0 20px 0;
        font-size:28px;
        line-height:36px;
        color:#111827;
        font-family:Arial,sans-serif;
        ">
        ${reminder.title}
        </h2>

        ${
          reminder.description
            ? `
        <p style="
        margin:0 0 30px 0;
        font-size:16px;
        line-height:28px;
        color:#374151;
        font-family:Arial,sans-serif;
        ">
        ${reminder.description}
        </p>
        `
            : ''
        }

        <!-- DUE DATE -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f3f4f6;border:1px solid #d1d5db;margin-bottom:15px;">

        <tr>
        <td style="padding:18px;">

        <p style="
        margin:0 0 8px 0;
        font-size:12px;
        font-weight:bold;
        color:#6b7280;
        letter-spacing:1px;
        font-family:Arial,sans-serif;
        ">
        DUE DATE
        </p>

        <p style="
        margin:0;
        font-size:16px;
        font-weight:bold;
        color:#111827;
        font-family:Arial,sans-serif;
        ">
        📅 ${dueDate}
        </p>

        </td>
        </tr>

        </table>

        <!-- REMINDER -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f3f4f6;border:1px solid #d1d5db;">

        <tr>
        <td style="padding:18px;">

        <p style="
        margin:0 0 8px 0;
        font-size:12px;
        font-weight:bold;
        color:#6b7280;
        letter-spacing:1px;
        font-family:Arial,sans-serif;
        ">
        REMINDER TIME
        </p>

        <p style="
        margin:0;
        font-size:16px;
        font-weight:bold;
        color:#111827;
        font-family:Arial,sans-serif;
        ">
        ⏰ ${reminder.remind_before} ${reminder.remind_unit} before
        </p>

        </td>
        </tr>

        </table>

        <!-- BUTTON -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td align="center" style="padding-top:35px;">

        <a href="${process.env.NEXT_PUBLIC_APP_URL}"
        style="
        background-color:#2563eb;
        color:#ffffff;
        text-decoration:none;
        padding:14px 30px;
        font-size:16px;
        font-weight:bold;
        display:inline-block;
        font-family:Arial,sans-serif;
        ">
        Open Reminder App
        </a>

        </td>
        </tr>
        </table>

        </td>
        </tr>

        <!-- FOOTER -->
        <tr>
        <td align="center"
        style="
        background-color:#f3f4f6;
        padding:25px 20px;
        ">

        <p style="
        margin:0;
        font-size:13px;
        line-height:22px;
        color:#00000;
        font-family:Arial,sans-serif;
        ">
        This is an automated notification from Reminder App.<br>
        © 2026 Reminder App. All rights reserved.
        </p>

        </td>
        </tr>

        </table>

        </td>
        </tr>
        </table>

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

