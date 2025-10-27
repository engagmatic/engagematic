# 🔍 Debug Checklist for Localhost Issues

## Quick Checks

### 1. **Browser Console Check** (Most Important)
Press `F12` in your browser and check:
- **Console tab**: Any red errors?
- **Network tab**: When you click button, do you see API calls?

### 2. **Common Issues Found**

#### ❌ Error: "Cannot read property of undefined"
- **Cause**: Import issue or auth context not loaded
- **Fix**: Check imports in SaaSPricing.tsx

#### ❌ Error: "useAuth is not defined"
- **Cause**: useAuth import missing
- **Status**: ✅ Already imported (line 12)

#### ❌ Error: "processCreditPayment is not defined"
- **Cause**: Hook import issue
- **Status**: ✅ Already imported from useRazorpay

---

## Step-by-Step Debug

### **Step 1: Check Browser Console**
```
1. Open http://localhost:8080
2. Press F12
3. Click on "Upgrade" button
4. What error shows in Console tab?
```

### **Step 2: Check Network Requests**
```
1. Open F12 → Network tab
2. Filter by "Fetch/XHR"
3. Click upgrade button
4. Do you see API calls?
   - If NO: Button click handler not working
   - If YES: Check response status
```

### **Step 3: Check if Auth is Working**
```javascript
// In browser console, type:
console.log(window.location.href)
// Should show: http://localhost:8080/

// Check if you're logged in
// Look for localStorage
localStorage.getItem('token')
```

---

## Expected Flow

### **For NOT Logged In User:**
1. Visit pricing page
2. See "Start Free Trial" button
3. Click button
4. Should see toast: "Please log in to start your free trial"
5. Should redirect to /auth/register

### **For Logged In User:**
1. Visit pricing page  
2. See "Upgrade to [Plan]" button
3. Click button
4. Should see loading state
5. Should open Razorpay payment modal
6. OR show error if Razorpay not loaded

---

## Common Errors & Fixes

### Error: "Payment system not ready"
**Cause**: Razorpay script not loaded
**Fix**: Check if `isLoaded` is true in useRazorpay hook

### Error: "Please complete profile setup"
**Status**: ✅ JUST FIXED - Removed from code

### Error: Button doesn't respond
**Cause**: Event handler not attached
**Fix**: Check onClick handler is correct

### Error: Redirect not working
**Cause**: navigate() not imported or not working
**Status**: ✅ Already imported and used

---

## Files to Check

1. ✅ `SaaSPricing.tsx` - Button handler (LINES 195-275)
2. ✅ `useBattle` hook - Auth check
3. ✅ `useRazorpay` hook - Payment processing
4. ✅ Router setup - For navigation

---

## Quick Test Commands

Run these in browser console (F12):

```javascript
// Test 1: Check authentication
console.log('Auth token:', localStorage.getItem('token'))

// Test 2: Check if page loaded
console.log('Page URL:', window.location.href)

// Test 3: Check for errors
// Look at Console tab for red errors

// Test 4: Manually trigger button click
document.querySelector('button')?.click()
```

---

## What to Report

When testing, please report:
1. **Console errors** - Copy exact error message
2. **Button behavior** - Does it do anything when clicked?
3. **Network requests** - Do API calls appear in Network tab?
4. **Redirect behavior** - Does URL change?

---

## Most Likely Issues

1. **Browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Dev server not restarted** - Restart with `npm run dev`
3. **Razorpay not loading** - Check network tab for script load
4. **Auth state wrong** - Check localStorage has token

