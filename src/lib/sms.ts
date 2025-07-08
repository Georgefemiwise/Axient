import logger from './logger';

interface SMSProvider {
  sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER!;
  }

  async sendSMS(to: string, message: string) {
    try {
      // Simulate Twilio API call
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        logger.info('SMS sent successfully', { to, messageId: data.sid });
        return { success: true, messageId: data.sid };
      } else {
        const error = await response.text();
        logger.error('Failed to send SMS', { to, error });
        return { success: false, error };
      }
    } catch (error) {
      logger.error('SMS sending error', { to, error: error instanceof Error ? error.message : 'Unknown error' });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

class MockSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string) {
    logger.info('Mock SMS sent', { to, message });
    return { success: true, messageId: `mock_${Date.now()}` };
  }
}

export class SMSService {
  private provider: SMSProvider;

  constructor() {
    this.provider = process.env.NODE_ENV === 'production' 
      ? new TwilioProvider() 
      : new MockSMSProvider();
  }

  async sendPlateDetectionAlert(phoneNumber: string, plateNumber: string, location: string, timestamp: string) {
    const message = `🚨 ALPR Alert: Vehicle with plate ${plateNumber} detected at ${location} on ${timestamp}. Axient Security System.`;
    
    const result = await this.provider.sendSMS(phoneNumber, message);
    
    // Log the notification attempt
    logger.info('Plate detection alert sent', {
      phoneNumber,
      plateNumber,
      location,
      success: result.success,
      messageId: result.messageId,
    });

    return result;
  }

  async sendSystemAlert(phoneNumber: string, alertType: string, details: string) {
    const message = `⚠️ System Alert: ${alertType} - ${details}. Axient ALPR System.`;
    return this.provider.sendSMS(phoneNumber, message);
  }
}

export const smsService = new SMSService();