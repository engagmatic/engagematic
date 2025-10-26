# Payment System Setup Guide

## Complete Payment & Subscription System Implementation

This guide will help you set up the complete payment and subscription system for LinkedInPulse. Once you add your Razorpay keys, the system will be 100% functional and ready to collect real payments.

## 1. Environment Configuration

### Step 1: Create Environment File
```bash
cd backend
cp env.example .env
```

### Step 2: Update Environment Variables
Edit `backend/.env` with your actual values:

```env
# Razorpay Configuration (REQUIRED)
RAZORPAY_KEY_ID=your-actual-razorpay-key-id
RAZORPAY_KEY_SECRET=your-actual-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-actual-razorpay-webhook-secret

# Database (REQUIRED)
MONGODB_URI=your-mongodb-connection-string
DB_NAME=linkedinpulse

# JWT Secrets (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key

# Google AI API (REQUIRED)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

## 2. Razorpay Dashboard Setup

### Step 1: Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Complete KYC verification

### Step 2: Get API Keys
1. Go to **Settings** → **API Keys**
2. Generate **Test Keys** for development
3. Generate **Live Keys** for production
4. Copy the **Key ID** and **Key Secret**

### Step 3: Configure Webhooks
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events:
   - `payment.captured`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
4. Copy the **Webhook Secret**

## 3. Payment System Features

### ✅ Implemented Features

#### **Payment Processing**
- ✅ Razorpay integration with test/live modes
- ✅ Credit-based pricing system
- ✅ Monthly and yearly billing cycles
- ✅ Custom plan pricing calculations
- ✅ Preset plan pricing (Starter/Pro)

#### **Subscription Management**
- ✅ Automatic subscription creation
- ✅ Usage tracking and limits
- ✅ Billing cycle management
- ✅ Subscription status tracking
- ✅ Payment history

#### **Webhook Handling**
- ✅ Payment capture handling
- ✅ Subscription renewal processing
- ✅ Subscription cancellation
- ✅ Subscription pause/resume
- ✅ Automatic usage reset

#### **Security Features**
- ✅ Webhook signature verification
- ✅ Payment validation
- ✅ User authentication required
- ✅ Profile completion required

## 4. Pricing Structure

### **Monthly Plans**
- **Starter**: ₹249/$10 - 15 posts, 30 comments, 30 ideas
- **Pro**: ₹649/$19 - 60 posts, 80 comments, 80 ideas

### **Yearly Plans** (2 months free)
- **Starter**: ₹2,490/$100 - 20 posts, 40 comments, 40 ideas
- **Pro**: ₹6,490/$190 - 80 posts, 100 comments, 100 ideas

### **Custom Plans**
- **Pricing**: ₹5.5 per post, ₹2.8 per comment, ₹2.8 per idea
- **Range**: 10-100 of each content type
- **Flexibility**: Pay only for what you use

## 5. API Endpoints

### **Payment Endpoints**
```
POST /api/payment/create-credit-order
POST /api/payment/verify-payment
POST /api/payment/webhook
GET /api/payment/subscription-status/:userId
```

### **Subscription Endpoints**
```
GET /api/subscription/current
POST /api/subscription/cancel
POST /api/subscription/pause
POST /api/subscription/resume
```

## 6. Frontend Integration

### **Payment Flow**
1. User selects plan or customizes usage
2. Frontend calls `/api/payment/create-credit-order`
3. Razorpay checkout opens
4. User completes payment
5. Webhook processes payment
6. Subscription activated

### **Usage Tracking**
- Real-time usage tracking
- Limit enforcement
- Usage reset on billing cycle
- Graceful handling of limits

## 7. Testing

### **Test Mode**
- Use Razorpay test keys
- Test cards available
- No real money charged
- Full webhook testing

### **Test Cards**
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
```

## 8. Production Deployment

### **Step 1: Switch to Live Keys**
```env
RAZORPAY_KEY_ID=your-live-key-id
RAZORPAY_KEY_SECRET=your-live-key-secret
```

### **Step 2: Update Webhook URL**
- Change webhook URL to production domain
- Test webhook delivery

### **Step 3: Monitor Payments**
- Check Razorpay dashboard
- Monitor webhook logs
- Track subscription status

## 9. Security Checklist

- ✅ Environment variables secured
- ✅ Webhook signature verification
- ✅ Payment validation
- ✅ User authentication
- ✅ Profile completion required
- ✅ Rate limiting enabled
- ✅ Error handling implemented

## 10. Support & Monitoring

### **Logs to Monitor**
- Payment success/failure logs
- Webhook processing logs
- Subscription status changes
- Usage limit enforcement

### **Common Issues**
- Webhook delivery failures
- Payment verification errors
- Subscription status mismatches
- Usage tracking discrepancies

## Ready to Go! 🚀

Once you add your Razorpay keys to the environment file, the payment system will be 100% functional and ready to collect real payments. The system handles:

- ✅ All payment processing
- ✅ Subscription management
- ✅ Usage tracking
- ✅ Webhook handling
- ✅ Security validation
- ✅ Error handling

**Next Steps:**
1. Add Razorpay keys to `.env`
2. Test with test cards
3. Deploy to production
4. Start collecting payments!
