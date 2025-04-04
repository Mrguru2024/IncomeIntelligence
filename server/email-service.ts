import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY environment variable is not set. Email notifications will not work.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Cannot send email: RESEND_API_KEY is not set');
      return false;
    }
    
    // Fix for Resend API typing - handle optional fields properly
    const emailData: any = {
      from: params.from,
      to: params.to,
      subject: params.subject,
    };
    
    // Only add text and html if they exist
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('Resend email error:', error);
      return false;
    }
    
    console.log('Email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Utility function for sending reminder emails
export async function sendReminderEmail(
  to: string,
  title: string,
  message: string,
  reminderDate: Date
): Promise<boolean> {
  const formattedDate = reminderDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #4f46e5; margin-bottom: 20px;">Financial Reminder</h2>
    <h3 style="margin-bottom: 15px;">${title}</h3>
    <p style="margin-bottom: 25px; color: #555;">${message}</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold;">Date: ${formattedDate}</p>
    </div>
    <p style="color: #666; font-size: 0.9em;">This is an automated reminder from your financial management application.</p>
  </div>
  `;
  
  return sendEmail({
    to,
    from: 'notifications@yourdomain.com', // Replace with your verified domain in Resend
    subject: `Reminder: ${title}`,
    html,
    text: `${title}\n\n${message}\n\nDate: ${formattedDate}\n\nThis is an automated reminder from your financial management application.`
  });
}

// Utility function for sending general notifications
export async function sendNotificationEmail(
  to: string,
  title: string,
  message: string,
  type: string = 'info'
): Promise<boolean> {
  // Define colors for different notification types
  const colors = {
    info: '#3b82f6',     // blue
    success: '#10b981',  // green
    warning: '#f59e0b',  // amber
    reminder: '#8b5cf6'  // purple
  };
  
  const typeColor = colors[type as keyof typeof colors] || colors.info;
  
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: ${typeColor}; margin-bottom: 20px;">Financial Notification</h2>
    <h3 style="margin-bottom: 15px;">${title}</h3>
    <p style="margin-bottom: 25px; color: #555;">${message}</p>
    <p style="color: #666; font-size: 0.9em;">This is an automated notification from your financial management application.</p>
  </div>
  `;
  
  return sendEmail({
    to,
    from: 'notifications@yourdomain.com', // Replace with your verified domain in Resend
    subject: `${title}`,
    html,
    text: `${title}\n\n${message}\n\nThis is an automated notification from your financial management application.`
  });
}