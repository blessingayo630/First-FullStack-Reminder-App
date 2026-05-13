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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb;">⏰ Reminder Alert!</h2>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${reminder.title}</h3>

            ${reminder.description ? `<p style="color: #4b5563;">${reminder.description}</p>` : ''}

            <hr style="margin: 15px 0; border-color: #e5e7eb;" />

            <p><strong>📅 Due Date:</strong> ${dueDate}</p>
            <p><strong>⏰ Reminder:</strong> ${reminder.remind_before} ${reminder.remind_unit} before due date</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated reminder from your Reminder App.
          </p>
        </div>
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

