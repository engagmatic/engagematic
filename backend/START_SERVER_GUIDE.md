# 🚀 How to Start the Backend Server

## Quick Start

### Option 1: Double-click START_SERVER.bat
1. Navigate to the `backend` folder
2. Double-click `START_SERVER.bat`
3. The server will start and show logs

### Option 2: Using Terminal

#### PowerShell:
```powershell
cd backend
npm start
```

#### Command Prompt:
```cmd
cd backend
npm start
```

## Troubleshooting

### If you see "ERR_CONNECTION_REFUSED":
- Make sure the backend server is running
- Check that it's running on port 5000
- Look for this message: "🚀 LinkedInPulse API server running on port 5000"

### If MongoDB connection fails:
- The server uses MongoDB Atlas (cloud database)
- No local MongoDB installation needed
- Check your internet connection

### Common Issues:

**1. Port 5000 already in use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Kill the process using port 5000 or change PORT in config

**2. Email service warnings:**
```
⚠️ RESEND_API_KEY not found. Email service disabled.
```
Solution: This is OK for now. Emails won't send but app works fine.
Add RESEND_API_KEY to .env when ready.

**3. Module not found errors:**
```
Error: Cannot find module 'xyz'
```
Solution: Run `npm install` in the backend folder

## Expected Startup Messages

When server starts successfully, you'll see:
```
✅ MongoDB connected successfully
✅ Default hooks initialized
✅ Email service initialized with Resend (or warning if no API key)
✅ Onboarding emails scheduled (every 6 hours)
✅ Trial expiry reminders scheduled (daily at 9 AM)
✅ Re-engagement emails scheduled (daily at 10 AM)
✅ Milestone checks scheduled (every 6 hours)
📧 Email scheduler started successfully
🚀 LinkedInPulse API server running on port 5000
📊 Environment: development
🌐 Frontend URL: http://localhost:5173
```

## Health Check

Once running, test the server:
```
Open browser: http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "LinkedInPulse API is running",
  "timestamp": "2025-10-26T...",
  "environment": "development"
}
```

## Stopping the Server

- Press `Ctrl+C` in the terminal
- Or close the command window

