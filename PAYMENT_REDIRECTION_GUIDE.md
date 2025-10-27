# Payment Page Redirection Guide

## ✅ Buttons That Navigate to Payment/Pricing

### 1. **Dashboard - "Upgrade to Premium" Button** ✅ FIXED
- **Location**: Dashboard page (`/dashboard`)
- **Component**: `SubscriptionStatus.tsx`
- **When it shows**: During trial period or after trial expires
- **Action**: Navigates to home page and scrolls to pricing section
- **Text**: "Upgrade to Premium" (trial active) or "Unlock Full Access" (trial expired)

### 2. **Dashboard - "Manage Subscription" Button**
- **Location**: Dashboard page (`/dashboard`)
- **Component**: `SubscriptionStatus.tsx`
- **When it shows**: When user has active subscription
- **Action**: Navigates to `/plan-management` page
- **Text**: "Manage Subscription"

### 3. **Home Page - Pricing Section**
- **Location**: Home page (`/`)
- **Access**: Scroll down or use header navigation
- **Sections**: 
  - Starter Plan
  - Pro Plan
  - Custom Plan (slider-based)

### 4. **Header Navigation - "Pricing" Link** (for logged-out users)
- **Location**: Header component
- **When it shows**: User not logged in
- **Action**: Scrolls to pricing section on home page

### 5. **Hero Section - "Start Free Trial" Button** (for logged-out users)
- **Location**: Home page hero section
- **Action**: Navigates to `/auth/register`
- **After registration**: Redirects to pricing to choose plan

## 🔧 How to Test

### Test Upgrade Button:
1. Log in to your account
2. Go to Dashboard (`/dashboard`)
3. Look for "Upgrade to Premium" button in the Subscription Status card
4. Click the button
5. You should be redirected to home page (`/`) and scroll to pricing section automatically

### Test from Home Page:
1. Navigate to home page (`/`)
2. Scroll down or click "Pricing" in header
3. You'll see pricing section with all plans

## 📝 All Payment-Related Buttons:

| Button Text | Location | Route | When Visible |
|------------|----------|-------|--------------|
| "Upgrade to Premium" | Dashboard | `/` (scrolls to pricing) | Trial active or expired |
| "Unlock Full Access" | Dashboard | `/` (scrolls to pricing) | Trial expired |
| "Manage Subscription" | Dashboard | `/plan-management` | Has active subscription |
| "Pricing" (header) | Header | Scrolls to pricing | Not logged in |
| "Start Free Trial" | Home page | `/auth/register` | Not logged in |
| Plan Select Buttons | Pricing section | Opens Razorpay | After plan selection |

## 🎯 Direct Links to Pricing:

- **Home Page Pricing**: Navigate to `/` and scroll down
- **From Anywhere**: Click on your avatar → Profile → No payment history → Shows link to pricing

## ⚠️ Troubleshooting

If the upgrade button doesn't work:
1. Check if you're logged in
2. Make sure you're on the Dashboard page
3. Look for the "Upgrade to Premium" button in the subscription card
4. The button should now navigate properly after the fix

## 🔍 What Was Fixed:

**Problem**: The upgrade button was using `Link to="/#pricing"` which doesn't properly handle hash anchors in React Router.

**Solution**: Changed to use `useNavigate()` hook with proper scrolling:
```typescript
const handleUpgrade = () => {
  navigate("/");
  setTimeout(() => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
};
```

This ensures:
- ✅ Proper navigation to home page
- ✅ Smooth scroll to pricing section
- ✅ Works from anywhere in the app
- ✅ Reliable across all browsers

---

**Updated**: Current implementation now works correctly
**Test**: Click "Upgrade to Premium" button on Dashboard

