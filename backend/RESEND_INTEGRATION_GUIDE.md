# 📧 Resend Email Integration Guide

## 🎯 Overview

This guide shows you how to integrate **Resend** (100% FREE for up to 3,000 emails/month) for automated email sending in your LinkedInPulse application.

## ✅ What's Already Implemented

The email automation system is fully integrated with Resend and includes:

### 1. **Email Automation Flows**
- ✅ Welcome email on signup
- ✅ Onboarding sequence (Day 1, 3, 5, 7)
- ✅ Trial expiry reminders (7, 3, 1 days before)
- ✅ Re-engagement emails (7, 14, 30 days inactive)
- ✅ Milestone celebrations (10, 50, 100 posts)
- ✅ Upgrade prompts
- ✅ Payment failed notifications
- ✅ Feature update announcements

### 2. **Email Service Features**
- ✅ Resend API integration (native SDK)
- ✅ Email preference management
- ✅ Unsubscribe functionality
- ✅ Email logging and tracking
- ✅ Template-based emails (EJS)
- ✅ Automatic scheduling (node-cron)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Sign Up for Resend (FREE)

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (top right)
3. Create a free account (no credit card required)
4. Verify your email address
5. Navigate to **API Keys** in the dashboard
6. Click **"Create API Key"**
7. Give it a name (e.g., "LinkedInPulse Production")
8. Copy your API key (starts with `re_`)

**Free Tier Limits:**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ No credit card required
- ✅ Perfect for startups and small businesses

### Step 2: Configure Environment Variables

Add to your `backend/.env` file:

```env
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email From Address
# For testing: Use Resend's default domain (onboarding@resend.dev)
# For production: Use your verified domain
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=LinkedInPulse

# Frontend URL (for unsubscribe links)
FRONTEND_URL=http://localhost:8080
```

### Step 3: Verify Domain (Production Only)

For production, you should verify your own domain:

1. Go to Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `linkedinpulse.com`)
4. Add the DNS records provided by Resend:
   - **SPF Record**: `v=spf1 include:resend.com ~all`
   - **DKIM Record**: (provided by Resend)
   - **DMARC Record**: (optional but recommended)
5. Wait for verification (usually 5-15 minutes)
6. Once verified, update `EMAIL_FROM` to use your domain:
   ```env
   EMAIL_FROM=noreply@linkedinpulse.com
   ```

### Step 4: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. You should see:
   ```
   ✅ Email service initialized with Resend API
   📧 From: LinkedInPulse <onboarding@resend.dev>
   ✅ Email scheduler started successfully
   ```

3. Test welcome email by registering a new user:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "your-email@example.com",
       "password": "password123"
     }'
   ```

4. Check your email inbox for the welcome email!

## 📊 Email Automation Schedule

| Email Type | Trigger | Frequency | Time |
|------------|---------|-----------|------|
| Welcome | User signup | Instant | Immediate |
| Onboarding Day 1 | 24h after signup | Every 6h | Various |
| Onboarding Day 3 | 72h after signup | Every 6h | Various |
| Onboarding Day 5 | 120h after signup | Every 6h | Various |
| Onboarding Day 7 | 168h after signup | Every 6h | Various |
| Trial Expiry (7d) | 7 days before | Daily | 9:00 AM |
| Trial Expiry (3d) | 3 days before | Daily | 9:00 AM |
| Trial Expiry (1d) | 1 day before | Daily | 9:00 AM |
| Trial Expired | On expiry date | Daily | 9:00 AM |
| Re-engagement (7d) | 7 days inactive | Daily | 10:00 AM |
| Re-engagement (14d) | 14 days inactive | Daily | 10:00 AM |
| Re-engagement (30d) | 30 days inactive | Daily | 10:00 AM |
| Milestone | Post count milestone | Every 6h | Various |

## 🔧 How It Works

### Email Service Architecture

```
User Action/Event
    ↓
Email Scheduler (node-cron)
    ↓
Email Service (Resend API)
    ↓
Email Template (EJS)
    ↓
Resend API
    ↓
User's Inbox
```

### Code Flow

1. **User Registration** → `routes/auth.js`
   - Creates user
   - Calls `emailService.sendWelcomeEmail(user)`
   - Email sent immediately

2. **Scheduled Emails** → `services/emailScheduler.js`
   - Runs cron jobs every 6 hours (onboarding) or daily (trial/re-engagement)
   - Checks user conditions
   - Sends appropriate emails

3. **Email Sending** → `services/emailService.js`
   - Checks user preferences
   - Renders EJS template
   - Sends via Resend API
   - Logs to database

## 📝 Email Templates

All email templates are in `backend/templates/emails/`:

- `welcome.ejs` - Welcome email
- `onboarding_day1.ejs` - First post guide
- `onboarding_day3.ejs` - Content strategy
- `onboarding_day5.ejs` - Advanced features
- `onboarding_day7.ejs` - Weekly report
- `trial_expiry.ejs` - Trial reminder
- `trial_expired.ejs` - Trial ended
- `reengagement.ejs` - Re-engagement
- `milestone.ejs` - Milestone celebration
- `upgrade.ejs` - Upgrade prompt
- `payment_failed.ejs` - Payment issue
- `feature_update.ejs` - New feature

## 🎨 Customizing Email Templates

1. Edit template files in `backend/templates/emails/`
2. Templates use EJS syntax:
   ```ejs
   <h1>Hello <%= name %>!</h1>
   <p>You have <%= daysLeft %> days left in your trial.</p>
   ```
3. Available variables are passed in `templateData` in `emailService.js`

## 🔍 Monitoring & Logs

### Check Email Logs

All emails are logged in MongoDB:

```javascript
// Via API
GET /api/admin/email-logs

// Direct MongoDB query
db.emaillogs.find({ status: "sent" }).sort({ sentAt: -1 })
```

### Email Status

- `pending` - Email queued
- `sent` - Email sent successfully
- `failed` - Email failed to send

### Resend Dashboard

1. Go to [resend.com/dashboard](https://resend.com/dashboard)
2. View **Activity** tab for:
   - Sent emails
   - Delivery status
   - Open rates (if enabled)
   - Click rates (if enabled)

## 🛠️ Troubleshooting

### Issue: "RESEND_API_KEY not found"

**Solution:**
1. Check `.env` file has `RESEND_API_KEY=re_...`
2. Restart the server after adding the key
3. Verify the key starts with `re_`

### Issue: "Email service not initialized"

**Solution:**
1. Check API key is valid in Resend dashboard
2. Verify API key format (should start with `re_`)
3. Check server logs for specific error

### Issue: Emails not sending

**Solution:**
1. Check Resend dashboard for error messages
2. Verify `EMAIL_FROM` is correct:
   - Testing: Use `onboarding@resend.dev`
   - Production: Use verified domain
3. Check email logs in database
4. Verify user hasn't unsubscribed

### Issue: Domain verification failed

**Solution:**
1. Check DNS records are added correctly
2. Wait 15-30 minutes for DNS propagation
3. Verify records using DNS checker tools
4. Contact Resend support if issues persist

## 📈 Usage Limits & Best Practices

### Free Tier Limits
- **3,000 emails/month** - Perfect for startups
- **100 emails/day** - Good for gradual growth
- **No credit card** - Truly free

### Best Practices

1. **Monitor Usage**
   - Check Resend dashboard regularly
   - Set up usage alerts
   - Track email logs

2. **Email Deliverability**
   - Use verified domain in production
   - Avoid spam trigger words
   - Include unsubscribe link
   - Monitor bounce rates

3. **User Experience**
   - Personalize with user name
   - Provide value in every email
   - Clear call-to-action
   - Mobile-responsive design

4. **Legal Compliance**
   - Include unsubscribe link
   - Honor user preferences
   - Follow CAN-SPAM Act
   - GDPR compliance (EU users)

## 🚀 Production Checklist

- [ ] Sign up for Resend account
- [ ] Get API key and add to `.env`
- [ ] Verify your domain in Resend
- [ ] Update `EMAIL_FROM` to use verified domain
- [ ] Test welcome email
- [ ] Test onboarding sequence
- [ ] Monitor email logs
- [ ] Set up usage alerts
- [ ] Configure unsubscribe page on frontend
- [ ] Test email preferences functionality

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

## 🎉 You're All Set!

Your email automation system is now fully operational with Resend! Users will automatically receive:

- ✅ Welcome emails on signup
- ✅ Onboarding sequence over 7 days
- ✅ Trial expiry reminders
- ✅ Milestone celebrations
- ✅ Re-engagement campaigns
- ✅ All critical notifications

**Questions?** Check the troubleshooting section or review the code comments in `backend/services/emailService.js`.

---

**Last Updated:** December 2024
**Resend SDK Version:** Latest
**Status:** ✅ Production Ready

