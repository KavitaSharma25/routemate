# OTP Verification System

## Overview
Phone number verification has been implemented for user registration using OTP (One-Time Password).

## Features

### ✅ User Registration Flow
1. User enters phone number (10-digit Indian mobile)
2. Clicks "Send OTP" button
3. Receives 6-digit OTP (valid for 10 minutes)
4. Enters OTP to verify phone number
5. Phone number gets verified ✓
6. Can complete registration

### 🎯 Key Features
- **6-digit OTP** generated randomly
- **10-minute expiry** for security
- **Resend OTP** with 60-second countdown
- **Real-time validation** of phone number format
- **Visual feedback** (green checkmark when verified)
- **Disabled registration** until phone verified

### 🔒 Security Features
- OTP expires after 10 minutes
- Rate limiting with countdown timer
- Server-side validation
- Phone number cannot be changed after verification
- One-time use OTPs

## Development Mode

In development, OTP is:
- **Logged to backend console** with fancy formatting
- **Shown in notification** on frontend (for testing)
- **Auto-filled** in UI for quick testing

Example console output:
```
╔════════════════════════════════════════╗
║           OTP NOTIFICATION             ║
╠════════════════════════════════════════╣
║ Phone: 9876543210                      ║
║ OTP Code: 123456                       ║
║ Valid for: 10 minutes                  ║
╚════════════════════════════════════════╝
```

## Production Setup

### Option 1: Twilio (Recommended)
```bash
npm install twilio
```

Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Option 2: MSG91 (India)
```bash
npm install axios
```

Add to `.env`:
```env
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id
```

### Option 3: Fast2SMS (India - Budget)
```bash
npm install axios
```

Add to `.env`:
```env
FAST2SMS_API_KEY=your_api_key
```

## API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456",  // Only in development
  "tempData": {
    "phone": "9876543210",
    "otp": "123456",
    "otpExpiry": "2025-12-21T10:30:00.000Z"
  }
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

### Register with Verified Phone
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@chitkara.edu.in",
  "password": "securepass123",
  "phone": "9876543210",
  "phoneVerified": true,
  "role": "student",
  "isDriver": false
}
```

## Database Schema

Updated User model includes:
```javascript
{
  phone: String,
  phoneVerified: Boolean (default: false),
  phoneOTP: String (temporary),
  phoneOTPExpiry: Date
}
```

## UI Components

### Phone Input Field
- 10-digit validation
- Disabled after verification
- Green border when verified
- "Send OTP" / "Resend" button

### OTP Input
- 6-digit numeric input
- Large, centered text
- Letter-spaced for readability
- Auto-focus on mount
- "Verify" button

### Status Indicators
- ✓ Verified badge (green)
- Countdown timer for resend
- Warning message if not verified
- Disabled submit button

## Error Handling

- Invalid phone format
- OTP expired
- Invalid OTP
- Phone already registered
- SMS service failures
- Network errors

## Future Enhancements

- [ ] SMS retry mechanism
- [ ] Phone number update with re-verification
- [ ] Multi-country support
- [ ] Voice OTP option
- [ ] WhatsApp OTP integration
- [ ] OTP analytics dashboard
