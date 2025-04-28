import { Router } from 'express';
import { sendEmail, sendTestEmail, sendSms } from "../email-service";

const router = Router();

// Test email and SMS delivery endpoint
router.post("/api/test-delivery", async (req, res) => {
  try {
    const { email, phone, deliveryMethod } = req.body;
    
    console.log(`Testing delivery to email: ${email}, phone: ${phone}, method: ${deliveryMethod}`);
    
    const results = {
      email: false,
      sms: false
    };
    
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      if (email) {
        console.log('Attempting to send test email to:', email);
        const emailResult = await sendTestEmail(email);
        results.email = emailResult;
        console.log('Email test result:', emailResult);
      }
    }
    
    if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
      if (phone) {
        console.log('Attempting to send test SMS to:', phone);
        const smsResult = await sendSms({
          to: phone,
          body: `Stackr Finance test SMS sent at ${new Date().toLocaleString()}. If you received this message, SMS delivery is working correctly.`
        });
        
        results.sms = smsResult;
        console.log('SMS test result:', smsResult);
      }
    }
    
    res.json({
      success: true,
      results,
      message: 'Test messages sent'
    });
    
  } catch (error: any) {
    console.error('Error in test delivery:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while testing message delivery'
    });
  }
});

// HTML page endpoint to serve the test interface
router.get("/test-delivery", (req, res) => {
  res.sendFile('test-delivery.html', { root: './public' });
});

export default router;