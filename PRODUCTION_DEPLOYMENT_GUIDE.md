# 🚀 LinkedInPulse Production Deployment Guide

## 🔧 Environment Variables Setup

### Required Environment Variables

Copy `backend/env.example` to `backend/.env` and configure the following:

#### 1. **Email Service (Resend)**
```bash
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LinkedInPulse
```

#### 2. **Google Analytics**
```bash
# Get your GA4 Property ID from: https://analytics.google.com/
GA_PROPERTY_ID=123456789
# Path to your Google Service Account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### 3. **Razorpay Payment Gateway**
```bash
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

#### 4. **Database & Security**
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=linkedinpulse

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

## 📧 Email Service Setup (Resend)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Verify your email

### Step 2: Get API Key
1. Go to [API Keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key and add to `RESEND_API_KEY`

### Step 3: Verify Domain (Optional)
1. Go to [Domains](https://resend.com/domains)
2. Add your domain
3. Update `EMAIL_FROM` to use your domain

## 📊 Google Analytics Setup

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Copy the Property ID (format: 123456789)

### Step 2: Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Analytics Data API
3. Create a service account
4. Download the JSON key file
5. Add the file path to `GOOGLE_APPLICATION_CREDENTIALS`

### Step 3: Grant Permissions
1. In GA4, go to Admin > Property Access Management
2. Add your service account email
3. Grant "Viewer" permissions

## 💳 Payment Gateway Setup (Razorpay)

### Step 1: Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for an account
3. Complete KYC verification

### Step 2: Get API Keys
1. Go to [API Keys](https://dashboard.razorpay.com/app/keys)
2. Copy Test/Live Key ID and Secret
3. Add to environment variables

### Step 3: Setup Webhooks
1. Go to [Webhooks](https://dashboard.razorpay.com/app/webhooks)
2. Create webhook with URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `subscription.charged`, etc.
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

## 🚀 Production Deployment

### Render.com Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Select the backend folder as root directory

2. **Environment Variables**
   - Add all environment variables from your `.env` file
   - Make sure to use production values

3. **Build Command**
   ```bash
   npm install
   ```

4. **Start Command**
   ```bash
   npm start
   ```

5. **Health Check**
   - Set health check path to `/health`

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Environment Variables**
   - Add all environment variables in Vercel dashboard

## 🔍 Troubleshooting

### Email Service Issues
- **Connection Timeout**: Check if `RESEND_API_KEY` is correct
- **SMTP Errors**: Verify domain verification in Resend
- **Rate Limits**: Resend has rate limits, check your usage

### Google Analytics Issues
- **Property ID**: Ensure GA4 Property ID is correct format
- **Service Account**: Verify JSON key file path and permissions
- **API Access**: Make sure Google Analytics Data API is enabled

### Payment Gateway Issues
- **Webhook Failures**: Check webhook URL and secret
- **Test Mode**: Ensure using correct test/live keys
- **CORS**: Verify frontend URL in Razorpay settings

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Email service tested with Resend
- [ ] Google Analytics connected
- [ ] Payment gateway configured
- [ ] Database connection tested
- [ ] Frontend URL updated
- [ ] SSL certificate installed
- [ ] Domain DNS configured

## 🎯 Post-Deployment Testing

1. **Health Check**: Visit `/health` endpoint
2. **Email Test**: Send test email through admin panel
3. **Payment Test**: Process test payment
4. **Analytics**: Verify GA4 data collection
5. **User Registration**: Test complete user flow

## 📞 Support

If you encounter issues:
1. Check server logs for specific error messages
2. Verify all environment variables are set
3. Test each service individually
4. Contact support with specific error details

---

**Note**: This guide assumes you're deploying to a cloud platform like Render, Vercel, or similar. Adjust commands and steps based on your specific hosting provider.
