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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #0b1020;
      padding: 30px 15px;
      color: #ffffff;
    }

    .wrapper {
      max-width: 620px;
      margin: auto;
    }

    .container {
      background: #111827;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow:
        0 10px 40px rgba(0,0,0,0.45),
        0 0 0 1px rgba(255,255,255,0.03);
    }

    .hero {
      background:
        radial-gradient(circle at top right, rgba(255,176,32,0.35), transparent 30%),
        linear-gradient(135deg, #1e293b, #0f172a);
      padding: 45px 35px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .hero-icon {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      backdrop-filter: blur(10px);
    }

    .hero h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 10px;
      color: #ffffff;
    }

    .hero p {
      color: rgba(255,255,255,0.7);
      font-size: 15px;
      line-height: 1.6;
    }

    .content {
      padding: 35px;
    }

    .card {
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.06),
        rgba(255,255,255,0.03)
      );
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 28px;
    }

    .label {
      color: #ffb020;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 18px;
      line-height: 1.3;
      color: #ffffff;
    }

    .description {
      color: rgba(255,255,255,0.72);
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 30px;
    }

    .info-grid {
      display: grid;
      gap: 14px;
    }

    .info-box {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 16px;
    }

    .info-title {
      color: rgba(255,255,255,0.55);
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .info-value {
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.5;
    }

    .button-wrap {
      text-align: center;
      margin-top: 35px;
    }

    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #ffb020, #ff8c00);
      color: #111827 !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 10px 25px rgba(255,176,32,0.35);
    }

    .footer {
      padding: 28px 35px;
      border-top: 1px solid rgba(255,255,255,0.06);
      text-align: center;
      color: rgba(255,255,255,0.45);
      font-size: 13px;
      line-height: 1.7;
    }

    @media only screen and (max-width: 600px) {
      .hero {
        padding: 35px 24px;
      }

      .content {
        padding: 24px;
      }

      .title {
        font-size: 24px;
      }

      .hero h1 {
        font-size: 28px;
      }
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="container">

      <div class="hero">
        <div class="hero-icon">⏰</div>

        <h1>Reminder Alert</h1>

        <p>
          You scheduled a reminder and the time is almost here.
          Stay organized and never miss an important task.
        </p>
      </div>

      <div class="content">

        <div class="card">

          <div class="label">
            Upcoming Reminder
          </div>

          <div class="title">
            ${reminder.title}
          </div>

          ${
            reminder.description
              ? `
                <div class="description">
                  ${reminder.description}
                </div>
              `
              : ''
          }

          <div class="info-grid">

            <div class="info-box">
              <div class="info-title">
                Due Date
              </div>

              <div class="info-value">
                📅 ${dueDate}
              </div>
            </div>

            <div class="info-box">
              <div class="info-title">
                Reminder Time
              </div>

              <div class="info-value">
                🔔 ${reminder.remind_before} ${reminder.remind_unit} before due date
              </div>
            </div>

          </div>

          <div class="button-wrap">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">
              Open Reminder App
            </a>
          </div>

        </div>

      </div>

      <div class="footer">
        This is an automated notification from Reminder App.<br />
        © 2026 Reminder App. All rights reserved.
      </div>

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

