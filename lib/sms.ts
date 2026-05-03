import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  user_email: string;
}

export async function sendSMSReminder(reminder: Reminder, phoneNumber: string) {
  try {
    const dueDate = new Date(reminder.due_date).toLocaleString();
    
    const message = await client.messages.create({
      body: `🔔 REMINDER: ${reminder.title}\n\nDue: ${dueDate}\nReminder: ${reminder.remind_before} ${reminder.remind_unit} before\n\nView at: ${process.env.NEXT_PUBLIC_APP_URL}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    
    console.log(`✅ SMS sent to ${phoneNumber}: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return false;
  }
}

// For African providers like Africa's Talking (alternative to Twilio)
export async function sendSMSAfricaTalking(reminder: Reminder, phoneNumber: string) {
  // Format phone number for Africa (e.g., 2547XXXXXXXX for Kenya)
  const formattedNumber = phoneNumber.startsWith('0') 
    ? `254${phoneNumber.substring(1)}` 
    : phoneNumber;
  
  const username = process.env.AFRICAS_TALKING_USERNAME;
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  
  const url = `https://api.africastalking.com/version1/messaging`;
  
  const params = new URLSearchParams({
    username: username!,
    to: formattedNumber,
    message: `🔔 REMINDER: ${reminder.title}\nDue: ${new Date(reminder.due_date).toLocaleString()}\nView: ${process.env.NEXT_PUBLIC_APP_URL}`,
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey!,
      },
      body: params,
    });
    
    const data = await response.json();
    console.log(`✅ SMS sent via Africa's Talking:`, data);
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS via Africa\'s Talking:', error);
    return false;
  }
}