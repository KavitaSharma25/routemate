# 💳 Online Payment Setup Guide

## Current Status

✅ **Payment System Implemented**:
- Razorpay integration for online payments
- UPI/QR code payments with proof upload
- Cash payment option

## Payment Methods Available:

### 1. 💳 Online Payment (Razorpay)
- Credit/Debit Cards
- Net Banking  
- UPI (PhonePe, Google Pay, Paytm, etc.)
- Wallets

### 2. 📱 UPI/QR Code Payment
- Scan QR code with any UPI app
- Direct UPI ID transfer
- Upload payment screenshot for verification

### 3. 💵 Cash Payment
- Pay driver directly after ride

---

## Setup Razorpay (Required for Online Payments)

### Step 1: Create Razorpay Account

1. Go to https://razorpay.com/
2. Click **Sign Up** (it's FREE!)
3. Complete registration with:
   - Business name
   - Email
   - Phone number

### Step 2: Get API Keys

1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for development)
4. Copy the following:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (starts with random chars)

### Step 3: Configure RouteMate

1. Open `backend/.env` file
2. Replace these lines:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
   
   With your actual keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_AbcD1234EfGh5678
   RAZORPAY_KEY_SECRET=YourActualSecretKey123456
   ```

3. **Restart backend server**:
   ```bash
   cd backend
   npm start
   ```

---

## Testing Payment

### Test Cards (Razorpay Test Mode)

**Success Scenarios:**

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any 3 digits | Any future date | Success |
| 5555 5555 5555 4444 | Any 3 digits | Any future date | Success |

**UPI Test IDs:**
- `success@razorpay` - Payment succeeds
- `failure@razorpay` - Payment fails

### Test Steps:

1. **Search for a ride**
2. **Click "Book Ride"**
3. **Select seats** (1-4)
4. **Choose payment method**:
   - **Online Payment** → Razorpay checkout opens
   - **UPI/QR Code** → Upload payment proof
   - **Cash** → Direct booking
5. **Complete payment**
6. **Booking confirmed!**

---

## UPI Payment Flow

1. **User selects UPI payment**
2. **Modal shows**:
   - QR code
   - UPI ID of driver
   - Amount to pay
3. **User pays via any UPI app**
4. **User uploads**:
   - Payment screenshot
   - Transaction ID (12-digit UTR)
5. **Admin verifies payment**
6. **Booking confirmed**

---

## Going to Production

### 1. Get Live Razorpay Keys

1. Complete KYC in Razorpay Dashboard
2. Submit business documents
3. Get approved (usually 24-48 hours)
4. Generate **Live API Keys**
5. Replace in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YourLiveKeyID
   RAZORPAY_KEY_SECRET=YourLiveSecret
   ```

### 2. Razorpay Pricing

- **Setup**: FREE
- **Transaction Fees**: 
  - 2% per transaction
  - No setup fee
  - No annual fee
  - Instant settlements available

### 3. Alternatives to Razorpay

If you don't want to use Razorpay:

#### a) **Stripe** (International)
- 2.9% + ₹2 per transaction
- Best for global payments
- https://stripe.com/

#### b) **PayU** (India)
- 2% per transaction  
- Popular in India
- https://payu.in/

#### c) **Cashfree** (India)
- 1.95% per transaction
- Lower fees
- https://www.cashfree.com/

#### d) **UPI Only** (Free!)
- No payment gateway needed
- Just collect UPI payments
- Verify screenshots manually
- Zero transaction fees

---

## Features Implemented

### ✅ Online Payment (Razorpay)
- Automatic payment verification
- Secure payment gateway
- Multiple payment options (cards, UPI, netbanking)
- Instant booking confirmation
- Email notifications
- Failed payment handling

### ✅ UPI/QR Payment
- QR code generation
- UPI ID display
- Payment proof upload
- Transaction ID capture
- Screenshot verification
- Manual admin approval

### ✅ Cash Payment
- Direct booking (no upfront payment)
- Pay driver after ride
- Instant confirmation

---

## Payment Security

- ✅ All payments processed through Razorpay (PCI DSS compliant)
- ✅ No card details stored on our server
- ✅ HTTPS encryption (use in production)
- ✅ Payment signature verification
- ✅ Webhook support for payment status updates

---

## Troubleshooting

### "Razorpay not configured"

**Solution**: Add your Razorpay keys to `.env` file and restart server

### "Payment failed"

**Reasons**:
- Invalid card details
- Insufficient balance
- Bank declined
- Network issue

**Solution**: Try again or use different payment method

### "UPI payment not verified"

**Reason**: Admin hasn't verified payment proof yet

**Solution**: Wait for admin approval or contact support

---

## Quick Start Checklist

- [ ] Razorpay account created
- [ ] Test API keys copied
- [ ] `.env` file updated with keys
- [ ] Backend server restarted
- [ ] Test booking with test card
- [ ] Payment successful!

---

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Support**: Contact Razorpay support for payment issues

---

**Last Updated**: December 21, 2025  
**Status**: ✅ Fully Functional
