# 📧 Email Automation System - Complete Setup Guide

## 🎯 Overview

This guide covers the complete setup of the automated email system for Engagematic using **Resend** (100% FREE for up to 3,000 emails/month).

## ✅ Features Implemented

### 1. **Welcome Sequence**
- ✅ Day 0: Instant welcome email on signup
- ✅ Day 1: First post creation guide
- ✅ Day 3: Content strategy education
- ✅ Day 5: Advanced features unlock
- ✅ Day 7: Weekly success report

### 2. **Trial Management**
- ✅ 7 days before expiry reminder
- ✅ 3 days before expiry reminder
- ✅ 1 day before expiry reminder
- ✅ Trial expired notification

### 3. **User Engagement**
- ✅ 7-day inactivity re-engagement
- ✅ 14-day inactivity re-engagement
- ✅ 30-day inactivity with special offers

### 4. **Milestone Celebrations**
- ✅ 10 posts milestone
- ✅ 50 posts milestone
- ✅ 100 posts milestone

### 5. **Business Critical**
- ✅ Upgrade prompts (value-based)
- ✅ Payment failed notifications
- ✅ Feature update announcements

### 6. **User Preferences**
- ✅ Granular email preferences
- ✅ One-click unsubscribe
- ✅ Preference management dashboard
- ✅ Email bounce tracking

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Sign Up for Resend (FREE)

1. Go to [resend.com](https://resend.com)
2. Create a free account
3. Verify your email
4. Navigate to **API Keys** section
5. Click **Create API Key**
6. Copy your API key

### Step 2: Configure Environment Variables

Add to your `backend/.env` file:

```env
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Engagematic

# Frontend URL (for unsubscribe links)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Verify Domain (Production Only)

For production, verify your domain in Resend:

1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `linkedinpulse.com`)
4. Add the DNS records provided by Resend
5. Wait for verification (usually takes a few minutes)

### Step 4: Start the Server

```bash
cd backend
npm start
```

You should see:
```
✅ Email service initialized with Resend
✅ Onboarding emails scheduled (every 6 hours)
✅ Trial expiry reminders scheduled (daily at 9 AM)
✅ Re-engagement emails scheduled (daily at 10 AM)
✅ Milestone checks scheduled (every 6 hours)
📧 Email scheduler started successfully
```

---

## 📊 Email Schedule Overview

| Email Type | Trigger | Frequency | Time |
|------------|---------|-----------|------|
| Welcome | User signup | Instant | Immediate |
| Onboarding Day 1 | 24h after signup | Check every 6h | Various |
| Onboarding Day 3 | 72h after signup | Check every 6h | Various |
| Onboarding Day 5 | 120h after signup | Check every 6h | Various |
| Onboarding Day 7 | 168h after signup | Check every 6h | Various |
| Trial Expiry (7d) | 7 days before | Daily | 9:00 AM |
| Trial Expiry (3d) | 3 days before | Daily | 9:00 AM |
| Trial Expiry (1d) | 1 day before | Daily | 9:00 AM |
| Trial Expired | On expiry date | Daily | 9:00 AM |
| Re-engagement (7d) | 7 days inactive | Daily | 10:00 AM |
| Re-engagement (14d) | 14 days inactive | Daily | 10:00 AM |
| Re-engagement (30d) | 30 days inactive | Daily | 10:00 AM |
| Milestone | Post count milestone | Check every 6h | Various |

---

## 🧪 Testing Your Setup

### Test Welcome Email

```bash
# Method 1: Register a new user via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Method 2: Use the test endpoint (requires authentication)
curl -X POST http://localhost:5000/api/email/test/welcome \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check Email Logs

```javascript
// In MongoDB or via API
db.emaillogs.find({ emailType: "welcome" }).sort({ createdAt: -1 }).limit(10)
```

### Test Unsubscribe Flow

1. Check your inbox for any email
2. Click the "Unsubscribe" link at the bottom
3. You'll be redirected to the preferences page
4. Modify your email preferences

---

## 📁 File Structure

```
backend/
├── models/
│   ├── EmailLog.js              # Email history tracking
│   └── EmailPreference.js       # User email preferences
├── services/
│   ├── emailService.js          # Core email sending logic
│   └── emailScheduler.js        # Cron jobs & automation
├── templates/
│   └── emails/
│       ├── welcome.ejs
│       ├── onboarding_day1.ejs
│       ├── onboarding_day3.ejs
│       ├── onboarding_day5.ejs
│       ├── onboarding_day7.ejs
│       ├── milestone.ejs
│       ├── trial_expiry.ejs
│       ├── trial_expired.ejs
│       ├── reengagement.ejs
│       ├── upgrade.ejs
│       ├── payment_failed.ejs
│       └── feature_update.ejs
└── routes/
    ├── email.js                 # Email API endpoints
    └── auth.js                  # Updated with email trigger
```

---

## 🔧 API Endpoints

### User Endpoints

#### Get Email Preferences (Authenticated)
```http
GET /api/email/my-preferences
Authorization: Bearer <token>
```

#### Update Email Preferences (Authenticated)
```http
POST /api/email/my-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "marketing": true,
    "onboarding": true,
    "milestones": true,
    "trialReminders": true,
    "reengagement": false,
    "upgradePrompts": true,
    "transactional": true,
    "featureUpdates": true
  }
}
```

### Public Endpoints (Token-Based)

#### Get Preferences by Token
```http
GET /api/email/preferences/:token
```

#### Update Preferences by Token
```http
POST /api/email/preferences/:token
Content-Type: application/json

{
  "preferences": {
    "marketing": false,
    "featureUpdates": false
  }
}
```

#### Unsubscribe from All
```http
POST /api/email/unsubscribe/:token
```

#### Resubscribe
```http
POST /api/email/resubscribe/:token
```

### Admin/Test Endpoints

#### Get Scheduler Status
```http
GET /api/email/scheduler/status
Authorization: Bearer <token>
```

#### Send Test Welcome Email
```http
POST /api/email/test/welcome
Authorization: Bearer <token>
```

---

## 🎨 Customizing Email Templates

All templates are in `backend/templates/emails/` and use EJS templating.

### Available Template Variables

**Common to all templates:**
- `name` - User's name
- `unsubscribeUrl` - Unsubscribe link
- `preferencesUrl` - Preferences management link
- `currentYear` - Current year for copyright
- `process.env.FRONTEND_URL` - Your frontend URL

**Template-specific:**

**Welcome Email:**
- `trialDays` - Days remaining in trial

**Onboarding:**
- Day-specific content and tips

**Trial Expiry:**
- `daysLeft` - Days until trial expires
- `trialEndDate` - Trial expiration date

**Milestone:**
- `postCount` - Number of posts created
- `emoji` - Celebration emoji

**Re-engagement:**
- `daysInactive` - Days since last activity

**Upgrade:**
- `currentPlan` - User's current plan
- `reason` - Reason for upgrade prompt

**Payment Failed:**
- `amount` - Payment amount
- `billingPeriod` - Billing period
- `retryDate` - Next retry date

**Feature Update:**
- `title` - Feature title
- `description` - Feature description
- `benefits` - Array of benefits
- `proTip` - Pro tip text
- `videoUrl` - Optional video URL

### Example: Customize Welcome Email

Edit `backend/templates/emails/welcome.ejs`:

```html
<h2>Hey <%= name %>,</h2>
<p>Your custom welcome message here!</p>
```

---

## 🔥 Advanced Features

### Manual Email Triggers

```javascript
import emailScheduler from './services/emailScheduler.js';

// Send welcome email manually
await emailScheduler.sendWelcomeEmailToUser(userId);

// Send upgrade prompt
await emailScheduler.sendUpgradePromptToUser(userId, 'value_based');

// Broadcast feature update to all users
await emailScheduler.sendFeatureUpdateToAllUsers({
  title: "New AI Model Released",
  description: "GPT-4 Turbo is now available!",
  benefits: [
    {
      title: "Faster Generation",
      description: "Create posts 3x faster"
    }
  ],
  proTip: "Try it with complex topics for best results",
  videoUrl: "https://youtu.be/example"
});
```

### Custom Email Types

Add to `backend/models/EmailLog.js`:

```javascript
enum: [
  // ... existing types
  "your_custom_type",
]
```

Add template mapping in `emailService.js`:

```javascript
const emailTypeMap = {
  // ... existing mappings
  your_custom_type: "customCategory",
};
```

Create template `backend/templates/emails/your_custom.ejs`

---

## 📈 Monitoring & Analytics

### Email Performance Tracking

```javascript
// Get email stats
const stats = await EmailLog.aggregate([
  {
    $group: {
      _id: "$emailType",
      total: { $sum: 1 },
      sent: {
        $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] }
      },
      failed: {
        $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
      }
    }
  }
]);
```

### Monitor Bounces

```javascript
// Get users with high bounce rates
const bouncedUsers = await EmailPreference.find({
  bounceCount: { $gte: 3 }
});
```

### Track Opens & Clicks (Future Enhancement)

Resend supports webhooks for open/click tracking. Add webhook endpoint:

```javascript
router.post("/webhook/resend", async (req, res) => {
  const { type, data } = req.body;
  
  if (type === "email.opened") {
    await EmailLog.findOneAndUpdate(
      { providerId: data.email_id },
      { openedAt: new Date() }
    );
  }
  
  res.json({ received: true });
});
```

---

## 🚨 Troubleshooting

### Email Service Not Initializing

**Error:** `⚠️ RESEND_API_KEY not found`

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify `RESEND_API_KEY` is set correctly
3. Restart the server

### Emails Not Sending

**Check 1: Service Status**
```bash
curl http://localhost:5000/api/email/scheduler/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check 2: Email Logs**
```javascript
db.emaillogs.find({ status: "failed" }).sort({ createdAt: -1 })
```

**Check 3: User Preferences**
```javascript
// Check if user has unsubscribed
db.emailpreferences.findOne({ userId: ObjectId("USER_ID") })
```

### Scheduler Not Running

**Symptoms:** Emails aren't sent at scheduled times

**Solutions:**
1. Check server logs for scheduler initialization
2. Verify server timezone matches expected schedule
3. Ensure server is running continuously (use PM2 in production)

### Domain Verification Issues

**For production:** Emails may go to spam without domain verification

**Solution:**
1. Verify domain in Resend dashboard
2. Add SPF, DKIM, and DMARC records to DNS
3. Wait 24-48 hours for DNS propagation
4. Send test email to check spam score

---

## 🌐 Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
RESEND_API_KEY=re_live_xxxxxxxxxxxxx
EMAIL_FROM=noreply@engagematic.com
EMAIL_FROM_NAME=Engagematic
FRONTEND_URL=https://linkedinpulse.com
```

### Using PM2 for Persistence

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server.js --name linkedinpulse-api

# Enable startup on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs linkedinpulse-api
```

### Rate Limiting

Resend free tier: **3,000 emails/month**

**Calculation:**
- 100 new signups/month = 500 emails (welcome + 4 onboarding)
- 50 trial expiries = 200 emails (4 reminders each)
- 30 re-engagement = 30 emails
- Total: ~730 emails/month

You're well within the limit! 🎉

---

## 💡 Best Practices

### 1. Email Deliverability
- ✅ Use verified domain
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link
- ✅ Monitor bounce rates
- ✅ Clean inactive emails

### 2. User Experience
- ✅ Personalize with user name
- ✅ Provide value in every email
- ✅ Clear call-to-action
- ✅ Mobile-responsive design
- ✅ Easy preference management

### 3. Legal Compliance
- ✅ CAN-SPAM Act compliance
- ✅ GDPR compliance (EU users)
- ✅ Clear unsubscribe mechanism
- ✅ Privacy policy linked
- ✅ Transactional vs. marketing distinction

### 4. Performance
- ✅ Non-blocking email sends
- ✅ Queue for bulk sends
- ✅ Retry failed sends
- ✅ Log all email activity
- ✅ Monitor scheduler health

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)
- [EJS Template Engine](https://ejs.co/)

---

## 🎉 You're All Set!

Your email automation system is now fully operational. Users will automatically receive:

- ✅ Welcome emails on signup
- ✅ Onboarding sequence over 7 days
- ✅ Trial expiry reminders
- ✅ Milestone celebrations
- ✅ Re-engagement campaigns
- ✅ All critical notifications

**Questions or issues?** Check the troubleshooting section or review the code comments.

---

## 📝 Changelog

**v1.0.0** - Initial Release
- Complete email automation system
- 8 email flow types
- Resend integration
- User preference management
- Comprehensive logging
- Cron-based scheduling

---

**Built with ❤️ for Engagematic**

