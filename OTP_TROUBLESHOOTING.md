# 🔐 OTP Not Received? Here's How to Get It!

## For Testing/Development (Current Setup)

### ✅ IMPORTANT: OTP is Working - You Just Need to Know Where to Look!

Since you're in **development mode**, the OTP is **NOT sent to your phone via SMS**. Instead, it's shown in **3 places**:

---

## 🎯 Where to Find Your OTP

### Option 1: Frontend Notification (EASIEST) ⭐
1. Enter your phone number in the registration form
2. Click **"Send OTP"**
3. **Look at the TOP-CENTER of the screen**
4. You'll see a **BLUE notification** that says:
   ```
   🔐 DEV MODE - Your OTP is: 123456
   ```
5. **Copy the 6-digit number** from the notification
6. Enter it in the OTP field
7. Click "Verify OTP"

### Option 2: Backend Console/Terminal 🖥️
1. Open the terminal where you ran `npm start` (backend)
2. After clicking "Send OTP", check the terminal
3. You'll see a formatted box:
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
4. Copy the 6-digit OTP code

### Option 3: Browser Console 💻
1. Press **F12** to open DevTools
2. Go to the **Console** tab
3. After clicking "Send OTP", look for:
   ```
   ═══════════════════════════════════════
   🔐 DEVELOPMENT MODE - OTP GENERATED
   📱 Phone: 9876543210
   🔑 OTP: 123456
   ⏰ Valid for: 10 minutes
   ═══════════════════════════════════════
   ```

### Option 4: Network Tab (Advanced) 🌐
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Send OTP"
4. Find the request to `send-otp`
5. Click on it → Go to **Response** tab
6. Look for: `"otp": "123456"`

---

## 🚀 Quick Test Steps

1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```
   ✅ Keep this terminal open!

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Register**:
   - Go to http://localhost:5173/register
   - Fill in your details
   - Enter **any 10-digit phone number** (e.g., 9876543210)
   - Click **"Send OTP"**

4. **Get OTP**:
   - **LOOK UP** at the top of the screen for the blue notification
   - It will show: `🔐 DEV MODE - Your OTP is: XXXXXX`
   - OR check your backend terminal

5. **Verify**:
   - Enter the 6-digit OTP
   - Click "Verify OTP"
   - ✅ Done!

---

## ❓ Still Not Seeing OTP?

### Check These:

#### 1. Backend Not Running?
```bash
cd backend
npm start
```
✅ You should see: `Server running on http://localhost:5000`

#### 2. Check .env File
Open `backend/.env` and verify:
```env
NODE_ENV=development
```
**Must be "development"** for OTP to show!

#### 3. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cache and reload

#### 4. Check Console for Errors
- Press F12
- Go to Console tab
- Look for any red errors

---

## 📱 Want REAL SMS to Phone?

See [SMS_SETUP_GUIDE.md](SMS_SETUP_GUIDE.md) for production setup with:
- **Fast2SMS** (₹1/SMS) - Best for India
- **Twilio** ($0.0079/SMS) - International
- **MSG91** (₹0.20/SMS) - India

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────┐
│         RouteMate Registration          │
├─────────────────────────────────────────┤
│                                         │
│  Name: [John Doe____________]           │
│  Email: [john@chitkara.edu.in]          │
│  Phone: [9876543210_________]           │
│                                         │
│         [Send OTP] ← Click this         │
│                                         │
└─────────────────────────────────────────┘
                    ↓
        ┌──────────────────────────────────┐
        │ 🔐 DEV MODE - Your OTP is: 123456│ ← LOOK HERE!
        │      (Blue notification)          │
        └──────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Enter OTP: [1][2][3][4][5][6]          │
│                                         │
│         [Verify OTP]                    │
└─────────────────────────────────────────┘
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No notification appears | Check if backend is running (`npm start`) |
| OTP expired | Request a new OTP (wait 60 seconds) |
| Invalid OTP | Make sure you copied all 6 digits correctly |
| Can't resend OTP | Wait for the 60-second countdown to finish |
| Backend not showing OTP | Verify `NODE_ENV=development` in `.env` |

---

## 📞 Support

If you're still having issues:
1. Check both terminals (backend and frontend) for errors
2. Make sure ports 5000 and 5173 are not blocked
3. Try restarting both servers
4. Check browser console (F12) for errors

---

**Remember**: In development mode, **NO SMS is sent**. The OTP is **displayed on screen** and in the **console**! 🎯
