import { Resend } from 'resend';

let resend: Resend;

export function initializeEmailClient() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY environment variable is not set. Email notifications will not work.");
    return;
  }
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Application constants
const APP_NAME = 'Stackr';
const APP_URL = process.env.NODE_ENV === 'production' 
  ? 'https://stackr.financial' 
  : 'http://localhost:5000';

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
    from: 'notifications@stackr.financial', // Replace with your verified domain in Resend
    subject: `Reminder: ${title}`,
    html,
    text: `${title}\n\n${message}\n\nDate: ${formattedDate}\n\nThis is an automated reminder from your financial management application.`
  });
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${APP_URL}/verify-email/${verificationToken}`;
  
  const subject = `${APP_NAME} - Verify Your Email Address`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to ${APP_NAME}!</h2>
      <p>Hello ${username},</p>
      <p>Thank you for creating an account with us. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste the following link into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>Thank you,<br>${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `
    Welcome to ${APP_NAME}!
    
    Hello ${username},
    
    Thank you for creating an account with us. Please verify your email address by visiting the link below:
    
    ${verificationUrl}
    
    If you didn't create an account, you can safely ignore this email.
    
    This link will expire in 24 hours.
    
    Thank you,
    ${APP_NAME} Team
  `;
  
  return sendEmail({
    to: email,
    from: 'notifications@stackr.financial',
    subject,
    html,
    text
  });
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password/${resetToken}`;
  
  const subject = `${APP_NAME} - Reset Your Password`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Reset Your Password</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>If the button doesn't work, copy and paste the following link into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>Thank you,<br>${APP_NAME} Team</p>
    </div>
  `;
  
  const text = `
    Reset Your Password
    
    Hello ${username},
    
    We received a request to reset your password. Please visit the link below to set a new password:
    
    ${resetUrl}
    
    If you didn't request a password reset, you can safely ignore this email.
    
    This link will expire in 1 hour.
    
    Thank you,
    ${APP_NAME} Team
  `;
  
  return sendEmail({
    to: email,
    from: 'notifications@stackr.financial',
    subject,
    html,
    text
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
    from: 'notifications@stackr.financial', // Replace with your verified domain in Resend
    subject: `${title}`,
    html,
    text: `${title}\n\n${message}\n\nThis is an automated notification from your financial management application.`
  });
}