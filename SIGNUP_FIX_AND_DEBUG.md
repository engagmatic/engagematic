# 🔧 Sign Up Functionality - Fix & Debug Guide

## ✅ System Status
- **Backend**: Running on port 5000 ✅
- **Frontend**: Running on port 8080 ✅
- **API Connection**: http://localhost:5000/api ✅

---

## 🐛 Common Sign Up Issues & Fixes

### **Issue 1: "Failed to fetch" Error**

**Cause**: Frontend trying to connect to wrong backend URL

**Fix**: Verify `.env` file exists and is correct

**Check**:
```bash
# File: spark-linkedin-ai-main/.env
VITE_API_URL=http://localhost:5000/api
```

**Action**: 
1. Make sure the file exists in `spark-linkedin-ai-main/.env`
2. Refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache

---

### **Issue 2: Validation Errors**

**Symptoms**: Form won't submit, shows validation errors

**Requirements**:
- **Name**: 2-50 characters
- **Email**: Valid email format
- **Password**: At least 6 characters
- **Confirm Password**: Must match password

**Fix**: Ensure all Step 1 fields meet requirements

---

### **Issue 3: "User already exists"**

**Cause**: Email is already registered

**Fix**: 
1. Use a different email, OR
2. Login instead of signing up, OR
3. Reset your MongoDB if testing:

```bash
# Clear test users (DEV ONLY!)
cd backend
node -e "
  const mongoose = require('mongoose');
  mongoose.connect('YOUR_MONGODB_URI').then(async () => {
    await mongoose.connection.collection('users').deleteMany({});
    console.log('✅ Users cleared');
    process.exit(0);
  });
"
```

---

### **Issue 4: Steps Don't Progress**

**Symptoms**: Can't move to next step

**Required Fields by Step**:

**Step 1 - Account Setup** (Required):
- Name
- Email  
- Password
- Confirm Password (must match)

**Step 2 - Professional Info** (Required):
- Job Title
- Company
- Industry
- Experience Level

**Step 3 - AI Persona** (Required):
- Persona Name
- Writing Style
- Tone
- Expertise
- Target Audience
- Goals

**Step 4 - Preferences** (Optional):
- Content Types (can be empty)
- Posting Frequency (optional)
- LinkedIn URL (optional)

**Fix**: Fill all required fields before clicking "Next"

---

### **Issue 5: Server Error (500)**

**Symptoms**: "Server error" or "Registration failed"

**Possible Causes**:
1. MongoDB not connected
2. Missing environment variables
3. Backend crash

**Check Backend Terminal**:
Look for errors in backend terminal:
```
✅ MongoDB connected successfully  ← Should see this
🚀 LinkedInPulse API server running on port 5000
```

**Fix**:
1. Restart backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Check `backend/.env` has MongoDB URI:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

---

## 🧪 Test Sign Up Flow

### **Quick Test**:

1. **Open**: http://localhost:8080/register

2. **Step 1** - Fill out:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
   - Click **Next**

3. **Step 2** - Fill out:
   - Job Title: `Software Engineer`
   - Company: `Test Company`
   - Industry: `Technology`
   - Experience: `Mid-level`
   - Click **Next**

4. **Step 3** - Fill out:
   - Persona Name: `Tech Expert`
   - Writing Style: `Professional`
   - Tone: `Confident`
   - Expertise: `Software Development`
   - Target Audience: `Developers`
   - Goals: `Share knowledge`
   - Click **Next**

5. **Step 4** - Optional:
   - Click **Create Account**

6. **Expected Result**:
   - ✅ Success toast: "Welcome to LinkedInPulse! 🎉"
   - ✅ Redirect to `/dashboard`
   - ✅ User logged in

---

## 🔍 Debugging Steps

### **1. Check Browser Console**

Open browser DevTools (F12), go to **Console** tab:

**Look for**:
- ❌ `Failed to fetch` → Backend not reachable
- ❌ `CORS error` → Backend CORS issue
- ❌ `400 Bad Request` → Validation error
- ❌ `500 Internal Server Error` → Backend error

### **2. Check Network Tab**

In DevTools, go to **Network** tab:

1. Click **Create Account**
2. Find request to `/api/auth/register`
3. Check:
   - **Status**: Should be `201 Created`
   - **Request Payload**: Should have all form data
   - **Response**: Should have `success: true` and `token`

**Common Issues**:
- Status `404` → Wrong API URL
- Status `400` → Validation failed
- Status `500` → Server error

### **3. Check Backend Logs**

In backend terminal, look for:

**Success**:
```
✅ Trial subscription created for new user: 68f5bd78d6f885df77982862
```

**Errors**:
```
❌ Registration error: ...
❌ MongoDB error: ...
```

---

## 🛠️ Manual Test API

Test the backend directly with curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "persona": {
      "name": "Tech Expert",
      "writingStyle": "Professional",
      "tone": "confident",
      "expertise": "Software Development",
      "targetAudience": "Developers",
      "goals": "Share knowledge"
    },
    "profile": {
      "jobTitle": "Software Engineer",
      "company": "Test Company",
      "industry": "Technology",
      "experience": "Mid-level"
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "subscription": { ... }
  }
}
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8080
- [ ] `.env` file exists in `spark-linkedin-ai-main/`
- [ ] `.env` contains `VITE_API_URL=http://localhost:5000/api`
- [ ] MongoDB connected (check backend logs)
- [ ] Browser cache cleared
- [ ] All required fields filled in each step
- [ ] Password and Confirm Password match
- [ ] Email not already registered

---

## 📞 Still Not Working?

### **Share These Details**:

1. **Browser console error** (screenshot or copy)
2. **Backend terminal error** (if any)
3. **Which step fails** (1, 2, 3, or 4?)
4. **Network request details** (from DevTools Network tab)

### **Quick Reset**:

```bash
# Stop all processes
Get-Process | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force

# Restart backend
cd backend
npm run dev

# In new terminal, restart frontend
cd spark-linkedin-ai-main
npm run dev
```

---

## 🎯 Working Registration Flow

```
User fills Step 1 → Validates → Next
  ↓
User fills Step 2 → Validates → Next
  ↓
User fills Step 3 → Validates → Next
  ↓
User fills Step 4 (optional) → Click "Create Account"
  ↓
Frontend sends POST to /api/auth/register
  ↓
Backend validates → Creates user → Creates trial subscription
  ↓
Backend returns JWT token
  ↓
Frontend stores token → Updates AuthContext → Redirects to /dashboard
  ↓
✅ User logged in successfully!
```

---

## 🚀 Expected Behavior

1. Fill all 4 steps
2. Click "Create Account"
3. See loading spinner
4. See success toast: "Welcome to LinkedInPulse! 🎉"
5. Automatic redirect to Dashboard
6. User is logged in
7. Trial subscription active (7 days, 100 tokens)

If this doesn't happen, use the debugging steps above!

