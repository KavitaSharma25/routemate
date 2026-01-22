/**
 * SMS Service for sending OTP
 * Currently logs to console for development
 * 
 * To integrate real SMS in production, use one of these services:
 * 
 * 1. Twilio (https://www.twilio.com/)
 *    - Most reliable international SMS service
 *    - npm install twilio
 * 
 * 2. MSG91 (https://msg91.com/)
 *    - Popular in India, cost-effective
 *    - npm install msg91-sms
 * 
 * 3. Fast2SMS (https://www.fast2sms.com/)
 *    - India-specific, very affordable
 *    - REST API integration
 * 
 * 4. AWS SNS (https://aws.amazon.com/sns/)
 *    - Enterprise solution with AWS integration
 *    - npm install @aws-sdk/client-sns
 */

/**
 * Send OTP via SMS
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
async function sendOTP(phone, otp) {
  try {
    // DEVELOPMENT MODE - Log to console (no SMS sent)
    if (!process.env.FAST2SMS_API_KEY || process.env.NODE_ENV === 'development') {
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║         📱 OTP NOTIFICATION           ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Phone: +91-${phone}              ║`);
      console.log(`║  OTP Code: ${otp}                      ║`);
      console.log('║  Valid for: 10 minutes                 ║');
      console.log('║  Mode: DEVELOPMENT (Console Only)      ║');
      console.log('╚════════════════════════════════════════╝\n');
      return true;
    }

    // PRODUCTION MODE - Send real SMS via Fast2SMS
    const axios = require('axios');
    
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        sender_id: 'FSTSMS',
        message: `Your RouteMate OTP is ${otp}. Valid for 10 minutes. Do not share.`,
        variables_values: otp,
        flash: 0,
        numbers: phone
      },
      {
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.return) {
      console.log(`✅ OTP sent successfully to ${phone}`);
      return true;
    } else {
      console.error('Fast2SMS API error:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    // In development, don't fail - just log
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  SMS sending failed, but continuing in development mode');
      return true;
    }
    throw error;
  }
}

module.exports = { sendOTP };
