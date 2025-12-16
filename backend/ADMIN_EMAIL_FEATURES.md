# 📧 Admin Email Features - Complete Guide

## 🎯 Overview

Admin email features allow you to send reminder, onboarding, and custom emails to users directly from the admin panel. You can also send bulk emails to all users or specific segments.

## ✅ Features Implemented

### 1. **Send Reminder Emails**
Send personalized reminder emails to specific users or groups of users.

### 2. **Send Onboarding Emails**
Manually trigger onboarding emails (Day 1, 3, 5, or 7) to specific users.

### 3. **Send Custom Emails**
Send fully customized emails with your own subject and content to specific users.

### 4. **Bulk Email Campaigns**
Send emails to all users or specific audience segments (inactive users, trial expiring, high performers, new users).

### 5. **Early Professionals Campaign**
Specialized email template and endpoint for sending to all users about early professionals use case.

## 🚀 API Endpoints

All endpoints require **Admin Authentication** (Bearer token with admin privileges).

### Base URL
```
/api/admin
```

### 1. Send Reminder Email

**Endpoint:** `POST /api/admin/send-reminder`

**Request Body:**
```json
{
  "userId": "user_id_here",           // Single user (optional)
  "userIds": ["id1", "id2"],           // Multiple users (optional)
  "subject": "Reminder: Complete your profile",
  "message": "Don't forget to complete your profile setup..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder email(s) sent successfully",
  "sentCount": 2,
  "totalUsers": 2,
  "errors": []
}
```

### 2. Send Onboarding Email

**Endpoint:** `POST /api/admin/send-onboarding`

**Request Body:**
```json
{
  "userId": "user_id_here",           // Single user (optional)
  "userIds": ["id1", "id2"],         // Multiple users (optional)
  "day": 1                            // Must be 1, 3, 5, or 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding email(s) sent successfully",
  "sentCount": 2,
  "totalUsers": 2,
  "errors": []
}
```

### 3. Send Custom Email

**Endpoint:** `POST /api/admin/send-custom`

**Request Body:**
```json
{
  "userId": "user_id_here",           // Single user (optional)
  "userIds": ["id1", "id2"],         // Multiple users (optional)
  "subject": "Custom Email Subject",
  "content": "Your custom email content here...",
  "templateName": "custom"            // Optional, defaults to "custom"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom email(s) sent successfully",
  "sentCount": 2,
  "totalUsers": 2,
  "errors": []
}
```

### 4. Send Bulk Email

**Endpoint:** `POST /api/admin/send-bulk-email`

**Request Body:**
```json
{
  "subject": "Important Update",
  "content": "Your email content here...",
  "targetAudience": "all_users",      // Options: "all_users", "inactive_users", "trial_expiring", "high_performers", "new_users"
  "scheduledAt": null                 // Optional, for future scheduling
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk email sent successfully",
  "sentCount": 150,
  "totalUsers": 150,
  "errors": []
}
```

### 5. Send Early Professionals Email (All Users)

**Endpoint:** `POST /api/admin/send-early-professionals`

**Request Body:**
```json
{
  "limit": 100,                       // Optional: limit number of users
  "skip": 0                           // Optional: skip first N users (for pagination)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Early professionals email sent successfully",
  "sentCount": 150,
  "totalUsers": 150,
  "errorCount": 0,
  "errors": []
}
```

## 📋 Email Templates

### Available Templates

1. **custom.ejs** - Generic custom email template
2. **early_professionals.ejs** - Specialized template for early professionals use case
3. **welcome.ejs** - Welcome email template
4. **onboarding_day1.ejs** - Day 1 onboarding
5. **onboarding_day3.ejs** - Day 3 onboarding
6. **onboarding_day5.ejs** - Day 5 onboarding
7. **onboarding_day7.ejs** - Day 7 onboarding
8. **reengagement.ejs** - Re-engagement email
9. **trial_expiry.ejs** - Trial expiry reminder
10. **milestone.ejs** - Milestone celebration

### Template Location
```
backend/templates/emails/
```

## 🛠️ Usage Examples

### Example 1: Send Reminder to Single User

```bash
curl -X POST http://localhost:5000/api/admin/send-reminder \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "subject": "Complete Your Profile",
    "message": "Hi! Don't forget to complete your profile to unlock all features."
  }'
```

### Example 2: Send Onboarding Day 1 to Multiple Users

```bash
curl -X POST http://localhost:5000/api/admin/send-onboarding \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "day": 1
  }'
```

### Example 3: Send Custom Email

```bash
curl -X POST http://localhost:5000/api/admin/send-custom \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "subject": "Special Offer Just for You!",
    "content": "We have an exclusive offer for you..."
  }'
```

### Example 4: Send Early Professionals Email to All Users

```bash
curl -X POST http://localhost:5000/api/admin/send-early-professionals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📜 Script Usage

### Send Early Professionals Email via Script

You can also use the standalone script to send emails:

```bash
cd backend
node scripts/sendEarlyProfessionalsEmail.js
```

This script will:
- Connect to MongoDB
- Initialize email service
- Find all active users (respecting email preferences)
- Send early professionals email to all users
- Show progress and summary

## 🔐 Authentication

All admin email endpoints require admin authentication:

1. **Login as Admin:**
   ```bash
   curl -X POST http://localhost:5000/api/admin-auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "password"
     }'
   ```

2. **Use the token in requests:**
   ```bash
   Authorization: Bearer YOUR_ADMIN_TOKEN
   ```

## 📊 Email Analytics

### Get Email Analytics

**Endpoint:** `GET /api/admin/email-analytics`

Returns:
- Total emails sent
- Open rates
- Click rates
- Bounce rates
- Recent email logs

### Get Email Metrics

**Endpoint:** `GET /api/admin/email-metrics?period=30d`

Returns detailed metrics by email type and daily volume.

## ⚙️ Configuration

### Email Service Setup

Make sure your `.env` file has:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LinkedInPulse
FRONTEND_URL=http://localhost:3000
```

## 🎯 Best Practices

1. **Rate Limiting:** The bulk email endpoint includes delays to avoid overwhelming the email service
2. **Error Handling:** Always check the `errors` array in responses
3. **User Preferences:** Emails respect user email preferences (won't send to opted-out users)
4. **Testing:** Test with a single user before sending to all users
5. **Pagination:** Use `limit` and `skip` for large user bases

## 🚨 Troubleshooting

### Issue: "Email service not initialized"

**Solution:**
1. Check `RESEND_API_KEY` in `.env`
2. Restart the backend server
3. Verify Resend API key is valid

### Issue: "No users found"

**Solution:**
1. Check if users exist in database
2. Verify email preferences (users with `emailPreferences: "none"` are excluded)
3. Check MongoDB connection

### Issue: "Failed to send email"

**Solution:**
1. Check Resend dashboard for errors
2. Verify email addresses are valid
3. Check email service logs
4. Ensure domain is verified in Resend (for production)

## 📝 Notes

- All emails include unsubscribe links
- Email preferences are respected automatically
- Failed emails are logged in `EmailLog` collection
- Bulk emails include progress logging
- Scripts can be run independently for batch operations

## 🎉 Success!

You now have full control over sending emails to your users from the admin panel!

---

**Questions?** Check the code comments or review the email service implementation in `backend/services/emailService.js`.

