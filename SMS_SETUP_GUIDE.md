# SMS OTP Setup Guide for RouteMate

## Current Status
✅ **Development Mode**: OTP is displayed in:
- Backend console (server terminal)
- Frontend notification (appears on screen)
- API response (visible in network tab)

❌ **Production Mode**: SMS not configured yet

---

## Quick Start (Development Mode)

**No setup required!** The OTP will be:
1. 🖥️ Logged in the backend console (check your Node.js terminal)
2. 🔔 Shown in a notification on the frontend (blue info notification)
3. 📋 Visible in the API response in browser DevTools (Network tab)

### How to Test:
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Register with a phone number
4. Click "Send OTP"
5. **Check the blue notification on screen - it will show the OTP!**
6. Or check the backend terminal for the OTP
7. Enter the OTP and verify

---

## Production Setup (Real SMS)

### Option 1: Fast2SMS (Recommended for India) 🇮🇳

**Cost**: ₹1/SMS (very affordable)
**Signup**: https://www.fast2sms.com/

#### Steps:
1. **Create Account**
   - Go to https://www.fast2sms.com/
   - Sign up with your email and phone
   - Verify your account

2. **Get API Key**
   - Login to dashboard
   - Go to "Dev API" section
   - Copy your API key

3. **Configure RouteMate**
   - Open `backend/.env` file
   - Add this line:
     ```env
     FAST2SMS_API_KEY=your_api_key_here
     ```
   - Change `NODE_ENV` to production:
     ```env
     NODE_ENV=production
     ```

4. **Restart Backend**
   ```bash
   cd backend
   npm start
   ```

✅ Done! SMS will now be sent to real phone numbers.

---

### Option 2: Twilio (International)

**Cost**: $0.0079/SMS (most reliable)
**Signup**: https://www.twilio.com/

#### Steps:
1. Create Twilio account
2. Get phone number from Twilio console
3. Get Account SID and Auth Token

4. **Install Twilio SDK**:
   ```bash
   cd backend
   npm install twilio
   ```

5. **Update `backend/utils/smsService.js`**:
   ```javascript
   // Uncomment the Twilio section around line 23
   const twilio = require('twilio');
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   await client.messages.create({
     body: `Your RouteMate OTP is: ${otp}. Valid for 10 minutes.`,
     from: process.env.TWILIO_PHONE_NUMBER,
     to: `+91${phone}`
   });
   ```

6. **Update `.env`**:
   ```env
   NODE_ENV=production
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

### Option 3: MSG91 (India-focused)

**Cost**: ₹0.20/SMS
**Signup**: https://msg91.com/

1. Create MSG91 account
2. Get Auth Key and Template ID

3. **Update `backend/utils/smsService.js`** (uncomment MSG91 section)

4. **Update `.env`**:
   ```env
   NODE_ENV=production
   MSG91_AUTH_KEY=your_auth_key
   MSG91_TEMPLATE_ID=your_template_id
   ```

---

## Testing OTP in Development

### Method 1: Frontend Notification (Easiest)
1. Enter phone number
2. Click "Send OTP"
3. **Look for the blue notification at the top** - it shows: `Development Mode - OTP: 123456`
4. Copy the OTP from the notification
5. Paste and verify

### Method 2: Backend Console
1. Check your terminal where `npm start` is running
2. You'll see a formatted box:
   ```
   ╔════════════════════════════════════════╗
   ║         📱 OTP NOTIFICATION           ║
   ╠════════════════════════════════════════╣
   ║  Phone: +91-9876543210                ║
   ║  OTP Code: 123456                      ║
   ║  Valid for: 10 minutes                 ║
   ║  Mode: DEVELOPMENT (Console Only)      ║
   ╚════════════════════════════════════════╝
   ```

### Method 3: Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Find the `send-otp` request
4. Check the response - it contains `"otp": "123456"`

---

## Environment Variables

Create `backend/.env` file:

```env
# Development (no real SMS)
NODE_ENV=development

# Production with Fast2SMS
# NODE_ENV=production
# FAST2SMS_API_KEY=your_fast2sms_api_key

# Or Twilio
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Or MSG91
# MSG91_AUTH_KEY=your_auth_key
# MSG91_TEMPLATE_ID=your_template_id
```

---

## Troubleshooting

### "OTP not received by phone"
**Solution**: You're in development mode! 
- Check the **blue notification on screen** - OTP is shown there
- Or check backend console terminal
- Real SMS only works after configuring Fast2SMS/Twilio

### "OTP expired"
- OTP is valid for **10 minutes only**
- Request a new OTP (wait 60 seconds between requests)

### "Invalid OTP"
- Make sure you're copying the correct 6-digit code
- Check if OTP has expired
- Request a new one if needed

### Backend console not showing OTP
- Make sure `NODE_ENV=development` in `.env`
- Check if backend is running (`npm start`)
- Look for the formatted box in terminal

---

## Security Notes

⚠️ **Important**:
- Never commit `.env` file to Git
- In production, use HTTPS only
- Add rate limiting to prevent OTP spam
- OTP is valid for 10 minutes only
- Can only resend after 60 seconds

---

## Cost Comparison

| Service | Cost/SMS | Best For |
|---------|----------|----------|
| Fast2SMS | ₹1 | Indian users (cheapest) |
| MSG91 | ₹0.20 | Indian users (reliable) |
| Twilio | $0.0079 | International (most reliable) |

**Recommendation**: Start with **Fast2SMS** if targeting Indian users (Chitkara students).

---

## Need Help?

1. Check if backend is running: `cd backend && npm start`
2. Check if frontend is running: `cd frontend && npm run dev`
3. Verify `NODE_ENV=development` in `backend/.env`
4. Check backend console for OTP display
5. Check browser notification (blue info toast)
