# 🐛 Razorpay 401 Debug Setup

## Issue
401 Unauthorized error from Razorpay API

## Root Cause
Most likely the credentials are not being loaded from `.env` file or the keys are invalid.

---

## ✅ Debug Steps Applied

### 1. Added Debug Logging
Added console.log to verify keys are loaded in `razorpay.js` constructor.

### 2. What to Check Now

**After restarting backend, check the console output:**

```bash
# In backend terminal, you should see:
🔑 Razorpay Key ID: rzp_live_RYV...
🔑 Razorpay Secret: LKg9BAH17Fi...
```

**If you see:**
```
❌ Razorpay credentials missing!
```
→ Then `.env` file is not being loaded properly.

---

## ✅ Verify Your Setup

### 1. Check `.env` File Exists
```bash
# In backend folder
ls -la .env
```

Should show: `.env` file exists

### 2. Check `.env` Content
```bash
cat .env
```

Should contain:
```env
RAZORPAY_KEY_ID=rzp_live_RYVCzLOdKhLCpg
RAZORPAY_KEY_SECRET=LKg9BAH17FipJ1fNK174zMEa
RAZORPAY_WEBHOOK_SECRET=fPq4bgTqmALFUe@
```

### 3. Restart Backend
```bash
# Stop with Ctrl+C
npm run dev
```

### 4. Check Console Output
Look for the debug logs showing the keys.

---

## Common Issues

### Issue 1: `.env` File Not Loaded
**Fix**: Make sure you have `dotenv.config()` at the top of config/index.js

### Issue 2: Wrong Keys
**Fix**: 
1. Go to Razorpay Dashboard
2. Regenerate the keys
3. Update `.env` file
4. Restart backend

### Issue 3: Test Keys vs Live Keys
**If testing locally, use test keys:**
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
```

---

## Next Steps

1. **Restart backend** and check debug logs
2. **Share the console output** from backend
3. We'll see exactly what keys are being used
4. Then fix the issue based on that

**The debug logs will tell us exactly what's wrong!** 🔍

