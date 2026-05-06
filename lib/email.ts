// import nodemailer from 'nodemailer';

// // Create email transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Use Gmail App Password, not your regular password
//   },
// });

// interface Reminder {
//   id: number;
//   title: string;
//   description: string;
//   due_date: string;
//   remind_before: number;
//   remind_unit: string;
//   user_email: string;
// }

// export async function sendReminderEmail(reminder: Reminder) {
//   try {
//     const dueDate = new Date(reminder.due_date).toLocaleString();
    
//     const mailOptions = {
//       from: `"Reminder App" <${process.env.EMAIL_USER}>`,
//       to: reminder.user_email,
//       subject: `🔔 REMINDER: ${reminder.title}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//           <h2 style="color: #2563eb;">⏰ Reminder Alert!</h2>
          
//           <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #1f2937;">${reminder.title}</h3>
            
//             ${reminder.description ? `<p style="color: #4b5563;">${reminder.description}</p>` : ''}
            
//             <hr style="margin: 15px 0; border-color: #e5e7eb;" />
            
//             <p><strong>📅 Due Date:</strong> ${dueDate}</p>
//             <p><strong>⏰ Reminder:</strong> ${reminder.remind_before} ${reminder.remind_unit} before due date</p>
//           </div>
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated reminder from your Reminder App.
//           </p>
          
//           <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
//              style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
//             View All Reminders
//           </a>
//         </div>
//       `,
//       text: `
//         REMINDER: ${reminder.title}
        
//         ${reminder.description ? `${reminder.description}\n\n` : ''}
//         Due Date: ${dueDate}
//         Reminder: ${reminder.remind_before} ${reminder.remind_unit} before due date
        
//         View all reminders at: ${process.env.NEXT_PUBLIC_APP_URL}
//       `,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${reminder.user_email}: ${info.messageId}`);
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// }

import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  user_email: string;
}

export async function sendReminderEmail(reminder: Reminder) {
  try {
       if (!reminder.user_email) {
      console.error('❌ No recipient email address found for reminder:', reminder.id);
      return false;
    }
    const dueDate = new Date(reminder.due_date).toLocaleString();
    
    const mailOptions = {
      from: `"Reminder App" <${process.env.EMAIL_USER}>`,
      to: reminder.user_email,
      subject: `🔔 REMINDER: ${reminder.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder Notification</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 64px; margin-bottom: 16px;">⏰</div>
                <h1 style="color: #1a202c; font-size: 32px; font-weight: 800; margin: 0;">Reminder Alert!</h1>
                <p style="color: #718096; font-size: 16px; margin-top: 8px;">Don't miss this important event</p>
              </div>
              
              <!-- Content -->
              <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">${reminder.title}</h2>
                
                ${reminder.description ? `<p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${reminder.description}</p>` : ''}
                
                <div style="border-top: 2px solid #e2e8f0; margin: 16px 0;"></div>
                
                <div style="margin-top: 16px;">
                  <p style="margin: 8px 0;"><strong style="color: #2d3748;">📅 Due Date:</strong> <span style="color: #4a5568;">${dueDate}</span></p>
                  <p style="margin: 8px 0;"><strong style="color: #2d3748;">⏰ Reminder:</strong> <span style="color: #4a5568;">${reminder.remind_before} ${reminder.remind_unit} before due date</span></p>
                </div>
              </div>
              
              <!-- Button -->
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                   style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
                  View All Reminders
                </a>
              
              <!-- Footer -->
              <p style="text-align: center; color: #a0aec0; font-size: 12px; margin: 0;">
                This is an automated reminder from your Reminder App.<br>
                You received this because you set a reminder for this event.
              </p>
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
        
        View all reminders at: ${process.env.NEXT_PUBLIC_APP_URL}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${reminder.user_email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}