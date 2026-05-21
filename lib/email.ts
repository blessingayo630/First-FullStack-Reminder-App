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
      // html: `
      //   <!DOCTYPE html>
      //   <html>
      //   <head>
      //     <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      //     <style>
      //       body { font-family: 'Montserrat', sans-serif; background-color: #070912; color: #e9eefc; margin: 0; padding: 0; }
      //       .container { max-width: 600px; margin: 20px auto; padding: 30px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.045)); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; box-shadow: 0 0 28px rgba(255, 176, 32, 0.12); }
      //       h2 { color: #ffb020; font-weight: 700; font-size: 24px; margin-top: 0; }
      //       .content { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; border: 1px solid rgba(255, 176, 32, 0.2); margin: 20px 0; }
      //       .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 10px; }
      //       .desc { color: rgba(233, 238, 252, 0.7); margin-bottom: 20px; line-height: 1.6; }
      //       .footer { color: rgba(233, 238, 252, 0.4); font-size: 12px; text-align: center; margin-top: 30px; }
      //       .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      //       .badge-due { background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; }
      //       .badge-remind { background: rgba(255, 176, 32, 0.12); border: 1px solid rgba(255, 176, 32, 0.3); color: #ffb020; margin-left: 10px; }
      //     </style>
      //   </head>
      //   <body>
      //     <div class="container">
      //       <h2>⏰ Reminder Alert</h2>
            
      //       <div class="content">
      //         <div class="title">${reminder.title}</div>
      //         ${reminder.description ? `<div class="desc">${reminder.description}</div>` : ''}
              
      //         <div style="margin-top: 20px;">
      //           <span class="badge badge-due">📅 Due: ${dueDate}</span>
      //           <span class="badge badge-remind">⏰ ${reminder.remind_before} ${reminder.remind_unit} before</span>
      //         </div>
      //       </div>

      //       <div class="footer">
      //         This is an automated reminder from your Reminder App.<br>
      //         © 2026 Reminder App. All rights reserved.
      //       </div>
      //     </div>
      //   </body>
      //   </html>
      // `,
      
 html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reminder Email</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f7fb">
<tr>
<td align="center" style="padding:40px 15px;">

  <table width="600" border="0" cellspacing="0" cellpadding="0"
    style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <tr>
      <td
        style="
          background:linear-gradient(135deg,#ffb020,#ff8c00);
          padding:45px 30px;
          text-align:center;
        "
      >
        <div style="font-size:52px;margin-bottom:12px;">
          ⏰
        </div>

        <div style="font-size:32px;font-weight:bold;color:#ffffff;">
          Reminder Alert
        </div>

        <div
          style="
            margin-top:14px;
            font-size:16px;
            line-height:1.6;
            color:rgba(255,255,255,0.9);
          "
        >
          Stay organized and never miss an important task.
        </div>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 35px;">

        <div
          style="
            display:inline-block;
            background:#fff7e8;
            color:#ff8c00;
            font-size:12px;
            font-weight:bold;
            padding:8px 14px;
            border-radius:30px;
            margin-bottom:22px;
            letter-spacing:0.5px;
          "
        >
          UPCOMING REMINDER
        </div>

        <div
          style="
            font-size:30px;
            font-weight:bold;
            color:#111827;
            line-height:1.4;
            margin-bottom:20px;
          "
        >
          ${reminder.title}
        </div>

        ${
          reminder.description
            ? `
              <div
                style="
                  font-size:16px;
                  line-height:1.8;
                  color:#4b5563;
                  margin-bottom:30px;
                "
              >
                ${reminder.description}
              </div>
            `
            : ''
        }

        <!-- INFO CARD -->
        <table
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:14px;
            overflow:hidden;
          "
        >

          <tr>
            <td style="padding:22px;border-bottom:1px solid #e5e7eb;">

              <div
                style="
                  font-size:12px;
                  color:#6b7280;
                  text-transform:uppercase;
                  margin-bottom:8px;
                  font-weight:bold;
                  letter-spacing:0.6px;
                "
              >
                Due Date
              </div>

              <div
                style="
                  font-size:16px;
                  color:#111827;
                  font-weight:600;
                "
              >
                📅 ${dueDate}
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding:22px;">

              <div
                style="
                  font-size:12px;
                  color:#6b7280;
                  text-transform:uppercase;
                  margin-bottom:8px;
                  font-weight:bold;
                  letter-spacing:0.6px;
                "
              >
                Reminder Time
              </div>

              <div
                style="
                  font-size:16px;
                  color:#111827;
                  font-weight:600;
                "
              >
                🔔 ${reminder.remind_before} ${reminder.remind_unit} before due date
              </div>

            </td>
          </tr>

        </table>

        <!-- BUTTON -->
        <div style="text-align:center;margin-top:40px;">

          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}"
            style="
              display:inline-block;
              background:#ff8c00;
              color:#ffffff;
              text-decoration:none;
              padding:16px 34px;
              border-radius:12px;
              font-size:16px;
              font-weight:bold;
            "
          >
            Open Reminder App
          </a>

        </div>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td
        style="
          padding:28px 30px;
          background:#f9fafb;
          text-align:center;
          font-size:13px;
          line-height:1.8;
          color:#6b7280;
        "
      >
        This is an automated notification from Reminder App.<br>
        © 2026 Reminder App. All rights reserved.
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

