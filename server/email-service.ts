import { Resend } from 'resend';

interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  type?: string;
  disposition?: string;
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

// Initialize Resend if API key is available
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Email client initialized');
} else {
  console.warn('WARNING: Missing RESEND_API_KEY environment variable. Email functionality will be disabled.');
}

/**
 * Send an email using the configured email service
 * @param options The email options
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not initialized. Unable to send email.');
    return false;
  }

  try {
    const { to, from, subject, html, text, attachments } = options;
    
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      attachments: attachments?.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content instanceof Buffer 
          ? attachment.content 
          : Buffer.from(attachment.content, 'base64'),
        type: attachment.type || 'application/octet-stream',
        disposition: attachment.disposition || 'attachment'
      })),
    });

    if (response.error) {
      console.error('Email sending failed:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a test email to verify the email service is working
 * @param to The recipient email address
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  return sendEmail({
    to,
    from: 'noreply@stackr.finance',
    subject: 'Stackr Finance - Email System Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Stackr Finance Email System</h1>
        <p>This is a test email to verify that the email system is working correctly.</p>
        <p>If you received this message, it means your email configuration is working properly.</p>
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          This is an automated message from Stackr Finance. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Stackr Finance Email System

This is a test email to verify that the email system is working correctly.
If you received this message, it means your email configuration is working properly.

This is an automated message from Stackr Finance. Please do not reply to this email.
    `,
  });
}

/**
 * Send a payment confirmation email to a client
 * @param options The email options including client details and payment information
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendPaymentConfirmationEmail(options: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  paymentDate: string;
}): Promise<boolean> {
  const { to, clientName, invoiceNumber, amount, paymentDate } = options;
  
  return sendEmail({
    to,
    from: 'payments@stackr.finance',
    subject: `Payment Confirmation - Invoice #${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Payment Confirmation</h2>
        <p>Dear ${clientName},</p>
        <p>Thank you for your payment of $${amount} for invoice #${invoiceNumber}.</p>
        <p>Your payment was successfully processed on ${paymentDate}.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #2c3e50;">Payment Details</h3>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Amount Paid:</strong> $${amount}</p>
          <p><strong>Payment Date:</strong> ${paymentDate}</p>
        </div>
        
        <p>If you have any questions about this payment, please contact us at accounting@stackr.finance.</p>
        <p>Thank you for your business!</p>
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          Stackr Finance<br>
          123 Finance Street<br>
          New York, NY 10001<br>
          accounting@stackr.finance
        </p>
      </div>
    `,
    text: `
Payment Confirmation

Dear ${clientName},

Thank you for your payment of $${amount} for invoice #${invoiceNumber}.
Your payment was successfully processed on ${paymentDate}.

Payment Details:
Invoice Number: ${invoiceNumber}
Amount Paid: $${amount}
Payment Date: ${paymentDate}

If you have any questions about this payment, please contact us at accounting@stackr.finance.

Thank you for your business!

Stackr Finance
123 Finance Street
New York, NY 10001
accounting@stackr.finance
    `,
  });
}

/**
 * Send a notification email to a user
 * @param options The notification email options
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendNotificationEmail(options: {
  to: string;
  subject: string;
  userName: string;
  notificationText: string;
  actionUrl?: string;
  actionText?: string;
}): Promise<boolean> {
  const { to, subject, userName, notificationText, actionUrl, actionText } = options;
  
  let actionButton = '';
  if (actionUrl && actionText) {
    actionButton = `
      <a href="${actionUrl}" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 16px; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: 500;">${actionText}</a>
    `;
  }
  
  return sendEmail({
    to,
    from: 'notifications@stackr.finance',
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Stackr Finance Notification</h2>
        <p>Hello ${userName},</p>
        <p>${notificationText}</p>
        ${actionButton}
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          This is an automated notification from Stackr Finance. You can manage your notification preferences in your account settings.
        </p>
      </div>
    `,
    text: `
Stackr Finance Notification

Hello ${userName},

${notificationText}

${actionUrl ? `${actionText}: ${actionUrl}` : ''}

This is an automated notification from Stackr Finance. You can manage your notification preferences in your account settings.
    `,
  });
}

/**
 * Send a reminder email to a user
 * @param options The reminder email options
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendReminderEmail(options: {
  to: string;
  subject: string;
  userName: string;
  reminderText: string;
  dueDate?: string;
  amount?: string;
  category?: string;
}): Promise<boolean> {
  const { to, subject, userName, reminderText, dueDate, amount, category } = options;
  
  let detailsSection = '';
  if (dueDate || amount || category) {
    detailsSection = `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #2c3e50;">Reminder Details</h3>
        ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
        ${amount ? `<p><strong>Amount:</strong> $${amount}</p>` : ''}
        ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
      </div>
    `;
  }
  
  return sendEmail({
    to,
    from: 'reminders@stackr.finance',
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Stackr Finance Reminder</h2>
        <p>Hello ${userName},</p>
        <p>${reminderText}</p>
        ${detailsSection}
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          This is an automated reminder from Stackr Finance. You can manage your reminder settings in your account.
        </p>
      </div>
    `,
    text: `
Stackr Finance Reminder

Hello ${userName},

${reminderText}

${dueDate ? `Due Date: ${dueDate}` : ''}
${amount ? `Amount: $${amount}` : ''}
${category ? `Category: ${category}` : ''}

This is an automated reminder from Stackr Finance. You can manage your reminder settings in your account.
    `,
  });
}