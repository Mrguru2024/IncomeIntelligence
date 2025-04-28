import twilio from 'twilio';
import { Resend } from 'resend';

// Interface for SMS service
interface SMSServiceInterface {
  sendSMS(to: string, message: string, options?: any): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    details?: any;
  }>;
  
  isConfigured(): boolean;
}

// Resend Email-based SMS service (fallback)
class ResendSMSService implements SMSServiceInterface {
  private resend: Resend | null = null;
  
  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('SMS client initialized (via Resend)');
    } else {
      console.warn('WARNING: RESEND_API_KEY not set, SMS delivery via email will not function');
    }
  }
  
  isConfigured(): boolean {
    return this.resend !== null;
  }
  
  async sendSMS(to: string, message: string, options?: any): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    details?: any;
  }> {
    // Strip non-numeric characters for the email
    const phoneDigits = to.replace(/[^\d]/g, '');
    const email = `sms-${phoneDigits}@stackr.app`;
    
    if (!this.resend) {
      return {
        success: false,
        error: 'Resend API key not configured'
      };
    }
    
    try {
      const data = await this.resend.emails.send({
        from: 'SMS <sms@stackr.app>',
        to: [email],
        subject: 'SMS Message',
        text: message,
        tags: [
          {
            name: 'category',
            value: 'sms-delivery'
          }
        ]
      });
      
      return {
        success: true,
        messageId: data.id as string,
        details: data
      };
    } catch (error: any) {
      console.error('Failed to send SMS via Resend:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        details: error
      };
    }
  }
}

// Twilio SMS service (primary)
class TwilioSMSService implements SMSServiceInterface {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;
  
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || null;
    
    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
      console.log('Twilio SMS client initialized');
    } else {
      const missing = [];
      if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
      if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
      if (!this.fromNumber) missing.push('TWILIO_PHONE_NUMBER');
      console.warn(`WARNING: Missing Twilio configuration: ${missing.join(', ')}`);
    }
  }
  
  isConfigured(): boolean {
    return this.client !== null && this.fromNumber !== null;
  }
  
  async sendSMS(to: string, message: string, options?: any): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    details?: any;
  }> {
    if (!this.client || !this.fromNumber) {
      return {
        success: false,
        error: 'Twilio not configured'
      };
    }
    
    try {
      // Format the phone number to E.164 format if not already
      let formattedTo = to;
      if (!to.startsWith('+')) {
        // If number starts with 1, assume US
        if (to.startsWith('1')) {
          formattedTo = `+${to}`;
        } else {
          // Otherwise, assume US and add +1
          formattedTo = `+1${to}`;
        }
      }
      
      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo,
        ...options
      });
      
      return {
        success: true,
        messageId: twilioMessage.sid,
        details: twilioMessage
      };
    } catch (error: any) {
      console.error('Failed to send SMS via Twilio:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        details: error
      };
    }
  }
}

// SMS Service Factory - creates the appropriate service based on configuration
class SMSServiceFactory {
  static createService(): SMSServiceInterface {
    // Create Twilio service first (preferred)
    const twilioService = new TwilioSMSService();
    
    // If Twilio is configured, return it
    if (twilioService.isConfigured()) {
      return twilioService;
    }
    
    // Otherwise, fall back to Resend
    return new ResendSMSService();
  }
}

// Create and export the singleton instance
export const smsService = SMSServiceFactory.createService();

// Export for testing
export { SMSServiceInterface, TwilioSMSService, ResendSMSService };